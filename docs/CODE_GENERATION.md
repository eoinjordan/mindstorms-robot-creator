# Code Generation

Generated robot code should come from a profile plus a template. Do not generate raw low-level code from scratch when a template can express the target safely.

For kids and first-run debugging, generated code should normally be wrapped in a human-in-the-loop builder session. The agent proposes one small program or patch, the user runs it in the LEGO client, Android app, or simulator, and the next code change is based on the recorded observation.

## Targets

`arduino-basex`

- M5Stack Core/Core2 firmware for BaseX.
- Controls BaseX motor registers.
- Streams encoder/IMU telemetry.
- Runs safe probe routines.

`ev3dev-python`

- EV3 Python scripts using ev3dev/ev3dev2 motor APIs.
- Good for EV3 tacho motors, sensors, and PixyCam integration.

`pybricks-python`

- SPIKE Prime / Robot Inventor / supported hubs running Pybricks.
- Best when firmware flashing is acceptable.
- Generate compatible Python only; do not bundle Pybricks firmware or imply this project is Pybricks.

`spike-stock`

- Stock LEGO SPIKE protocol command path.
- Use for classroom/shared kit compatibility.
- Keep this path available when firmware flashing is not acceptable.

`nxt-direct`

- NXT direct-command scripts.
- Later compatibility target.

`rcx-bridge`

- Host-side RCX command bridge.
- Low priority for morphology discovery due to limited built-in feedback.

## Generated Code Must Include

- profile metadata block
- target and firmware version
- port binding checks
- safe startup state
- `stopAll` or equivalent emergency stop
- telemetry output format
- probe duration and duty limits
- clear error messages for missing motors/sensors

## Generation Flow

1. Validate robot profile against `schemas/robot-profile.schema.json`.
2. Validate request against `schemas/code-target.schema.json`.
3. Start or update a builder session when the code is meant for a human to run.
4. Select target template.
5. Bind ports and sensors by role.
6. Insert safety constants.
7. Emit code plus a manifest.
8. Run syntax/build checks through the appropriate local tool.
9. Hand off the code with one clear observation request.

## Build Delegation

- Arduino builds should delegate to `arduino-mcp` once templates exist.
- Android builds should delegate to `android-mcp`.
- Edge Impulse deployments should use `ei-agentic-claude` or a narrowly scoped local action.
- Python syntax checks can run locally before EV3/Pybricks deploy.

## Agent Rules

- Do not generate code that assumes a motor is on a fixed port unless the profile says so.
- Do not silently increase motor duty beyond the probe plan.
- Keep generated code deterministic for the same profile and intent.
- Put reusable logic into templates, not repeated pasted code.
- For user-facing debugging, change only one of port, direction, timing, or behavior between runs.
- Record run results in `schemas/builder-session.schema.json` instead of relying on chat history.
