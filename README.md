# Mindstorms Robot Creator

> Build, code, and control LEGO MINDSTORMS robots with AI.  
> Browser app · Desktop installer · Android app · MCP server

**[🌐 Live Web App](https://eoinjordan.github.io/mindstorms-robot-creator/)** &nbsp;|&nbsp;
**[📱 Android Repo](https://github.com/eoinjordan/mindstorms-robot-creator-android)**

---

[![npm](https://img.shields.io/npm/v/mindstorms-robot-creator?label=npm&color=teal)](https://www.npmjs.com/package/mindstorms-robot-creator)
[![GitHub release](https://img.shields.io/github/v/release/eoinjordan/mindstorms-robot-creator?label=release)](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest)
[![Android CI](https://img.shields.io/github/actions/workflow/status/eoinjordan/mindstorms-robot-creator-android/build.yml?branch=main&label=android%20build)](https://github.com/eoinjordan/mindstorms-robot-creator-android/actions)
[![Pages](https://img.shields.io/github/deployments/eoinjordan/mindstorms-robot-creator/github-pages?label=pages)](https://eoinjordan.github.io/mindstorms-robot-creator/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![F-Droid](https://img.shields.io/badge/F--Droid-submission%20pending-green)](fdroid/com.eoinedge.robotinventor.yml)

---

## ⬇ Download

| Platform | Link |
|---|---|
| **Windows** installer (.exe) | [**⬇ mindstorms-robot-creator-setup.exe**](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest) |
| **macOS** (.dmg) | [⬇ GitHub Releases](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest) |
| **Linux** (.AppImage) | [⬇ GitHub Releases](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest) |
| **Android** APK | [**⬇ app-release.apk**](https://github.com/eoinjordan/mindstorms-robot-creator-android/releases/latest) |
| **npm** (MCP server) | `npx mindstorms-robot-creator` |
| **Browser / PWA** | [eoinjordan.github.io/mindstorms-robot-creator](https://eoinjordan.github.io/mindstorms-robot-creator/) |

---

![Code generator demo](screencaps/demos/code-beep-hello.png)

---

## Features

- **Code Generator** — pick a robot, pick an intent (beep, probe, drive, wave), get Pybricks or LEGO Stock Python in one click. Download as `.lms` file ready to load in the LEGO app.
- **Builder Session** — human-in-the-loop debug loop: propose one safe test, record what happened, get the next suggestion.
- **Connect** — Bluetooth (BLE, recommended) or USB Web Serial. Stock LEGO firmware supported via LWP3; full REPL with Pybricks.
- **Voice KWS** — load an Edge Impulse WebAssembly keyword-spotting model and control the robot by voice.
- **MCP Server** — 14 tools for AI agents (Claude Desktop, VS Code Copilot, Cursor). Zero runtime dependencies.

---

## Screenshots

| Code Generator | Connect via Bluetooth |
|---|---|
| ![Code tab](screencaps/demos/code-safe-probe.png) | ![Connect tab](screencaps/demos/connect-ble-section.png) |

| Builder Session | Voice KWS |
|---|---|
| ![Builder tab](screencaps/demos/builder-observation.png) | ![Voice tab](screencaps/demos/voice-overview.png) |

---

## Quick Start

### Browser / PWA

```bash
npx serve web-app
# then open http://localhost:3000 in Chrome or Edge
```

Or visit the hosted version: **https://eoinjordan.github.io/mindstorms-robot-creator/**

### MCP Server (Claude Desktop / VS Code Copilot)

```bash
npx -y mindstorms-robot-creator
```

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mindstorms-robot-creator": {
      "command": "npx",
      "args": ["-y", "mindstorms-robot-creator"]
    }
  }
}
```

Or in `.vscode/mcp.json`:

```json
{
  "servers": {
    "mindstorms-robot-creator": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server.js"]
    }
  }
}
```

### Desktop App (Windows .exe)

Download the latest installer from [Releases](https://github.com/eoinjordan/mindstorms-robot-creator/releases).

Or build locally:

```bash
npm run electron:build:win
```

---

## MCP Tools

| Tool | Description |
|---|---|
| `robot_scan` | List all available robot profiles |
| `robot_describe` | Get port map, motors, sensors, capabilities |
| `robot_classify` | Classify probe telemetry into a morphology label |
| `builder_session_start` | Start a human-in-the-loop debug session |
| `builder_session_append` | Record an observation or debug note |
| `builder_session_summary` | Summarize session and suggest next action |
| `official_client_handoff` | Get handoff steps for the LEGO or Pybricks app |
| `probe_plan_create` | Generate a safe probing plan |
| `probe_run` | Execute a probe and capture telemetry |
| `dataset_export` | Export sessions as Edge Impulse JSON/CSV |
| `code_generate` | Generate Pybricks or LEGO Stock Python |
| `lms_write` | Create a `.lms` project file |
| `lms_read` | Read and inspect an `.lms` file |

---

## Hardware Support

| Family | Priority | Connection |
|---|---|---|
| Robot Inventor 51515 | 1 | BLE / USB (Pybricks or LWP3) |
| SPIKE Prime | 2 | BLE / USB |
| EV3 | 3 | USB, Bluetooth, Wi-Fi |
| NXT | 4 | Bluetooth Classic / USB |

---

## Android App

The Android companion app is in a separate repo:  
**https://github.com/eoinjordan/mindstorms-robot-creator-android**

- Kotlin + Jetpack Compose (Material 3)
- BLE + USB transport, Room session history, Edge Impulse voice KWS
- F-Droid submission in progress ([metadata](fdroid/com.eoinedge.robotinventor.yml))

---

## npm Publish

```bash
npm login
npm publish --access public
```

The package ships: `server.js`, `mcp-server.js`, `cli.js`, `adapters/`, `schemas/`, `examples/`, `web-app/`.

---

## License

MIT — see [LICENSE](LICENSE)
- **Voice KWS** — load an Edge Impulse WebAssembly keyword-spotting model and control the robot by voice.
