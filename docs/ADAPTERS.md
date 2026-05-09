# Hardware Adapters

Adapters isolate robot-specific transport and firmware behavior from the server, Android app, model code, and generated programs.

## Contract

Each adapter should eventually expose this shape:

```js
{
  id: "m5stack-basex",
  family: "m5stack-basex",
  scan,
  describe,
  createProbePlan,
  runProbe,
  stop,
  streamTelemetry,
  generateCode,
  deployCode
}
```

Minimum behavior:

- `scan`: find compatible devices or return known simulated devices.
- `describe`: return capabilities, firmware, ports, sensors, battery, and safe limits.
- `createProbePlan`: return a bounded probe plan using the shared schema concepts.
- `runProbe`: execute or simulate commands and return a probe session.
- `stop`: immediately stop all active motors.

## Shared Rules

- Adapters must not own model classification logic.
- Adapters must not silently upload data or deploy code.
- Adapters must always report whether a session is simulated or real.
- Real adapters must enforce max duty, max duration, and emergency stop locally.
- Transport errors should return useful detail, not generic failure strings.

## M5Stack BaseX

Current status: simulated adapter exists in `adapters/m5stack-basex.js`.

Why it is first:

- BaseX is designed for EV3 motor control.
- It exposes encoder-related data through a small register surface.
- M5Stack Core/Core2 can run Arduino or ESP-IDF firmware.
- It can act as a bridge between Android, Edge Impulse, and LEGO motors.

Next adapter work:

- Add serial transport with a simple JSON line protocol.
- Add firmware command set: `hello`, `describe`, `setDuty`, `readEncoders`, `stopAll`, `runProbe`.
- Add BaseX register mapping constants.
- Add telemetry streaming at 20-100 Hz.
- Add real probe cutoff for stall and timeout.

## EV3

Preferred path: ev3dev.

Adapter options:

- SSH to EV3 and run Python scripts.
- Run a small Python service on EV3 and call it from the local server.
- Use USB networking or Wi-Fi dongle for the transport.

Feedback:

- tacho position
- speed
- duty cycle
- state flags
- sensor values
- optional PixyCam object data

Keep EV3 generation in Python first. Do not start with custom binary protocols.

## SPIKE Prime / Robot Inventor

Two firmware paths matter:

- Pybricks for full MicroPython control when firmware flashing is acceptable.
- LEGO SPIKE Prime protocol for stock-firmware workflows.

Agents must ask or infer which firmware path is acceptable before generating deploy instructions. Do not assume schools or shared kits can be flashed.

## NXT

NXT is a compatibility target after BaseX, EV3, and SPIKE/Robot Inventor.

Likely paths:

- Bluetooth Classic direct commands.
- USB host bridge.
- Later: NXC/leJOS-style program generation.

Android Bluetooth Classic support will need explicit testing.

## RCX

Treat RCX as a legacy command target. It has limited built-in feedback for morphology classification unless external sensors, camera observation, or M5Stack instrumentation is added.

Do not let RCX support slow the first BaseX/EV3/SPIKE milestones.

