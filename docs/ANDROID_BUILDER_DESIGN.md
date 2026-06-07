# Android Builder Design Update

The Android app should now be designed around the human-in-the-loop builder session, with probes and model work available as supporting tools.

This update is based on the current repo actions, CLI, and the browser prototype under `test-apps/builder-console/`.

## Primary App Shape

The first usable app should open directly into a working console, not a landing page.

Primary navigation:

- Fleet
- Builder
- Probe
- Data
- Settings

On phones, use bottom navigation with Builder as the default selected tab after a robot is selected.

On tablets, use a two-pane layout:

- left pane: Fleet/Profile list
- right pane: Builder session, Probe tools, or Data view

## Builder Tab

Purpose: guide a kid/user through one safe robot test at a time.

Content:

- selected robot profile
- goal field
- audience field: kid, family, classroom, maker
- active session ID
- next safe action
- visible stop/safety reminder
- observation entry box
- likely issue summary
- next actions
- questions to ask the user
- session history

MCP actions:

- `builder_session_start`
- `builder_session_append`
- `builder_session_summary`
- `official_client_handoff`

Offline fallback:

- store builder session drafts in Room
- sync to MCP server when available
- keep local JSON compatible with `schemas/builder-session.schema.json`

## Fleet Tab

Purpose: choose the robot and see connection state.

Content:

- 51515 seed robots first: Blast, Charlie, Gelo, M.V.P., Tricky
- simulated profiles during development
- controller family
- connection state
- source confidence
- profile warnings, especially Charlie's unconfirmed port map

MCP actions:

- `robot_scan`
- `robot_describe`

## Probe Tab

Purpose: collect structured feedback after the builder flow is safe.

Content:

- probe plan preview
- duty and duration controls
- simulated/hardware mode label
- start/stop controls
- live or replayed telemetry summary
- classify last run

MCP actions:

- `probe_plan_create`
- `probe_run`
- `robot_classify`

Real hardware rule:

- do not show a hardware run button until stop controls and timeout handling are implemented

## Data Tab

Purpose: make data export explicit and user-visible.

Content:

- builder sessions
- probe sessions
- attached notes/photos later
- export buttons for JSON, JSONL, CSV, Edge Impulse JSON
- private/public contribution intent

MCP actions:

- `dataset_export`
- future `profile_publish`
- future `profile_import`

## Settings Tab

Content:

- MCP server URL, default `http://127.0.0.1:3095`
- simulated mode toggle
- official LEGO client handoff mode
- Edge Impulse/ExecuTorch model options as disabled or advanced settings until implemented

## Android Data Models

Add Kotlin models that mirror repo schemas:

- `RobotProfile`
- `ProbeSession`
- `BuilderSession`
- `BuilderStep`
- `BuilderSummary`
- `OfficialClientHandoff`
- `ActionEnvelope<T>`

Keep raw JSON import/export available during early development so schema mismatches are easy to debug.

## MCP Client Interface

Use one client wrapper for local MCP/action calls:

```kotlin
interface MindstormsMcpClient {
    suspend fun scan(): List<RobotDevice>
    suspend fun describe(profileId: String): RobotProfile
    suspend fun startBuilderSession(request: BuilderSessionStartRequest): BuilderSessionResult
    suspend fun appendBuilderObservation(sessionId: String, text: String): BuilderSessionResult
    suspend fun summarizeBuilderSession(sessionId: String): BuilderSessionResult
    suspend fun officialClientHandoff(profileId: String, goal: String): OfficialClientHandoff
    suspend fun createProbePlan(profileId: String, duty: Int, sampleRateHz: Int): ProbePlan
    suspend fun runProbe(profileId: String, plan: ProbePlan? = null): ProbeSession
    suspend fun classify(session: ProbeSession): ClassificationResult
}
```

Implementations:

- `HttpMindstormsMcpClient`
- `FakeMindstormsMcpClient`
- later `AndroidLocalMindstormsEngine` if running offline without Node

## Testing Frameworks

Use the repo test stack for MCP/CLI behavior:

- Node built-in test runner: `node --test tests/*.test.js`
- browser prototype: `test-apps/builder-console/`
- syntax checks: `node --check`

Use Android tests in the active Android Studio project:

- local unit tests for schema parsing and reducers
- fake MCP client tests for Builder/Fleet/Probe view models
- Compose UI tests for the main tabs and session flow
- instrumentation tests only after the UI stabilizes

Recommended first Android tests:

1. loads five 51515 profiles from assets
2. starts a fake builder session for Blast
3. records an observation and shows a missing-port next action
4. renders Charlie with a visible unconfirmed-profile warning
5. creates a simulated probe plan without exposing hardware run controls

## Design Decisions From The Test App

- Builder Session is the primary workflow.
- Probe tools stay available but secondary.
- Agents need a visible action/output log, at least in debug builds.
- The app should keep a manual official-client handoff path until BLE/Pybricks is reliable.
- All screens should work with `FakeMindstormsMcpClient` before hardware work starts.
- Do not block the first app on Edge Impulse or ExecuTorch; expose model runtime choices later in Data/Settings.
