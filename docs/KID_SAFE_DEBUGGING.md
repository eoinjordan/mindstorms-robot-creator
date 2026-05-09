# Kid Safe Debugging

This repo is for building with kids and users who may be learning robotics. Debugging should make the robot safer and the explanation clearer.

## Defaults

- Start in simulation or manual LEGO-client handoff.
- Use low power, short duration, and one movement at a time.
- Keep the stop button or app stop control visible.
- Put walking, wheeled, or arm robots on the floor or a stable stand with space around moving parts.
- Treat unexpected movement as a stop condition, not as a reason to increase power.

## Debug Checklist

Connection problem:

- confirm the official LEGO app or local bridge sees the hub
- check battery level
- close other apps that may own the Bluetooth connection
- reconnect before changing code

No movement:

- check the expected port in the robot profile
- run one motor at low power
- confirm the motor cable is fully seated
- check whether the hub light or app changed state

Wrong direction:

- keep the port assignment
- reverse only the affected motor in generated code
- rerun the same small test

Stall, grinding, or stuck movement:

- stop powered tests
- move the mechanism gently by hand while powered off
- lower duty and duration before retrying
- check for parts pressing into a hard stop

Program or app error:

- copy the exact error text into the builder session
- keep the robot unchanged until the error is understood
- reduce the program to a single motor or sensor read

Unknown robot:

- ask the user to name visible motors and sensors
- collect photos only when the user chooses to attach them
- run safe passive or low-power probes before classification

## Agent Tone

Use plain robotics language:

- say "the motor on port A" instead of "actuator subsystem"
- say "it turned backward" instead of "inverse kinematics mismatch"
- say "we need one more test" instead of guessing

Do not hide uncertainty. If a port map is unconfirmed, say it is unconfirmed and ask for the next smallest observation that would confirm it.
