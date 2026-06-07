# Android Project Locations

Do not commit machine-specific Android Studio paths. Use these placeholders in docs, scripts, and agent notes:

| Placeholder | Meaning |
| --- | --- |
| `<mcp-repo-root>` | This repository root |
| `<android-project-root>` | Local Android Studio project used for hands-on APK work |
| `<android-repo-root>` | Public Android app repo clone |

For local scripts, prefer environment variables:

```powershell
$env:MINDSTORMS_ANDROID_PROJECT="<android-project-root>"
$env:MINDSTORMS_ANDROID_APP_DIR=$env:MINDSTORMS_ANDROID_PROJECT
$env:MINDSTORMS_MCP_REPO_DIR="<mcp-repo-root>"
```

`MINDSTORMS_ANDROID_PROJECT` and `MINDSTORMS_ANDROID_APP_DIR` are equivalent; scripts support both.

## Active App Versus Repo Scaffold

The active local Android Studio project may live outside this repo. The repo-side scaffold is:

```text
android/robot-inventor-app
```

Treat `android/robot-inventor-app` as reference material unless the task explicitly targets the repo-side scaffold or GitHub release workflow.

The public Android app repo is separate from this MCP/data repo. Use it for GitHub Actions, public Android releases, and package `com.eoinedge.robotinventor`.

## Sync 51515 Profiles

From `<mcp-repo-root>`:

```powershell
node scripts\sync-android-51515-assets.js
```

This writes the repo scaffold asset and, when `MINDSTORMS_ANDROID_PROJECT` points at an existing project, also writes:

```text
<android-project-root>\app\src\main\assets\robot_profiles_51515.json
```

## Sync Builder Design Docs

From `<mcp-repo-root>`:

```powershell
node scripts\sync-android-design-docs.js
```

This writes:

```text
<android-project-root>\docs\BUILDER_SESSION_DESIGN.md
```

It can also update the active project's `AGENTS.md`, `GEMINI.md`, and `README.md` when those files exist.

## Current Design Direction

Android work should prioritize:

1. Fleet/profile selection for the five 51515 robots.
2. Builder Session as the main screen after selection.
3. Fake MCP client and unit tests before direct BLE motor control.
4. Probe Runner as a secondary screen using simulated probe plans.
5. Dataset export after builder/probe data is stored locally.

The repo-side browser prototype is:

```text
test-apps/builder-console
```

Use it as a screen-flow reference, not as a web app dependency.
