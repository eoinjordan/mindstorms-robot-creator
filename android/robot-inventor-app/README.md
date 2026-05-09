# Robot Inventor 51515 Android App

This is the first Android app scaffold for the 51515-first workflow.

It currently works as a local profile browser and simulated probe UI:

- loads `app/src/main/assets/robot_profiles_51515.json`
- shows Blast, Charlie, Gelo, M.V.P., and Tricky
- displays ports, roles, source, and confidence
- runs a local simulated probe summary

## Sync Profiles

The app asset is generated from repo profiles:

```powershell
node ..\..\scripts\sync-android-51515-assets.js
```

From the repo root:

```powershell
node scripts\sync-android-51515-assets.js
```

## Build

From this directory:

```powershell
.\gradlew.bat :app:assembleDebug
```

Local build requirements:

- JDK installed and `JAVA_HOME` set
- Android SDK installed
- Android Gradle plugin dependencies available through Gradle

On the current machine, Gradle assembly is blocked until Java is available on `PATH` or `JAVA_HOME` is set.

## Next App Work

- add import/export for probe-session JSON
- add a BLE scan screen for Robot Inventor Hub
- add Pybricks connection workflow
- save sessions locally
- call the local MCP/action server for `robot_classify` and `dataset_export`
