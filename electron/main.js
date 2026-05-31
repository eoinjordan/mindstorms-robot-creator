#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Electron main process - Mindstorms Robot Creator desktop app.
 *
 * Starts the local action server (server.js), waits for it to be healthy,
 * then opens the web-app/index.html in a Chromium window.
 *
 * The server and the UI share the same Node runtime, so no internet
 * connection is needed. Works fully offline for code generation and
 * .lms download. Builder sessions and server-based features require
 * the packaged server (auto-started).
 */

const { app, BrowserWindow, shell, Menu, dialog } = require("electron");
const path = require("node:path");
const { fork } = require("node:child_process");
const http = require("node:http");

const SERVER_PORT = Number(process.env.PORT || 3095);
const SERVER_HOST = "127.0.0.1";

let mainWindow = null;
let serverProcess = null;

// ─── Server lifecycle ─────────────────────────────────────────────────────────

function startServer() {
  // Resolve from the app root so dev builds and packaged app.asar builds match.
  const appRoot = app.isPackaged ? app.getAppPath() : path.join(__dirname, "..");
  const serverPath = path.join(appRoot, "server.js");

  serverProcess = fork(serverPath, [], {
    cwd: appRoot,
    env: { ...process.env, PORT: String(SERVER_PORT), HOST: SERVER_HOST },
    silent: false
  });

  serverProcess.on("error", (err) => console.error("[server] error:", err.message));
  serverProcess.on("exit", (code) => console.log("[server] exited with code", code));
}

function waitForServer(retries = 30, intervalMs = 400) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = http.get(
        `http://${SERVER_HOST}:${SERVER_PORT}/health`,
        (res) => {
          if (res.statusCode === 200) { resolve(); }
          else if (remaining > 0) { setTimeout(() => attempt(remaining - 1), intervalMs); }
          else { reject(new Error("Server health check timed out")); }
        }
      );
      req.on("error", () => {
        if (remaining > 0) { setTimeout(() => attempt(remaining - 1), intervalMs); }
        else { reject(new Error("Server did not start in time")); }
      });
      req.setTimeout(300, () => req.destroy());
    };
    attempt(retries);
  });
}

function killServer() {
  if (serverProcess) {
    try { serverProcess.kill("SIGTERM"); } catch (_) {}
    serverProcess = null;
  }
}

// ─── Window ───────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Mindstorms Robot Creator",
    backgroundColor: "#172026",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Allow Web Serial API (requires chrome flag in older Electron versions)
      // Electron 28+ exposes Web Serial without flags.
    }
  });

  // Open external links in the OS browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  const appRoot = app.isPackaged ? app.getAppPath() : path.join(__dirname, "..");
  const indexPath = path.join(appRoot, "web-app", "index.html");

  mainWindow.loadFile(indexPath);
  mainWindow.on("closed", () => { mainWindow = null; });
}

function buildMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Developer",
      submenu: [
        { role: "toggleDevTools" },
        {
          label: "Server Status",
          click: async () => {
            try {
              const res = await fetch(`http://${SERVER_HOST}:${SERVER_PORT}/health`);
              const json = await res.json();
              dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "Server Status",
                message: JSON.stringify(json, null, 2)
              });
            } catch (err) {
              dialog.showErrorBox("Server Status", `Server not reachable: ${err.message}`);
            }
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  buildMenu();
  startServer();

  try {
    await waitForServer();
    console.log(`[electron] server ready on port ${SERVER_PORT}`);
  } catch (err) {
    console.warn("[electron] server not ready, loading UI anyway:", err.message);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  killServer();
  app.quit();
});

app.on("before-quit", killServer);
