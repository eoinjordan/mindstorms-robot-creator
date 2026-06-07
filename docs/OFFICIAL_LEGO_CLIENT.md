# Official LEGO Client Bridge

The official LEGO MINDSTORMS / Robot Inventor client is useful, but it should not be treated as the core automation API.

Use it for:

- official firmware/app workflows
- pairing or installation steps that LEGO owns
- visual/manual confirmation of 51515 programs and robot setup
- kid/user supervised run steps during builder sessions
- fallback when Pybricks or a direct BLE path is not ready

Use this repo's MCP/action server for:

- robot profiles
- probe plans
- dataset export
- generated code metadata
- model deployment orchestration
- status checks and handoffs to the official client
- human-in-the-loop builder/debug sessions

## Current Local Status

Detected official clients:

| Client | Path/package | Status |
| --- | --- | --- |
| EV3 Classroom | `C:\Program Files\EV3 Classroom\EV3 Classroom-win-1.5.3.4056.exe` | installed and observed running |
| LEGO MINDSTORMS Robot Inventor 51515 | Microsoft Store package `TheLEGOGroup.LEGOMINDSTORMSInventor_10.5.2.0_x64...` | observed running as `MINDSTORMS-10.5.2-alpha.535002-0` |

The local action server has a read-only action for this:

```json
{
  "action": "official_client_status",
  "params": {}
}
```

It also has a handoff action for supervised tests:

```json
{
  "action": "official_client_handoff",
  "params": {
    "profileId": "51515-blast",
    "goal": "run a first safe movement test"
  }
}
```

Example call:

```powershell
curl.exe -s -X POST http://127.0.0.1:3095/run -H "Content-Type: application/json" -d "{\"action\":\"official_client_status\",\"params\":{}}"
```

## Why A Bridge Is Useful

Yes, an MCP/action bridge is useful if agents need to know whether the official client is available and when to hand work back to the user.

The bridge should stay narrow:

- detect whether the official client is running
- distinguish EV3 Classroom from Robot Inventor 51515
- report known process/app state
- record which robot profile the user is working on
- generate code or instructions the user can paste/import into the official app
- attach the handoff to a builder session so the user observation is captured
- avoid brittle click-by-click GUI automation

## What Not To Automate Yet

Do not automate these until there is a stable public API or explicit user approval for UI automation:

- clicking through the official GUI
- firmware updates
- account/login flows
- cloud upload/download
- Bluetooth pairing dialogs

## Recommended Workflow

1. User opens the official LEGO client and connects the hub.
2. Agent calls `official_client_status`.
3. Agent chooses a matching profile:
   - 51515 profiles from `examples/profiles/51515`
   - EV3 profiles from `examples/profiles/ev3` when added
4. Agent generates a Pybricks or LEGO-app-compatible program/instructions.
5. User runs or imports it through the official client.
6. User reports the exact observation: movement, lights, sounds, errors, and anything that did not happen.
7. App/MCP records the observation in a builder session.
8. Agent suggests one next change or asks one focused question.

## Future Actions

Possible future actions:

- `official_client_status`: implemented, read-only.
- `official_client_handoff`: implemented; produce step-by-step instructions for the currently selected robot/profile.
- `official_client_project_export`: document where project files are stored if LEGO exposes them locally.
- `official_client_open`: optional GUI launch action, user-approved only.
