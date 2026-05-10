# Roadmap

This roadmap is ordered by working vertical slices, not by hardware ambition.

## Milestone 0: Repo Scaffold

Status: mostly done.

Done:

- `README.md` direction and architecture.
- `server.js` local action server.
- simulated M5Stack BaseX adapter.
- first Robot Inventor 51515 profiles.
- Android `robot-inventor-app` scaffold.
- JSON schemas for profiles, sessions, and code targets.
- JSON schema for human-in-the-loop builder sessions.
- seed profiles for three morphology classes.
- smoke test for simulated probe/classify loop.
- Node test runner coverage for action and CLI flows.
- browser builder-console test app for early UI validation.
- agent docs and local skill.
- builder session and official LEGO client handoff actions.

Exit criteria:

- `node scripts\smoke.js` classifies all seed profiles correctly.
- Agent docs explain how to extend the repo.

## Milestone 1: Robot Inventor 51515 First App Loop

Goal: use the 51515 kit as the first real hardware path.

Status: Done.

Done:

- Android app (`Mindstorms Robot Creator`) browses Blast, Charlie, Gelo, M.V.P., and Tricky from profile assets.
- `RobotTransport` interface with `SimulatedTransport` and `SpikeBleTransport`.
- `ProbeRunner` Compose dialog with live IMU/encoder graphs, session label/notes, Room database persistence.
- `TelemetryGraph` Canvas composable.
- `SpikeBleTransport` with native BLE scanning.
- Builder Session screen: primary workflow with observations and next-action summaries.
- Code Screen: Integrated Blockly editor and profile-aware Python generator.
- LMS Project Export: Share `.lms` files to the official LEGO app.
- Voice Observations: Hands-free debugging via speech-to-text.

Exit criteria met:
- App loads all five profiles.
- Builder sessions record user observations.
- Python code generated and exported as `.lms`.


## Milestone 2: Real BaseX Telemetry

Goal: collect real motor encoder traces from M5Stack BaseX.

Tasks:

- Arduino firmware template for BaseX.
- JSON line serial protocol.
- host serial adapter.
- real `robot_scan` and `robot_describe`.
- real `probe_run` with emergency stop.
- exported JSONL/CSV/Edge Impulse JSON from a real session.

Exit criteria:

- one real BaseX probe session is recorded and exported.
- simulated tests still pass.

## Milestone 3: Android App Hardware Connection

Goal: Android can run the basic loop against real or bridged hardware.

Status: Mostly Done.

Done:

- Kotlin/Compose app shell in `Mindstorms Robot Creator`.
- Fleet screen: profiles loaded from assets, real BLE scanning.
- Probe Runner screen: live IMU and encoder graphs, session label/notes, Room database.
- `SimulatedTransport`: full fake scan, connect, describe, streaming probe telemetry.
- `SpikeBleTransport`: BLE scanning implementation.
- Builder Session screen: primary screen calling `builder_session_start`, `builder_session_append`, `builder_session_summary`.
- HTTP MCP client to call local action server.

Remaining tasks:
- Direct hub command execution over BLE (Pybricks/LWP3).

Exit criteria met:
- Android app displays robot profiles and probe sessions.
- Android app exports sessions matching `schemas/probe-session.schema.json`.

## Milestone 4: First Model Loop

Goal: train and deploy a simple classifier.

Tasks:

- Edge Impulse upload path.
- small time-series classifier.
- Android or Arduino deployment.
- compare heuristic vs model output.

Exit criteria:

- classifier runs on Android or M5Stack.
- results are logged back into a probe session or evaluation file.

## Milestone 5: EV3 Adapter

Goal: EV3 can be described, probed, and targeted for generated code.

Tasks:

- ev3dev Python telemetry script.
- SSH or service transport.
- EV3 profile examples.
- EV3 code generation template.

Exit criteria:

- EV3 tacho motor session exported in the same schema.

## Milestone 6: SPIKE Prime Generalization

Goal: generalize the 51515 work to SPIKE Prime paths.

Tasks:

- Pybricks profile/code target.
- stock-firmware protocol research adapter.
- firmware path selection in profiles.

Exit criteria:

- one Pybricks-controlled hub session or stock-protocol describe flow.

## Milestone 7: Community Bundles

Goal: users can share useful robot profiles and sessions.

Tasks:

- bundle manifest schema.
- import/export actions.
- hash verification.
- license metadata.

Exit criteria:

- a profile bundle can be exported, imported, and matched locally.
