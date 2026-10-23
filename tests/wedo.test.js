const test = require('node:test');
const assert = require('node:assert/strict');
const { browserHarness } = require('./helpers/browser');

for (const speed of [-100, -50, 0, 35, 50, 100]) {
  test(`edited speed ${speed} reaches BLE unchanged`, async () => {
    const h = browserHarness();
    await h.run(`motor_a.run_for_seconds(speed=${speed}, seconds=0.1)`);
    assert.deepEqual(h.motors[0], [0, speed]);
    assert.deepEqual(h.waits, [100]);
    assert.match(h.log(), /code complete/);
  });
}

test('signed constants, decimal values, assignments and port bindings execute in order', async () => {
  const h = browserHarness();
  await h.run('speed = 20\nm = hub.port.B.motor\nm.start(-speed)\nspeed = 40\nm.start(+speed)\ntime.sleep(.2)\nm.stop()');
  assert.deepEqual(h.motors.slice(0, 3), [[1, -20], [1, 40], [1, 0]]);
  assert.deepEqual(h.waits, [200]);
});

for (const command of [
  'motor_a.start(speed=typo)', 'motor_a.start(speed=101)',
  'motor_a.start(speed=10+20)', 'motor_a.run_for_seconds(30, 3)',
  'time.sleep(-1)', 'while True:', 'motor_a.start(30); unknown()',
  'motor_a.start(speeed=100)', 'motor_a.start(20, speed=30)',
  'motor_a.start(20, 30)', 'motor_a.start(speed=30, speed=40)',
  'motor_a.start(speed=30, 40)', 'import something_else',
  '    motor_a.start(20)', 'for _ in range(1):',
  'time.sleep(2)\ntime.sleep(1)',
  'for _ in range(6):\n    motor_a.start(20)'
]) {
  test(`invalid program fails preflight: ${command}`, async () => {
    const h = browserHarness();
    await h.run(`motor_a.start(20)\n${command}`);
    assert.ok(h.motors.every(([, speed]) => speed === 0));
    assert.match(h.log(), /run stopped:/);
  });
}

test('direct port not listed in profile is stopped at the end', async () => {
  const h = browserHarness();
  await h.run('hub.port.B.motor.start(40)', { ports: { A: { kind: 'motor', role: 'm' } } });
  assert.deepEqual(h.motors, [[1, 40], [0, 0], [1, 0]]);
});

test('print preserves hashes and reports output', async () => {
  const h = browserHarness();
  await h.run('print("motor #1") # comment');
  assert.match(h.log(), /motor #1/);
  assert.match(h.log(), /code complete/);
});

test('concurrent runs are refused and the running flag clears afterward', async () => {
  const h = browserHarness();
  let release;
  h.context.setTimeout = callback => { release = callback; };
  const first = h.run('motor_a.start(20)\ntime.sleep(1)');
  while (!release) await Promise.resolve();
  await h.run('motor_a.start(100)');
  assert.match(h.log(), /already running/);
  assert.ok(!h.motors.some(([, speed]) => speed === 100));
  release();
  await first;
  assert.equal(h.evaluate('hubBle._wedoRunning'), false);
});

test('disconnect during a wait prevents later movement', async () => {
  const h = browserHarness();
  h.context.setTimeout = callback => { h.evaluate('hubBle.server = null'); callback(); };
  await h.run('time.sleep(1)\nmotor_a.start(40)');
  assert.ok(h.motors.every(([, speed]) => speed === 0));
  assert.match(h.log(), /Hub disconnected/);
});

test('standalone motor test attempts stop after a transport error', async () => {
  const h = browserHarness();
  h.evaluate('hubBle').sendLwp3Motor = async (port, speed) => {
    h.motors.push([port, speed]);
    if (speed) throw new Error('write failed');
  };
  await h.context.doBleMotorTest();
  assert.deepEqual(h.motors.at(-1), [0, 0]);
});

test('preset runner shares the generated program runner', async () => {
  const h = browserHarness();
  await h.context.executeWeDo2IntentViaBle(h.profile, 'safe_probe');
  assert.ok(h.motors.some(([, speed]) => speed === -50));
  assert.match(h.log(), /code complete/);
});

test('all WeDo Blockly generators produce inspectable code, including sensor rejection', async () => {
  const h = browserHarness();
  const Py = { ORDER_SUBSCRIPT: 1, ORDER_RELATIONAL: 2 };
  h.context.Blockly = { Python: Py };
  h.context.registerWeDo2BlocklyGenerators();
  const block = { getFieldValue: name => ({ PORT: 'B', SPEED: '100', SECS: '.1', COLOR: '6', TEXT: 'hello', AXIS: 'roll' })[name] };
  const runnable = ['wd_led', 'wd_motor_run', 'wd_motor_start', 'wd_motor_stop', 'wd_wait', 'wd_print'];
  for (const type of runnable) {
    await h.run(Py[type](block));
    assert.match(h.log(), /code complete/);
  }
  for (const type of ['wd_motion_distance', 'wd_motion_detected', 'wd_tilt_angle']) {
    assert.equal(typeof Py[type](block)[0], 'string');
  }
  await h.run(Py.wd_wait_motion(block));
  assert.match(h.log(), /Unsupported WeDo direct command/);
});

test('Blockly preset XML dispatch preserves selected ports and loop contents', () => {
  const h = browserHarness();
  for (const intent of ['safe_probe', 'wave', 'drive_forward', 'beep_hello', 'custom']) {
    const xml = h.context.buildWeDo2BlocklyIntentXml(h.profile, intent);
    assert.equal(h.context.buildBlocklyIntentXml(h.profile, intent), xml);
    assert.match(xml, /^<xml.*<\/xml>$/s);
    if (intent === 'safe_probe') assert.match(xml, /<field name="PORT">B<\/field>/);
    if (intent === 'wave') assert.match(xml, /controls_repeat_ext/);
  }
});

test('BLE run dispatch covers Blockly, disconnected, stock unsupported and Pybricks', async () => {
  const h = browserHarness();
  h.evaluate('state.selectedId = "wedo2-custom"; blocklyWorkspace = {}; window.Blockly = {}; el("targetSel").value = "blockly-python";');
  h.context.Blockly = { Python: { workspaceToCode: () => 'hub.port.A.motor.start(25)\n' } };
  await h.context.doRunViaBle();
  assert.deepEqual(h.motors[0], [0, 25]);
  h.evaluate('hubBle.server = null');
  await h.context.doRunViaBle();
  assert.match(h.log(), /Not connected/);
  h.evaluate('hubBle.server = {connected: true}; state.selectedId = "51515-blast"; hubBle.mode = "lwp3"');
  await h.context.doRunViaBle();
  assert.match(h.log(), /Pybricks firmware required/);
  let uploaded;
  h.evaluate('hubBle.mode = "pybricks"');
  h.evaluate('hubBle').runPybricksCode = async code => { uploaded = code; };
  await h.context.doRunViaBle();
  assert.match(uploaded, /motor.start\(25\)/);
});

test('empty editor does not run an unrelated preset', async () => {
  const h = browserHarness();
  await h.run('  ');
  assert.deepEqual(h.motors, []);
  assert.match(h.log(), /Nothing to run/);
});

test('nested loops, comments, LED, beep and direct motor paths', async () => {
  const h = browserHarness();
  await h.run('hub.led(7)\nfor _ in range(2):\n    for j in range(2):\n        hub.port.B.motor.run_for_seconds(speed=-20, seconds=0) # reverse\nhub.sound.beep()');
  assert.equal(h.motors.filter(([port, speed]) => port === 1 && speed === -20).length, 4);
  assert.deepEqual(h.leds, [7, 6, 0]);
});

for (const id of ['wedo2-milo', 'wedo2-kraz', 'wedo2-custom']) {
  for (const intent of ['safe_probe', 'drive_forward', 'wave', 'beep_hello']) {
    test(`generated ${id} ${intent} runs without unsupported commands`, async () => {
      const h = browserHarness();
      const profile = h.evaluate(`PROFILES.find(p => p.id === '${id}')`);
      const source = h.context.generateWeDo2Code(profile, intent);
      await h.run(source, profile);
      assert.match(h.log(), /code complete/);
      if (intent === 'safe_probe' || intent === 'wave') {
        assert.ok(h.motors.some(([, speed]) => speed === -50));
      }
    });
  }
}

test('BLE failure stops every motor even when one stop fails', async () => {
  const h = browserHarness();
  h.evaluate('hubBle').sendLwp3Motor = async (port, speed) => {
    h.motors.push([port, speed]);
    if (port === 0) throw new Error('disconnected');
  };
  await h.run('motor_a.start(20)');
  assert.ok(h.motors.some(([port, speed]) => port === 1 && speed === 0));
  assert.match(h.log(), /disconnected/);
});

test('program runtime and command count are bounded before movement', async () => {
  const h = browserHarness();
  await h.run('time.sleep(2)\n'.repeat(11));
  assert.match(h.log(), /20 second/);
  assert.ok(h.motors.every(([, speed]) => speed === 0));
  await h.run('hub.led(6)\n'.repeat(501));
  assert.match(h.log(), /500 commands/);
  assert.deepEqual(h.leds, []);
});

test('Blockly executes generated code and stops a bare motor start', async () => {
  const h = browserHarness();
  h.evaluate('window.Blockly = {}; blocklyWorkspace = {};');
  h.context.Blockly = { Python: { workspaceToCode: () => 'hub.port.B.motor.start(100)\n' } };
  await h.context.executeWeDo2BlocklyViaBle(h.profile);
  assert.deepEqual(h.motors[0], [1, 100]);
  assert.ok(h.motors.some(([port, speed]) => port === 1 && speed === 0));
});

test('Blockly missing workspace reports an actionable message', async () => {
  const h = browserHarness();
  await h.context.executeWeDo2BlocklyViaBle(h.profile);
  assert.match(h.log(), /Open Blockly/);
});

test('Run via BLE uses the current editor contents on every run', async () => {
  const h = browserHarness();
  h.evaluate('state.selectedId = "wedo2-custom"; editor = { getValue: () => "motor_a.start(30)" };');
  await h.context.doRunViaBle();
  h.evaluate('editor.getValue = () => "motor_a.start(100)"');
  await h.context.doRunViaBle();
  assert.deepEqual(h.motors.filter(([, speed]) => speed !== 0), [[0, 30], [0, 100]]);
});

for (const mode of ['wedo2', 'lwp3']) {
  test(`${mode} transport encodes positive, negative, zero and both ports`, async () => {
    const h = browserHarness();
    const packets = [];
    const hub = h.evaluate('hubBle');
    hub.mode = mode;
    hub.rxChar = { writeValueWithResponse: async data => packets.push([...data]) };
    for (const [port, power] of [[0, 100], [1, -50], [0, 0]]) {
      await h.transport.call(hub, port, power);
    }
    assert.deepEqual(packets, mode === 'wedo2'
      ? [[1, 1, 1, 100], [2, 1, 1, 206], [1, 1, 1, 0]]
      : [[8, 0, 129, 0, 17, 81, 0, 100], [8, 0, 129, 1, 17, 81, 0, 206], [8, 0, 129, 0, 17, 81, 0, 0]]);
  });
}
