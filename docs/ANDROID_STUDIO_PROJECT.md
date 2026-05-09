# Android Studio Project

The canonical Android app project is:

```text
C:\Users\Eoin\AndroidStudioProjects\MindstormsAICreator
```

Gemini should build and edit that project.

The repo-side scaffold remains here for reference:

```text
C:\Users\Eoin\git\lego-mindstorms-mcp\android\robot-inventor-app
```

Do not treat the repo-side scaffold as the active app unless the user explicitly asks.

## Sync 51515 Profiles

From the MCP repo root:

```powershell
node scripts\sync-android-51515-assets.js
```

This writes:

```text
C:\Users\Eoin\AndroidStudioProjects\MindstormsAICreator\app\src\main\assets\robot_profiles_51515.json
```

## Sync Builder Design Docs

From the MCP repo root:

```powershell
node scripts\sync-android-design-docs.js
```

This writes:

```text
C:\Users\Eoin\AndroidStudioProjects\MindstormsAICreator\docs\BUILDER_SESSION_DESIGN.md
```

It also updates the active project's `GEMINI.md`, `AGENTS.md`, and `README.md` with a short builder-session design note.

## Active App Agent Files

The Android Studio project now contains:

- `GEMINI.md`
- `AGENTS.md`
- `README.md`
- `docs/BUILD_TARGET.md`
- `docs/51515_PROFILES.md`
- should add/update `docs/BUILDER_SESSION_DESIGN.md` from `C:\Users\Eoin\git\lego-mindstorms-mcp\docs\ANDROID_BUILDER_DESIGN.md`

Those files tell Gemini to build the correct app and keep the 51515-first workflow.

## Current Design Direction

Gemini should now prioritize:

1. Fleet/Profile selection for the five 51515 robots.
2. Builder Session as the main screen after selection.
3. Fake MCP client and Compose/unit tests before BLE.
4. Probe Runner as a secondary screen using simulated probe plans.
5. Dataset export after builder/probe data is stored locally.

The repo-side browser prototype is:

```text
C:\Users\Eoin\git\lego-mindstorms-mcp\test-apps\builder-console
```

Use it as a screen-flow reference, not as a web app dependency.
