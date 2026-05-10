# Mindstorms Robot Creator

Build, code, and connect LEGO MINDSTORMS robots. Works in the browser, as a desktop app, on Android, and as an AI agent tool.

**[Live Web App](https://eoinjordan.github.io/mindstorms-robot-creator/)** | **[Android APK](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest/download/mindstorms-ai-creator-latest-debug.apk)** | **[Android Repo](https://github.com/eoinjordan/mindstorms-robot-creator-android)**

[![npm](https://img.shields.io/npm/v/mindstorms-robot-creator?label=npm&color=teal)](https://www.npmjs.com/package/mindstorms-robot-creator)
[![GitHub release](https://img.shields.io/github/v/release/eoinjordan/mindstorms-robot-creator?label=release)](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest)
[![Android CI](https://img.shields.io/github/actions/workflow/status/eoinjordan/mindstorms-robot-creator-android/build.yml?branch=main&label=android%20build)](https://github.com/eoinjordan/mindstorms-robot-creator-android/actions)
[![Pages](https://img.shields.io/github/deployments/eoinjordan/mindstorms-robot-creator/github-pages?label=pages)](https://eoinjordan.github.io/mindstorms-robot-creator/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![F-Droid](https://img.shields.io/badge/F--Droid-submission%20pending-green)](fdroid/com.eoinedge.robotinventor.yml)

---

## Download

| Platform | Link |
|---|---|
| **Windows** (.exe) | [mindstorms-robot-creator-setup.exe](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest) |
| **macOS** (.dmg) | [GitHub Releases](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest) |
| **Linux** (.AppImage) | [GitHub Releases](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest) |
| **Android** APK | [mindstorms-ai-creator-latest-debug.apk](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest/download/mindstorms-ai-creator-latest-debug.apk) |
| **Browser** | [eoinjordan.github.io/mindstorms-robot-creator](https://eoinjordan.github.io/mindstorms-robot-creator/) |

---

![Code generator](screencaps/demos/code-beep-hello.png)

---

## What it does

**Code Generator:** Pick a robot and an action (beep, probe, drive, wave). Get runnable code in Pybricks, LEGO Stock Python, ev3dev, NXT-Python, or NQC depending on the generation. Download as `.lms`, `.py`, or `.nqc`.

**Builder:** Step through one safe test at a time. Generate code, run it, record what happened, get the next suggestion.

**Connect:** Bluetooth (BLE) or USB Web Serial. Works with stock LEGO firmware via LWP3 and with Pybricks for a full Python REPL.

**Voice control:** Load an Edge Impulse keyword-spotting model and trigger robot actions by voice in the browser.

---

## Hardware generations

| Generation | Connection |
|---|---|
| Robot Inventor 51515 | BLE or USB (Pybricks / LWP3) |
| SPIKE Prime | BLE or USB |
| EV3 31313 | USB, Bluetooth, Wi-Fi |
| NXT 1.0 / 2.0 | Bluetooth Classic or USB |
| RCX | Infrared tower |

---

## Screenshots

| Code tab | Connect tab |
|---|---|
| ![Code](screencaps/demos/code-safe-probe.png) | ![Connect](screencaps/demos/connect-ble-section.png) |

| Builder tab | Voice tab |
|---|---|
| ![Builder](screencaps/demos/builder-observation.png) | ![Voice](screencaps/demos/voice-overview.png) |

---

## Quick start

### Browser

```bash
npx serve web-app
```

Open http://localhost:3000 in Chrome or Edge. Or use the hosted version at https://eoinjordan.github.io/mindstorms-robot-creator/

### Desktop app

Download the installer from [Releases](https://github.com/eoinjordan/mindstorms-robot-creator/releases), or build locally:

```bash
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

### Android

Install the current APK from [this release download](https://github.com/eoinjordan/mindstorms-robot-creator/releases/latest/download/mindstorms-ai-creator-latest-debug.apk). Artifact metadata is tracked in `releases/android/README.md`.

The public Android repo is [mindstorms-robot-creator-android](https://github.com/eoinjordan/mindstorms-robot-creator-android), package `com.eoinedge.robotinventor`.

Built with Kotlin and Jetpack Compose, with BLE and USB transport, session history, and voice keyword spotting. F-Droid submission pending.

---

## MCP server

For use with AI agents (Claude Desktop, VS Code Copilot, Cursor):

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

### Tools

| Tool | Description |
|---|---|
| `robot_scan` | List robot profiles |
| `robot_describe` | Port map, motors, sensors, capabilities |
| `robot_classify` | Classify probe telemetry into a morphology |
| `builder_session_start` | Start a builder session |
| `builder_session_append` | Record an observation |
| `builder_session_summary` | Summarize and suggest next step |
| `official_client_handoff` | Steps for the LEGO or Pybricks app |
| `probe_plan_create` | Generate a safe probe plan |
| `probe_run` | Run a probe and capture telemetry |
| `dataset_export` | Export as Edge Impulse JSON/CSV |
| `code_generate` | Generate robot code |
| `lms_write` | Create a `.lms` project file |
| `lms_read` | Read an `.lms` file |

---

## Compatibility And License

This is an independent project. It is not an official LEGO or Pybricks product, and it does not bundle Pybricks firmware, LEGO firmware, or paid third-party coding tools. It generates compatible code and handoff steps for user-selected runtimes.

Project code is MIT licensed. See [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), and [Compatibility And Licensing](docs/COMPATIBILITY_AND_LICENSING.md).
