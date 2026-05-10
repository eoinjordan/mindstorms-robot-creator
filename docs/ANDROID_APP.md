# Android App Plan

The Android app is the operator console, data collector, and on-device inference surface. It starts with the LEGO MINDSTORMS Robot Inventor 51515 profiles.

## Recommended Stack

- Kotlin
- Jetpack Compose
- Room for local profiles and sessions
- Kotlin serialization or Moshi for JSON
- BLE and Bluetooth Classic transport modules behind one interface
- Foreground service for long probe sessions
- WorkManager for export/upload jobs

## Current Scaffold

The active Android Studio app is under:

```text
C:\Users\Eoin\AndroidStudioProjects\MindstormsAICreator
```

The older repo scaffold under `android/robot-inventor-app` is reference material only. Gemini and other Android agents should build the Android Studio project above when the task is about the local APK.

The public Android GitHub repo is a separate copy:

```text
C:\Users\Eoin\git\mindstorms-robot-creator-android
```

Use that repo for GitHub Actions, releases, package `com.eoinedge.robotinventor`, and public APK publishing. Keep the two source trees intentionally synced when fixes are shared.

### Files built so far

| File | What it does |
| --- | --- |
| `RobotTransport.kt` | `RobotTransport` interface; `RobotDevice`, `RobotConnection`, `RobotDescription`, `ProbePlan`, `ProbeTelemetry`, `ImuData`, `ProbeSession` data models |
| `SimulatedTransport.kt` | Full fake transport: scan returns all 5 robots, `runProbe` streams random IMU and encoder data every 100 ms |
| `SpikeBleTransport.kt` | BLE scanning path, connect/probe placeholders, BLE permissions in manifest |
| `RobotProfile.kt` | `RobotProfile`, `ProfilePort` kotlinx-serializable models; `ProfileRepository` loads `robot_profiles_51515.json` from assets |
| `MainActivity.kt` | App shell with Fleet, Probe, Builder, Code, Voice, History, and Settings surfaces |
| `MindstormsFleetScreen.kt` | Responsive fleet/profile screen; compact phones stack controls/profiles/details, wide screens use two panes |
| `ProbeRunner.kt` | Probe runner dialog: session label/notes, start/stop, live `TelemetryGraph` per IMU axis, persisted session data |
| `LocalDatabase.kt` | Room database for local sessions |
| `BuilderSessionScreen.kt` | Human-in-the-loop builder workflow with observations, summaries, and LEGO client handoff |
| `MindstormsMcpClient.kt` | Fake and HTTP MCP clients for builder sessions, official handoff, and code generation |
| `CodeScreen.kt` | Blockly editor shell, profile-aware code generation, and `.lms` export/share flow |
| `VoiceScreen.kt` | Voice observation and keyword workflow surface |
| `SessionHistoryScreen.kt` | Local session history review |
| `SettingsScreen.kt` | App/server settings |
| `TelemetryGraph.kt` | Canvas-based scrolling line graph for float time-series |

### What is not yet built

| Missing piece | Where it belongs | Design reference |
| --- | --- | --- |
| Direct hub command execution over BLE | `SpikeBleTransport` or Pybricks/LWP3 transport module | `docs/ADAPTERS.md` |
| Hardware-backed probe capture | Probe Runner + transport implementation | Schema: `schemas/probe-session.schema.json` |
| Edge Impulse/TFLite classifier runtime | Classifier screen/view model | `docs/DATA_AND_MODELS.md` |
| ExecuTorch runtime option | Model runtime module after a useful PyTorch model exists | `docs/DATA_AND_MODELS.md` |
| Compose instrumentation tests | Android test source set | `docs/ANDROID_BUILDER_DESIGN.md` |

Current design update:

- Builder Session is now the primary workflow for kids/users.
- Probe Runner is a supporting workflow for safe data collection.
- The app should support both HTTP MCP calls and fake in-app clients for tests.
- The browser prototype in `test-apps/builder-console/` is the current low-cost screen model.
- Detailed design notes are in `docs/ANDROID_BUILDER_DESIGN.md`.
- Phone layout must not force a fixed sidebar; the fleet screen should stack on compact widths and use panes only on wide displays.

Open `C:\Users\Eoin\AndroidStudioProjects\MindstormsAICreator` in Android Studio or run the Gradle wrapper there once JDK and Android SDK dependencies are available.

Sync the 51515 profile asset from this repo to the active app:

```powershell
node scripts\sync-android-51515-assets.js
```

## Main Screens

Fleet:

- scan for devices and bridges
- show simulated profiles during development
- show controller family, firmware, battery, and connection state

Builder Session:

- choose a robot profile and user goal
- choose audience: kid, family, classroom, maker
- start or resume a session compatible with `schemas/builder-session.schema.json`
- show the next safe action from the MCP server
- show official LEGO client handoff steps when direct control is not ready
- let the user record what happened after running a test
- show likely issue and one next change
- keep session history visible for teachers, parents, and agents

Robot Profile:

- ports and attached motors/sensors
- firmware and adapter capabilities
- known build label and confidence
- available program targets

Probe Runner:

- choose safe probe routine
- preview max duty and duration
- start/stop controls
- live encoder and IMU traces
- clear hardware emergency-stop affordance

Dataset Capture:

- label session
- attach photos and notes
- export JSONL/CSV/Edge Impulse JSON
- mark private/public contribution intent

Classifier:

- run on-device classifier
- show top label, confidence, and "unknown" path
- show feature summary for debugging

Code Deploy:

- choose generated program
- send to MCP server for build/deploy
- show build logs and deployment result

Community Library:

- import robot profiles
- export contribution bundles
- compare local probe signature to known signatures

## Android Data Flow

1. App connects to a controller or host bridge.
2. App requests/creates a robot profile.
3. App starts a builder session when a human is running/debugging the robot.
4. App runs a probe plan or manual official-client handoff.
5. App stores the probe session or human observation locally.
6. App runs local classification or sends the session to the local server.
7. App exports or uploads only when the user chooses it.

## MCP Client Flow

During development, the app should be able to switch between:

- `FakeMindstormsMcpClient` for Compose previews and tests
- `HttpMindstormsMcpClient` for `http://127.0.0.1:3095`
- `SimulatedTransport` for local profile/probe behavior
- later BLE/Pybricks transports for real 51515 hardware

The active app should not call the CLI directly. The CLI is for agents and local scripts. Android should call the HTTP action server or use an in-app fake client.

## Transport Interface

Use one app-facing interface:

```kotlin
interface RobotTransport {
    suspend fun scan(): List<RobotDevice>
    suspend fun connect(deviceId: String): RobotConnection
    suspend fun describe(): RobotDescription
    suspend fun runProbe(plan: ProbePlan): Flow<ProbeTelemetry>
    suspend fun stopAll()
}
```

Implementations:

- `M5StackBleTransport`
- `M5StackSerialBridgeTransport`
- `Ev3HostBridgeTransport`
- `SpikeBleTransport`
- `NxtBluetoothTransport`
- `SimulatedTransport`

## Model Runtime Choices

Use Edge Impulse or TFLite first for simple time-series classifiers. Add ExecuTorch for Android-hosted PyTorch models when there is a model that benefits from the PyTorch pipeline.

## Android Testing Plan

Use fake clients before real hardware tests:

- local unit tests for loading `robot_profiles_51515.json`
- local unit tests for builder-session reducers and JSON import/export
- fake MCP client tests for Fleet, Builder Session, Probe Runner, and Classifier view models
- Compose UI tests for tab navigation, visible safety controls, and observation capture
- instrumentation tests for Bluetooth only after the simulated flow is stable

First test cases:

- all five 51515 profiles load from assets
- Charlie renders an unconfirmed-profile warning
- Builder Session can start from Blast and append an observation
- a "did not move" observation shows a missing-port or wrong-port next action
- Probe Runner can create a simulated low-duty plan without enabling real hardware controls

## Agent Notes

- Do not build a landing page. Build the usable fleet/probe app first.
- Include the builder/debug notebook as a first-class workflow, not just a notes field.
- Keep Builder Session as the first-run experience after profile selection.
- Use `docs/ANDROID_BUILDER_DESIGN.md` for the current screen design.
- Keep robot safety controls visible in the actual app.
- Keep all data export actions user-visible.
- Align app schemas with `schemas/*.json`; do not create incompatible Android-only formats.
