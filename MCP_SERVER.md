# MCP Server Notes

This repo currently exposes a local HTTP action server in `server.js`. It is MCP-style and agent-friendly, but it is not yet a stdio MCP adapter. Add the stdio adapter after the action surface settles.

## Scope

The server is for local robotics workflows:

- discover simulated or connected robot controllers
- describe robot profiles and capabilities
- run human-in-the-loop build/debug sessions
- produce manual handoff steps for official LEGO clients
- generate safe probe plans
- run simulated or real probe sessions
- classify likely robot morphology
- export datasets for local training or Edge Impulse ingestion
- later generate, build, and deploy robot code

It is not intended as a public internet service or multi-tenant platform.

## Transports

Current:

- local HTTP: `http://127.0.0.1:3095`
- local CLI: `node cli.js <command>`

Planned:

- stdio MCP adapter for Codex, Claude, OpenCode, and similar agents
- Android app bridge for live device transport
- optional WebSocket/SSE stream for probe telemetry

## Endpoints

Health:

```powershell
curl.exe -s http://127.0.0.1:3095/health
```

Readiness:

```powershell
curl.exe -s http://127.0.0.1:3095/ready
```

Actions:

```powershell
curl.exe -s http://127.0.0.1:3095/actions
```

Run an action:

```powershell
curl.exe -s -X POST http://127.0.0.1:3095/run -H "Content-Type: application/json" -d "{\"action\":\"robot_scan\",\"params\":{}}"
```

CLI alternative:

```powershell
node cli.js actions
node cli.js scan --plain
node cli.js run robot_describe --set profileId=51515-blast
node cli.js builder start 51515-blast --goal "make Blast wave safely" --audience kid --plain
```

See `docs/CLI.md` for convenience commands.

## Current Actions

`robot_scan`

Lists known simulated profiles and later connected robot bridges.

```json
{
  "action": "robot_scan",
  "params": {}
}
```

`robot_describe`

Returns a profile plus adapter capabilities.

```json
{
  "action": "robot_describe",
  "params": { "profileId": "sim-two-wheel-drive" }
}
```

`probe_plan_create`

Creates a safe low-power probe plan.

```json
{
  "action": "probe_plan_create",
  "params": {
    "profileId": "sim-two-wheel-drive",
    "duty": 20,
    "sampleRateHz": 50
  }
}
```

`probe_run`

Runs a simulated probe and returns a probe session.

```json
{
  "action": "probe_run",
  "params": { "profileId": "sim-gripper" }
}
```

`robot_classify`

Classifies a probe session. Pass either `session` or `sessionPath`.

```json
{
  "action": "robot_classify",
  "params": {
    "sessionPath": "out/example-session.json"
  }
}
```

`dataset_export`

Exports a session as `jsonl`, `json`, `csv`, or `edge-impulse-json`.

```json
{
  "action": "dataset_export",
  "params": {
    "session": {},
    "format": "edge-impulse-json",
    "save": true
  }
}
```

`official_client_status`

Detects whether the official LEGO client appears to be running. This is read-only and does not automate the GUI.
It recognizes the installed EV3 Classroom client and the Microsoft Store Robot Inventor 51515 client when visible as processes.

```json
{
  "action": "official_client_status",
  "params": {}
}
```

`official_client_handoff`

Creates manual steps for the user to run a generated test in Robot Inventor 51515, EV3 Classroom, or a local adapter.

```json
{
  "action": "official_client_handoff",
  "params": {
    "profileId": "51515-blast",
    "goal": "run a first safe movement test"
  }
}
```

`builder_session_start`

Creates a human-in-the-loop build/debug session and stores it in `out/builder-sessions/`.

```json
{
  "action": "builder_session_start",
  "params": {
    "profileId": "51515-blast",
    "goal": "make Blast wave safely",
    "audience": "kid"
  }
}
```

`builder_session_append`

Adds an observation, run result, fix, question, answer, or note to the session. This is how agents should capture what the child/user saw before suggesting the next change.

```json
{
  "action": "builder_session_append",
  "params": {
    "sessionId": "example-51515-blast-first-run",
    "type": "observation",
    "text": "The right motor did not move, but the hub light stayed white."
  }
}
```

`builder_session_summary`

Summarizes the latest observation and returns likely issue classes, next actions, and questions.

```json
{
  "action": "builder_session_summary",
  "params": {
    "sessionId": "example-51515-blast-first-run"
  }
}
```

## Adding Actions

When adding a new action:

1. Add the name to `ACTIONS` in `server.js`.
2. Implement a high-level handler in `handleAction`.
3. Add a `cli.js` convenience command when agents will use it often.
4. Keep raw shell/build behavior behind explicit action names, not hidden inside unrelated actions.
5. Return structured JSON with `ok`, result fields, and clear error messages.
6. Update this file, `docs/CLI.md`, and `AGENTS.md` if the workflow changes.
7. Add a smoke path or example profile when practical.

## Planned Actions

- `code_generate`: generate code from a robot profile and intent.
- `code_build`: delegate Arduino, Android, or Python checks to local tools.
- `code_deploy`: deploy firmware, scripts, or APKs to the chosen target.
- `model_build_edge_impulse`: call the Edge Impulse toolchain through existing local projects.
- `model_package_executorch`: package PyTorch models for Android/edge deployment.
- `profile_import`: import community robot profiles.
- `profile_publish`: package profile, probes, photos, and programs for contribution.

Implemented but still early:

- `official_client_handoff`: produce manual handoff steps for the official LEGO client.
- `builder_session_start`: create a supervised builder/debug session.
- `builder_session_append`: record human observations and fixes.
- `builder_session_summary`: recommend the next debugging step from the recorded observation.

## Safety Rules

- Bind to `127.0.0.1` by default.
- Keep `/health` cheap and side-effect free.
- Keep `/ready` focused on local prerequisites.
- Do not make cloud calls from generic actions.
- Do not run hardware motors from scan or describe actions.
- Use builder sessions for kid/user workflows where the human runs the physical robot and reports observations.
- Make real hardware actions obvious in the action name and response.
- Do not automate official LEGO GUI clicks without explicit user approval and a narrow plan.
