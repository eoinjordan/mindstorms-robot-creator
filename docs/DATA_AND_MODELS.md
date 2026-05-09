# Data And Models

The model quality will come from safe probing, consistent labels, and good metadata before it comes from a complex neural network.

## Core Objects

Robot profile:

- what the robot/controller is
- which ports exist
- which motors and sensors are attached
- which generated code targets are supported
- which safety limits apply

Probe session:

- commands sent to motors
- telemetry observed over time
- label, if known
- device metadata
- optional attachments

Classifier result:

- label
- confidence
- features or explanation
- unknown/anomaly path

## Labels

Start with broad morphology labels:

- `two_wheel_drive`
- `tracked_vehicle`
- `gripper`
- `arm`
- `walker`
- `unknown`

Do not overfit early labels to exact LEGO model names. Exact model recognition can come later after there are enough contributed sessions.

## Feature Baseline

Use simple features first:

- active motor ports
- position delta per port
- speed range per port
- mean absolute speed
- stall flags
- left/right coupling
- IMU yaw/pitch response
- response lag after command

The current scaffold uses a heuristic classifier in `server.js`. Treat it as a baseline and smoke-test target, not as the final model.

## Edge Impulse Path

Use Edge Impulse for the first real training/deployment loop:

1. Export probe sessions as `edge-impulse-json`.
2. Upload with the Ingestion API or your existing Edge Impulse MCP tooling.
3. Train a small time-series classifier.
4. Export for Arduino/C++ or Android.
5. Integrate with M5Stack firmware or Android app.

Good first model:

- input: command plus encoder/IMU time-series
- window: 2-4 seconds
- classes: three to six broad morphology labels
- deployment: Arduino library or Android C++ library

## ExecuTorch Path

Use ExecuTorch for Android-hosted PyTorch models and later embedded experiments.

Do not make ExecuTorch the first microcontroller deployment path. For ESP32-class targets, Edge Impulse/TFLite Micro/EON is the more practical starting point.

## Dataset Hygiene

- Store raw sessions before derived features.
- Preserve label provenance: user label, model label, imported community label.
- Include `simulated: true` for generated data.
- Keep personally identifying photos out of public bundles unless explicitly approved.
- Use content hashes for shared sessions and model artifacts.

## Evaluation

Minimum evaluation before claiming progress:

- confusion matrix on held-out sessions
- separate simulated and real-device results
- unknown-class behavior tested with at least one unmatched build
- latency and memory measurements for target runtime

