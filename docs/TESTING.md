# Testing

Use Node 20 or newer. Tests need no robot connection. Install dependencies once
with `npm.cmd ci --ignore-scripts` (skips Electron's binary download).
On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`.

```powershell
npm.cmd test
npm.cmd run test:wedo
npm.cmd run test:coverage
npm.cmd run check
npm.cmd run smoke
```

The built-in Node test runner covers the server actions, HTTP wrapper, CLI and
browser WeDo execution. `tests/helpers/browser.js` loads the complete shipped
browser script into an isolated VM with a fake DOM, BLE transport and timers.
It does not fire the UI startup callback. Each test gets fresh app state.
No tests connect to or move physical robots.
`tests/blockly.test.js` uses the actual Blockly 9.3.3 library pinned to match the
browser loader, compiles all WeDo preset workspaces and verifies edited motor fields.

WeDo regressions check edited speed and direction, numeric variables, generated
programs for each WeDo profile and preset, Blockly generation/execution, both BLE
packet formats, invalid input, runtime limits, dispatch and motor cleanup.
CI runs the suite on Linux and Windows with Node 20 and 22.

## Stock WeDo execution contract

Stock BLE runs a small validated subset of the generated Python on the computer.
It does not upload a Python interpreter to the hub. Supported statements are
`import hub`, `import time`, numeric assignments, motor bindings, string `print`,
`hub.led`, `hub.sound.beep` (LED substitute), `time.sleep`, motor `start`, `stop`,
`run_for_seconds(speed, seconds)`, and literal `for name in range(count)` loops.
Direct `hub.port.A.motor` and `hub.port.B.motor` paths are supported.
Numeric arguments accept signed literals or signed numeric variable names.
Unsupported expressions, sensors and control statements report an error before
any nonzero motor command is sent. An empty editor does not run a preset.

Explicit edited power is accepted from -100 to 100; generated text probes keep
their default 50. Speed is motor power percentage, not measured shaft RPM.
Each wait or timed run is limited to two seconds. Continuous motor operation
across waits is also limited to two seconds; add a stop before continuing.
Programs are limited to 20 seconds of scheduled waits, 500 queued commands and
five repetitions per loop. Limits produce errors instead of silently changing
the program. Motors used by a program are stopped on completion or failure;
stop writes are attempted independently for all ports. Concurrent runs are refused.

## Coverage and physical verification

Coverage output identifies untested code; these tests do not establish exhaustive
coverage of every project function, Android, Electron, real browser UI or hardware.
Fake transport tests verify emitted bytes, not hub acceptance or physical speed.
After deploying, reconnect the hub and run a short supervised test with the robot
clear of obstacles. Compare lower power with a brief higher power command and
check reverse direction and stop behavior. Keep the browser connection active.
