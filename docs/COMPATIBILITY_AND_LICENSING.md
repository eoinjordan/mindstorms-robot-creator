# Compatibility And Licensing

This document states what Mindstorms Robot Creator is, what it is not, and the boundaries agents should preserve when adding compatibility with LEGO, Pybricks, Edge Impulse, ExecuTorch, and other tooling.

This is project guidance, not legal advice.

## What This Project Is

- An independent, MIT-licensed robotics workshop for LEGO MINDSTORMS-era hardware and compatible bridges.
- A code generator for multiple targets, including Pybricks Python, LEGO stock Python, ev3dev Python, NXT Python, RCX NQC, and Arduino/M5Stack firmware.
- A human-in-the-loop builder and debugging assistant for kids, families, classrooms, and makers.
- A local MCP/CLI/HTTP action server for agents to scan profiles, generate safe probe plans, create code, export datasets, and record observations.
- A data and model workflow for robot profile matching, telemetry capture, morphology classification, and optional Edge Impulse/TFLite/ExecuTorch experiments.
- A community-profile project where users can contribute robot profiles, build notes, probe sessions, and generated-code examples.

## What This Project Is Not

- Not an official LEGO product.
- Not an official Pybricks product.
- Not a replacement for the LEGO, Pybricks, EV3 Classroom, SPIKE, or Robot Inventor applications.
- Not a distributor of Pybricks firmware, LEGO firmware, EV3 firmware, paid block-coding features, or proprietary vendor assets.
- Not a cloud training platform by default.
- Not a safety certification system for moving robots.
- Not legal advice about third-party firmware, trademarks, competition rules, or classroom policy.

## License Position

The source code and documentation created for this repository are MIT licensed unless a file says otherwise.

The MIT license does not apply to:

- third-party firmware
- official LEGO software
- Pybricks firmware or Pybricks Code
- Edge Impulse services or SDKs
- ExecuTorch or PyTorch components
- Android SDK, Gradle, Kotlin, Jetpack Compose, or other dependencies
- manuals, screenshots, product names, trademarks, or other third-party assets

Keep third-party license files, generated notices, and dependency metadata intact when dependencies are bundled.

## LEGO Compatibility Boundary

Use LEGO product names only to identify compatible hardware, kits, ports, and workflows. Keep README and UI wording clear that this is an independent project.

Do:

- say "compatible with LEGO MINDSTORMS Robot Inventor 51515"
- say "generated code for the LEGO MINDSTORMS Robot Inventor app"
- link to official LEGO tools or tell users to open the app manually
- preserve user-visible safety and consent around motor control

Do not:

- use LEGO logos or trade dress as branding
- imply sponsorship, endorsement, or official support
- redistribute official LEGO apps, firmware, manuals, or proprietary assets
- automate official clients by GUI scripting unless the user explicitly requests it and the workflow remains manual/visible

Reference: LEGO Fair Play policy, https://www.lego.com/en-us/legal/notices-and-policies/fair-play

## Pybricks Compatibility Boundary

Pybricks is a strong compatibility target for this project. It should be treated as an external firmware/runtime and coding environment.

Do:

- generate Pybricks-compatible Python for supported hubs
- keep `pybricks-python` and `pybricks-ev3` as explicit code targets
- link users to Pybricks docs and install/restore instructions
- make firmware choice explicit before giving deploy instructions
- keep LEGO stock firmware paths available for shared kits and classrooms
- test generated Pybricks code for imports, port bindings, and safe stop behavior

Do not:

- bundle Pybricks firmware without confirming the specific firmware license
- copy Pybricks Code or paid block-coding behavior into this app
- imply this project is Pybricks or officially supported by Pybricks
- assume a hub has Pybricks firmware unless the profile/session says so
- make firmware flashing the default for classroom or shared hardware

References:

- Pybricks Code: https://code.pybricks.com/
- Pybricks docs: https://docs.pybricks.com/
- Pybricks install and restore instructions: https://pybricks.com/learn/getting-started/install-pybricks/
- Pybricks legal page: https://pybricks.com/legal/

## Compatibility Points To Preserve

Profile fields should distinguish hardware, firmware, and code target:

```json
{
  "controller": {
    "model": "Robot Inventor Hub 51515",
    "firmware": "pybricks-or-lego-spike"
  },
  "programTargets": ["pybricks-python", "spike-stock"]
}
```

Builder sessions should record the execution surface:

```json
{
  "clientId": "pybricks",
  "profileId": "51515-blast"
}
```

Generated code should always include:

- target name and firmware assumption
- robot profile id and port bindings
- low-power defaults for probes
- stop-all behavior
- one observation request for the human

Android and web UI should expose:

- firmware choice: stock LEGO, Pybricks, ev3dev, simulated, or bridge
- visible stop/abort control for real hardware
- clear "manual handoff" path for official clients
- explicit export/upload controls for datasets and model artifacts

MCP actions should avoid hidden side effects:

- `code_generate` creates source text only
- `lms_write` creates a local project file only
- deploy/upload actions must be separate, explicit, and user-visible
- firmware install/restore should be a handoff, not an automatic background action

## Agent Checklist

Before adding a compatibility feature, confirm:

- Which firmware or runtime is required?
- Is the target stock firmware, Pybricks, ev3dev, Arduino, or a bridge?
- Does the repo bundle any third-party binary or proprietary asset?
- Does the user see and approve firmware flashing, deployment, upload, or motor movement?
- Can the feature run in simulated mode first?
- Are generated files clearly labeled as generated compatibility code?
- Are names/logos used only for identification?
