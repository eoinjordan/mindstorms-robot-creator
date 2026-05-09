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

Done:

- Android app (`MindstormsAICreator`) browses Blast, Charlie, Gelo, M.V.P., and Tricky from profile assets.
- `RobotTransport` interface with `SimulatedTransport` and `SpikeBleTransport` skeleton.
- `ProbeRunner` Compose dialog with live IMU/encoder graphs, session label/notes, JSON export.
- `TelemetryGraph` Canvas composable.
- `SpikeBleTransport` skeleton: BLE permissions in manifest, stub scan/connect/probe.

Remaining tasks:

- Confirm Charlie's port map on physical hardware or in the LEGO app.
- Wire Builder Session screen in the Android app (primary workflow screen, see `docs/ANDROID_BUILDER_DESIGN.md`).
- Add Android fake-client unit tests and Compose tests for the Builder Session flow.
- Record or import the first real 51515 probe session.
- Export the session to a file matching `schemas/probe-session.schema.json`.

Exit criteria:

- one real 51515 robot session is recorded or imported.
- one real builder session contains the user's observation and next debugging action.
- Android app still loads all five profiles.
- `node scripts\smoke.js` still passes for simulated fixtures.

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

Done:

- Kotlin/Compose app shell in `MindstormsAICreator`.
- Fleet screen: profiles loaded from assets, simulated/BLE transport toggle.
- Probe Runner screen: live IMU and encoder graphs, session label/notes, JSON export string.
- `SimulatedTransport`: full fake scan, connect, describe, streaming probe telemetry.
- `SpikeBleTransport`: BLE skeleton.

Remaining tasks:

- Builder Session screen: the primary human-in-the-loop screen calling `builder_session_start`, `builder_session_append`, `builder_session_summary`.
- Room database for local profile and session storage.
- HTTP MCP client to call local action server at `http://127.0.0.1:3095`.
- Wire BLE scan to `SpikeBleTransport` so real devices appear in the Fleet list.
- Dataset Capture screen: label, attach notes, export JSONL/Edge Impulse JSON to file.
- Import/export probe sessions compatible with `schemas/probe-session.schema.json`.

Exit criteria:

- Android app can display a robot profile and probe session.
- Android app can export a session matching `schemas/probe-session.schema.json`.

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
