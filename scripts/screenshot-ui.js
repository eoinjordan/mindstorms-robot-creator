#!/usr/bin/env node
/**
 * screenshot-ui.js
 *
 * Serves the web-app folder over a local HTTP server, opens each tab in a
 * headless Chromium window via Playwright, and saves PNG screenshots to
 * screencaps/ci/ for use in README and release artifacts.
 *
 * Usage (local):
 *   node scripts/screenshot-ui.js
 *
 * Usage (CI — called by GitHub Actions):
 *   node scripts/screenshot-ui.js --out screencaps/ci
 *
 * Prerequisites (installed as devDependencies):
 *   npm install --save-dev playwright-chromium serve
 * Then run once to download the browser binary:
 *   npx playwright install chromium
 */

/* eslint-disable no-console */
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { chromium } = require("playwright-chromium");

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = 7411; // arbitrary free port for the local HTTP file server
const WEB_APP_DIR = path.join(__dirname, "..", "web-app");
const DEFAULT_OUT = path.join(__dirname, "..", "screencaps", "ci");

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const OUT_DIR = outIdx !== -1 ? path.resolve(args[outIdx + 1]) : DEFAULT_OUT;

const TABS = [
  { id: "code",    label: "code-tab",     hash: "" },
  { id: "builder", label: "builder-tab",  hash: "" },
  { id: "connect", label: "connect-tab",  hash: "" },
  { id: "voice",   label: "voice-tab",    hash: "" }
];

const VIEWPORT = { width: 1400, height: 900 };

// ─── Tiny static file server ─────────────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon"
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split("?")[0].split("#")[0];
      if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
      const filePath = path.join(WEB_APP_DIR, urlPath);
      const ext = path.extname(filePath).toLowerCase();

      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      console.log(`[screenshot] serving web-app on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
    server.on("error", reject);
  });
}

// ─── Screenshot loop ──────────────────────────────────────────────────────────

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // Silence console noise from the page (Web Serial not available in Node, etc.)
  page.on("console", () => {});
  page.on("pageerror", () => {});

  const baseUrl = `http://127.0.0.1:${PORT}/index.html`;

  try {
    // Load the page once
    await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 });

    // Wait for the fleet sidebar to populate (JS renders it synchronously on load)
    await page.waitForSelector(".fleet-robot", { timeout: 5000 });

    for (const tab of TABS) {
      // Click the tab button
      await page.click(`[data-tab="${tab.id}"]`);
      // Short settle time for any CSS transitions
      await page.waitForTimeout(300);

      const outFile = path.join(OUT_DIR, `${tab.label}.png`);
      await page.screenshot({ path: outFile, fullPage: false });
      console.log(`[screenshot] saved ${outFile}`);
    }

    // Also capture a full-page shot of the default (code) tab
    await page.click('[data-tab="code"]');
    await page.waitForTimeout(200);
    const fullFile = path.join(OUT_DIR, "full-page.png");
    await page.screenshot({ path: fullFile, fullPage: true });
    console.log(`[screenshot] saved ${fullFile}`);

  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[screenshot] done — ${TABS.length + 1} screenshots in ${OUT_DIR}`);
}

run().catch((err) => {
  console.error("[screenshot] failed:", err.message);
  process.exit(1);
});
