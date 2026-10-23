# WeDo execution regression tests
Status: verified; ready to push
## Goal
Test WeDo code generation, execution, dispatch and BLE transport; fix observed failures and push.
## Through-line
Use the existing Node test runner with the real browser source and fake hardware.
## Constraints
No real motor movement during tests. Keep generated probes at low power and bound runtime.
## Non-goals
Claiming physical hardware certification or exhaustive coverage of unrelated Android code.
## Blocks
| Step | Verify | Done when |
| --- | --- | --- |
| Add reusable browser harness and regressions | node --test tests/wedo.test.js | Edited speeds and reverse constants tested |
| Repair runner and cleanup | node --test tests/wedo.test.js | Invalid programs cannot partially move motors |
| Add CI and testing instructions | node scripts/test.js; node scripts/smoke.js | All checks pass |
| Commit and push | git status; git log -1 | Remote branch contains verified changes |
## Open questions
Physical hardware behavior remains for a supervised robot test.
## Risks
Stock BLE only supports a documented Python subset.
## Status log
- Existing tests cover server and CLI, but no WeDo browser execution.
- 117 tests pass, including actual Blockly 9.3.3 workspaces, syntax checks and simulated smoke tests.
