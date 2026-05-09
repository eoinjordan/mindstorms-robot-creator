# CLI

`cli.js` is the no-server command surface for agents and local scripts. It calls the same `handleAction` functions as `server.js`, so CLI and HTTP behavior should stay aligned.

Use it when:

- an agent needs structured JSON without starting an HTTP server
- a script wants to start or update a builder session
- a user wants quick handoff/debug commands from PowerShell
- smoke testing an action is simpler than writing a `curl.exe` command

## Basic Commands

List available actions:

```powershell
node cli.js actions
```

Run any raw action:

```powershell
node cli.js run robot_describe --set profileId=51515-blast
```

Scan known profiles:

```powershell
node cli.js scan
node cli.js scan --plain
```

Describe a robot:

```powershell
node cli.js describe 51515-blast
```

Start the local HTTP server through the CLI:

```powershell
node cli.js server
node cli.js server --host 127.0.0.1 --port 3095
```

## Builder Session Commands

Start a kid/user builder session:

```powershell
node cli.js builder start 51515-blast --goal "make Blast wave safely" --audience kid --plain
```

Record what happened:

```powershell
node cli.js builder observe check-51515-blast "The right motor did not move, but the hub light stayed white." --plain
```

Append a structured note or fix:

```powershell
node cli.js builder append check-51515-blast --type fix --text "Reverse the left drive motor direction." --plain
```

Summarize the next debugging step:

```powershell
node cli.js builder summary check-51515-blast --plain
```

## Official LEGO Client Commands

Check whether known LEGO clients appear to be running:

```powershell
node cli.js client-status
```

Generate manual handoff steps for Robot Inventor 51515 or EV3 Classroom:

```powershell
node cli.js handoff 51515-blast --goal "run a first safe movement test" --plain
```

## Probe/Data Commands

Create a safe probe plan:

```powershell
node cli.js probe-plan sim-two-wheel-drive --duty 20 --sample-rate 50
```

Run a simulated probe:

```powershell
node cli.js probe-run sim-gripper
```

Classify a saved session:

```powershell
node cli.js classify --session-path out\example-session.json
```

Export a saved session:

```powershell
node cli.js export --session-path out\example-session.json --format edge-impulse-json --save
```

## Output Rules

Default output is pretty JSON for agent use.

Use `--compact` when another tool needs one-line JSON.

Use `--plain` or `--human` for a short human-readable summary.

Use `--set`, `--params`, `--params-file`, or `--stdin` to merge extra parameters into any command. Command-specific flags are applied first, then extra params are merged on top.

## Agent Rules

- Prefer CLI commands over ad hoc file edits when recording builder observations.
- Keep `server.js` as the source of action behavior; the CLI should stay a thin wrapper.
- Update this doc and `MCP_SERVER.md` whenever a new action gets a convenience command.
- Do not add CLI commands that move real motors unless the command name makes the hardware action obvious.
