# Agent Guide

This repo is a local-first robotics project for LEGO MINDSTORMS generations, SPIKE/Robot Inventor hubs, and M5Stack LEGO motor hardware. Agents should treat it as a buildable engineering repo, not just a note collection.

## What This Project Is

- A local action server in `server.js` for robot discovery, probing, classification, dataset export, and later code/model deployment.
- A human-in-the-loop builder/debugger so agents can help kids and users run one safe robot test, record what happened, and choose the next fix.
- A hardware-adapter layer under `adapters/` so each robot family hides its transport quirks behind one contract.
- Shared JSON schemas under `schemas/` for robot profiles, probe sessions, code targets, and builder sessions.
- Seed simulated profiles under `examples/profiles/` for testing without hardware.
- Future Android app and hardware firmware work driven by the same profile and probe-session formats.

The first vertical slice is **Robot Inventor 51515 + Android + local MCP/action server**.

## Read These First

Use this order when working in the repo:

1. `README.md` for product direction and current scaffold.
2. `AGENTS.md` for agent operating rules.
3. `MCP_SERVER.md` for local tool/API usage.
4. `docs/CLI.md` before changing agent command workflows.
5. `docs/HUMAN_IN_THE_LOOP_BUILDER.md` before changing builder/debug workflows.
6. `docs/KID_SAFE_DEBUGGING.md` before adding child-facing tests or instructions.
7. `docs/ANDROID_APP.md` and `docs/ANDROID_BUILDER_DESIGN.md` before changing the Android app.
8. `docs/ADAPTERS.md` before touching hardware code.
9. `docs/DATA_AND_MODELS.md` before changing schemas, classifier logic, or model deployment.
10. `docs/CODE_GENERATION.md` before adding generated program templates.
11. `docs/ROADMAP.md` for milestone order.
12. `docs/OFFICIAL_LEGO_CLIENT.md` before integrating with the official LEGO client.

## Current Commands

Run syntax checks:

```powershell
node --check server.js
node --check cli.js
node --check test-apps\builder-console\app.js
node --check adapters\m5stack-basex.js
node --check scripts\smoke.js
```

Run the Node test suite:

```powershell
node --test tests/*.test.js
```

Run the simulated probe/classify loop:

```powershell
node scripts\smoke.js
```

Start the local action server:

```powershell
node server.js
node cli.js server
```

Call actions without HTTP:

```powershell
node cli.js actions
node cli.js scan --plain
node cli.js builder start 51515-blast --goal "make Blast wave safely" --audience kid --plain
```

Call the server over HTTP:

```powershell
curl.exe -s http://127.0.0.1:3095/health
curl.exe -s http://127.0.0.1:3095/ready
curl.exe -s http://127.0.0.1:3095/actions
```

PowerShell may block `npm.ps1` on this machine. Prefer direct `node ...` commands unless npm has already been confirmed usable in the current shell.

## Agent Workflow

For most changes:

1. Identify which layer is being changed: server, adapter, schema, Android, model, generated code, or docs.
2. Read the matching doc under `docs/`.
3. Keep changes narrow and schema-compatible.
4. Add or update a simulated profile or smoke fixture if behavior changes.
5. Run `node scripts\smoke.js`.
6. Update docs when tool names, schemas, safety limits, or milestone status changes.

## Safety Rules

- Motor probing must start simulated unless the user explicitly asks for real hardware behavior.
- Human-in-the-loop builder sessions should propose one safe test, wait for user observation, then suggest one next change.
- For kids and classrooms, prefer the official LEGO client handoff or simulation before direct motor control.
- Real motor routines must include low duty limits, short duration, immediate stop, and user abort.
- Never add a probe that intentionally drives into a hard stop without cutoff logic.
- Keep network services bound to `127.0.0.1` by default.
- Do not upload probe data, photos, or model artifacts to cloud services unless the user explicitly requests it and credentials are configured.
- Do not modify or delete `PDF_manuals/` unless the user specifically asks.
- Do not introduce generated code that bypasses profile capability checks.
- Treat the official LEGO client as a manual handoff/status surface unless the user explicitly asks for GUI automation.

## Source Of Truth

- Robot definitions: `schemas/robot-profile.schema.json` and `examples/profiles/*.json`
- Probe data: `schemas/probe-session.schema.json`
- Builder sessions: `schemas/builder-session.schema.json`
- Code target requests: `schemas/code-target.schema.json`
- Available server actions: `server.js` and `MCP_SERVER.md`
- CLI command surface: `cli.js` and `docs/CLI.md`
- Test app: `test-apps/builder-console/`
- Hardware adapter contract: `docs/ADAPTERS.md`

## Current Scaffold Status

Implemented:

- local action server
- no-server CLI action runner
- browser builder-console test app
- Node tests for action and CLI flows
- simulated M5Stack BaseX adapter
- first 51515 profiles for Blast, Charlie, Gelo, M.V.P., and Tricky
- first Android app scaffold for browsing 51515 profiles and running a simulated probe
- probe plan creation
- simulated probe running
- heuristic robot classification
- dataset export formats
- human-in-the-loop builder session actions
- official LEGO client handoff action
- seed profiles for gripper, tracked vehicle, and two-wheel drive

Next engineering work:

- Robot Inventor BLE/Pybricks connection path
- real 51515 probe session capture
- confirmed Charlie port map from physical/app test
- Android app import/export and BLE connection screens
- official LEGO client handoff flow
- Android builder/debug notebook screen
- EV3 Classroom handoff/profile flow
- Edge Impulse ingestion/export workflow
- stdio MCP adapter over the local action server
