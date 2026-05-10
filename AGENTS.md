# Agent Guide

Local robotics project for LEGO MINDSTORMS (RCX, NXT, EV3, SPIKE Prime, Robot Inventor 51515) and M5Stack LEGO motor hardware.

## Project layout

- `server.js` - action server: robot discovery, probing, classification, code generation, dataset export
- `adapters/` - hardware transport layer, one interface per robot family
- `schemas/` - JSON schemas for robot profiles, probe sessions, code targets, builder sessions
- `examples/profiles/` - simulated robot profiles for testing without hardware
- `cli.js` - command-line runner, no HTTP required
- `web-app/` - browser app and Electron desktop shell
- `mcp-server.js` - stdio MCP entry point for agent integrations

## Read these first

1. `README.md` - product overview
2. `MCP_SERVER.md` - local server API
3. `docs/CLI.md` - before changing CLI workflows
4. `docs/HUMAN_IN_THE_LOOP_BUILDER.md` - before changing builder/debug logic
5. `docs/KID_SAFE_DEBUGGING.md` - before adding child-facing content
6. `docs/ANDROID_APP.md`, `docs/ANDROID_BUILDER_DESIGN.md` - before changing the Android app
7. `docs/ADAPTERS.md` - before touching hardware adapters
8. `docs/DATA_AND_MODELS.md` - before changing schemas or classifier logic
9. `docs/CODE_GENERATION.md` - before adding code generation templates
10. `docs/ROADMAP.md` - milestone order
11. `docs/OFFICIAL_LEGO_CLIENT.md` - before integrating the official LEGO client

## Commands

Syntax checks:

```powershell
node --check server.js
node --check cli.js
node --check adapters\m5stack-basex.js
```

Tests:

```powershell
node --test tests/*.test.js
```

Simulated probe/classify smoke test:

```powershell
node scripts\smoke.js
```

Run the server:

```powershell
node server.js
```

CLI (no server required):

```powershell
node cli.js scan --plain
node cli.js builder start 51515-blast --goal "make Blast wave safely" --audience kid --plain
```

HTTP (when server is running):

```powershell
curl.exe -s http://127.0.0.1:3095/health
curl.exe -s http://127.0.0.1:3095/actions
```

PowerShell may block `npm.ps1` on this machine. Use direct `node` commands unless npm is confirmed usable.

## Workflow

1. Identify the layer being changed: server, adapter, schema, Android, generated code, or docs.
2. Read the matching doc in `docs/`.
3. Keep changes narrow and schema-compatible.
4. Update or add a simulated profile if behaviour changes.
5. Run `node scripts\smoke.js`.
6. Update docs when tool names, schemas, safety limits, or milestones change.

## Safety rules

- Motor probing starts simulated unless the user explicitly requests real hardware.
- Builder sessions propose one safe test, wait for the user's observation, then suggest one change.
- For kids and classrooms, prefer the official LEGO client handoff or simulation before direct motor control.
- Real motor routines must use low duty limits, short duration, immediate stop, and allow user abort.
- Never drive into a hard stop without cutoff logic.
- Keep network services bound to `127.0.0.1`.
- Do not upload probe data, photos, or model artifacts to cloud services without explicit user request and configured credentials.
- Do not modify `PDF_manuals/` unless asked.
- Do not bypass profile capability checks in generated code.
- Treat the official LEGO client as a manual handoff surface unless GUI automation is explicitly requested.

## Source of truth

| What | Where |
|---|---|
| Robot profiles | `schemas/robot-profile.schema.json`, `examples/profiles/` |
| Probe data | `schemas/probe-session.schema.json` |
| Builder sessions | `schemas/builder-session.schema.json` |
| Code targets | `schemas/code-target.schema.json` |
| Server actions | `server.js`, `MCP_SERVER.md` |
| CLI surface | `cli.js`, `docs/CLI.md` |
| Hardware adapters | `docs/ADAPTERS.md` |

## Status

Done:

- Action server and no-server CLI runner
- 13 robot profiles across all MINDSTORMS generations (51515, EV3, NXT, RCX)
- Code generation for pybricks-python, lego-stock-python, pybricks-ev3, ev3dev-python, nxt-python, rcx-nqc
- Generation filter UI in the web app
- Probe plan creation and simulated probe running
- Robot morphology classification
- Dataset export (Edge Impulse JSON/CSV)
- Builder session actions
- Official LEGO client handoff
- Android app (Kotlin/Compose, BLE/USB, session history, voice KWS)
- Electron desktop app (Windows, macOS, Linux)
- MCP stdio server

Up next:

- Real BLE probe session capture on Robot Inventor
- Confirmed port maps from physical hardware tests
- Android BLE connection screen
- EV3 Classroom handoff flow
- Edge Impulse ingestion workflow
