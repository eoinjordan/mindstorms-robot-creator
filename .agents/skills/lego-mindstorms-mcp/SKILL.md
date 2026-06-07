---
name: lego-mindstorms-mcp
description: Work on the LEGO MINDSTORMS/M5Stack robotics MCP repo, including robot profiles, probe sessions, adapters, Android planning, Edge Impulse/ExecuTorch model paths, and generated robot code.
license: MIT
compatibility: codex
metadata:
  audience: repo agents
  workflow: robotics-mcp-development
---

## What I do

- Guide agents through this repo's architecture and safety rules.
- Prefer the simulated BaseX probe loop before real hardware work.
- Keep robot profiles, probe sessions, adapters, models, and generated code aligned.
- Use human-in-the-loop builder sessions for kid/user debugging instead of assuming the agent can see the robot.
- Prefer `node cli.js ...` for local action calls when an HTTP server is not needed.
- Help extend the local action server toward a real MCP workflow.

## When to use me

Use this skill when the user asks to:

- add or change robot adapters
- work on M5Stack BaseX, EV3, SPIKE/Robot Inventor, NXT, or RCX support
- build the Android app plan
- add model training/deployment paths
- create robot profile or probe-session formats
- generate code for robot hardware
- guide kids/users through supervised robot build/debug sessions
- prepare community contribution workflows

## Required Reading

Read in this order:

1. `README.md`
2. `AGENTS.md`
3. `MCP_SERVER.md`
4. relevant file in `docs/`

Use `docs/ADAPTERS.md` before adapter work.
Use `docs/CLI.md` before changing agent command workflows.
Use `docs/HUMAN_IN_THE_LOOP_BUILDER.md` and `docs/KID_SAFE_DEBUGGING.md` before child/user-facing builder work.
Use `docs/DATA_AND_MODELS.md` before schema, classifier, or model work.
Use `docs/ANDROID_APP.md` before Android work.
Use `docs/CODE_GENERATION.md` before generated program work.

## Default Workflow

1. Run or preserve the simulated smoke loop:

```powershell
node --check cli.js
node scripts\smoke.js
```

2. Make the smallest change that advances the current milestone.
3. Keep schemas and examples in sync.
4. Update docs when tool names, actions, schemas, or safety limits change.
5. Re-run syntax checks and smoke checks.

## Safety Rules

- Start simulated unless the user explicitly requests real hardware behavior.
- For kids/users, propose one safe test and wait for the recorded observation before changing code again.
- Real motor actions need low duty, short duration, stop-all, and timeout handling.
- Do not upload datasets, photos, or model artifacts without explicit user request.
- Keep local services on `127.0.0.1` by default.
- Do not delete or rewrite `PDF_manuals/`.

## Exit Criteria

For repo changes, finish with:

- changed files listed
- commands run
- whether smoke passed
- any blocked checks or hardware assumptions
