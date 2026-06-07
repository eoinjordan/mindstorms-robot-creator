# Human In The Loop Builder

This project should behave like a patient robot-building partner, not like a hidden robot autopilot. The app and MCP server help kids, parents, teachers, and agents build, run, observe, and debug one small step at a time.

## Product Shape

The builder loop is:

1. Pick a robot profile or identify an unknown build.
2. Ask the user what they want the robot to do.
3. Generate the smallest safe test or program change.
4. Hand the step to the human through the Android app, LEGO client, or local simulator.
5. The human runs it and reports what happened.
6. The agent records the observation, explains the likely cause, and suggests one next change.
7. Repeat until the robot works or the session is blocked with clear evidence.

The physical robot stays human-supervised by default. Agents can generate code, check profiles, explain errors, and propose tests, but they should not drive motors directly unless a real hardware action is explicit and safety limits are visible.

## Session Artifact

Use `schemas/builder-session.schema.json` for the shared debug notebook.

Builder sessions capture:

- robot profile and family
- audience and safety level
- goal or challenge
- official LEGO client or local execution mode
- agent instructions
- user observations
- run results
- fixes attempted
- questions and answers
- next actions

The local action server stores live sessions under `out/builder-sessions/`. Example source-controlled sessions live under `examples/sessions/`.

## MCP Actions

`builder_session_start`

Creates a session and the first handoff step.

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

CLI equivalent:

```powershell
node cli.js builder start 51515-blast --goal "make Blast wave safely" --audience kid --plain
```

`builder_session_append`

Adds a human observation, run result, agent fix, question, or note.

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

CLI equivalent:

```powershell
node cli.js builder observe example-51515-blast-first-run "The right motor did not move, but the hub light stayed white." --plain
```

`builder_session_summary`

Returns the latest observation, likely issue class, next actions, and questions.

```json
{
  "action": "builder_session_summary",
  "params": {
    "sessionId": "example-51515-blast-first-run"
  }
}
```

CLI equivalent:

```powershell
node cli.js builder summary example-51515-blast-first-run --plain
```

`official_client_handoff`

Generates manual handoff steps for Robot Inventor 51515, EV3 Classroom, or a local adapter.

## Agent Behavior

When working with kids or classrooms:

- use short instructions with one action per step
- ask what happened before changing code again
- keep stop controls and physical clearance visible in the workflow
- explain a bug as a test result, not as user failure
- prefer port checks, direction checks, and one-motor tests before complex behavior
- record exact error text instead of paraphrasing it away
- avoid cloud upload unless the adult explicitly chooses export or contribution

When debugging:

- change only one variable at a time
- distinguish code error, wrong port, reversed motor direction, low battery, connection issue, and mechanical binding
- ask for a photo or manual confirmation only when port/sensor ambiguity blocks progress
- keep previous working code available as a known-good checkpoint
- mark sessions blocked when the next step needs real hardware, a missing cable, firmware repair, or adult approval

## First 51515 Flow

For the first 51515 test:

1. Start a builder session for one official robot: Blast, Charlie, Gelo, M.V.P., or Tricky.
2. Use `official_client_status` to confirm the official app is available when useful.
3. Use `official_client_handoff` to tell the user how to run the first test.
4. Capture the observation with `builder_session_append`.
5. Use `builder_session_summary` to decide whether the next change is a port fix, direction fix, connection fix, or smaller test.

Keep Pybricks, direct BLE, and Android transport work behind the same session loop so the teaching/debugging behavior stays consistent across hardware generations.
