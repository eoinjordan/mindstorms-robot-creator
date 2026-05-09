# Builder Console Test App

This is a no-dependency browser test app for the local action server. It is meant for agents and early UI experiments, not as the final Android app.

## Run

From the repo root:

```powershell
node cli.js server
```

Then open:

```text
test-apps\builder-console\index.html
```

The app calls `http://127.0.0.1:3095/run` directly. The local server sends CORS headers so the file can be opened from disk.

## What It Tests

- scan known robot profiles
- start a human-in-the-loop builder session
- generate official LEGO client handoff steps
- append observations
- summarize likely issues and next actions
- create and run simulated probe plans
- classify simulated probe sessions

## Android Design Use

Treat this as a low-cost screen prototype for the Android app:

- Fleet on the left
- Builder session as the primary workflow
- Probe tools below the supervised builder flow
- JSON/event output visible for agents and debugging
