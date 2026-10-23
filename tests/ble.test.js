const test = require('node:test');
const assert = require('node:assert/strict');
const { browserHarness } = require('./helpers/browser');

for (const mode of ['wedo2', 'lwp3', 'pybricks']) {
  test(`BLE service discovery selects ${mode} and disconnect clears state`, async () => {
    const h = browserHarness();
    const hub = h.evaluate('hubBle');
    const service = h.evaluate(({ wedo2: 'WEDO2_IO_SERVICE', lwp3: 'LWP3_SERVICE', pybricks: 'PYBRICKS_SERVICE' })[mode]);
    const listeners = {};
    let stopped = false, disconnected = false, options;
    const characteristic = {
      startNotifications: async () => {},
      stopNotifications: async () => { stopped = true; },
      addEventListener: (event, callback) => { listeners[event] = callback; }
    };
    const server = {
      connected: true,
      disconnect() { disconnected = true; },
      async getPrimaryService(uuid) {
        if (uuid !== service) throw new Error('Service absent');
        return { getCharacteristic: async () => characteristic };
      }
    };
    h.context.navigator.bluetooth = {
      async requestDevice(request) {
        options = request;
        return { gatt: { connect: async () => server }, addEventListener: (event, callback) => { listeners[event] = callback; } };
      }
    };
    await hub.connect();
    assert.equal(hub.mode, mode);
    assert.equal(hub.connected, true);
    assert.ok(options.optionalServices.includes(service));
    if (mode !== 'wedo2') {
      let received;
      hub._onData = value => { received = value; };
      listeners.characteristicvaluechanged({ target: { value: new DataView(new TextEncoder().encode('ok').buffer) } });
      assert.match(received, mode === 'pybricks' ? /ok/ : /6f 6b/);
    }
    await hub.disconnect();
    assert.ok(stopped && disconnected);
    assert.equal(hub.connected, false);
    assert.equal(hub.rxChar, null);
    assert.equal(hub.mode, null);
  });
}

test('unknown BLE service produces a useful connection error', async () => {
  const h = browserHarness();
  h.context.navigator.bluetooth = { requestDevice: async () => ({
    addEventListener() {}, gatt: { connect: async () => ({ getPrimaryService: async () => { throw new Error('absent'); } }) }
  }) };
  await assert.rejects(h.evaluate('hubBle').connect(), /no known service/);
});

test('UART writes preserve UTF-8 bytes and split into 20-byte packets', async () => {
  const h = browserHarness();
  const hub = h.evaluate('hubBle');
  const packets = [];
  hub.rxChar = { writeValueWithResponse: async bytes => packets.push([...bytes]) };
  await hub.write('hello'.repeat(10));
  assert.deepEqual(packets.map(p => p.length), [20, 20, 10]);
  assert.equal(new TextDecoder().decode(Uint8Array.from(packets.flat())), 'hello'.repeat(10));
  hub.rxChar = null;
  await assert.rejects(hub.write('x'), /Not connected/);
});

test('Pybricks upload and REPL reject stock firmware and preserve edited lines', async () => {
  const h = browserHarness();
  const hub = h.evaluate('hubBle');
  await assert.rejects(hub.sendRepl('x'), /requires Pybricks/);
  await assert.rejects(hub.runPybricksCode('x'), /Pybricks firmware required/);
  hub.mode = 'pybricks';
  const sent = [];
  hub.write = async text => sent.push(text);
  await hub.runPybricksCode('a = 100\nprint(a)');
  assert.deepEqual(sent, ['\x03\x03', 'a = 100\r\n', 'print(a)\r\n']);
  await hub.sendRepl('a = 50');
  assert.equal(sent.at(-1), 'a = 50\r\n');
  await hub.beep();
  assert.match(sent.at(-1), /speaker.beep/);
});

test('LED transport covers native, LWP3 and unsupported firmware', async () => {
  const h = browserHarness();
  const hub = h.evaluate('hubBle');
  const packets = [];
  hub.rxChar = { writeValueWithResponse: async bytes => packets.push([...bytes]) };
  await h.hardware.sendLwp3Led.call(hub, 6);
  assert.deepEqual(packets.pop(), [6, 4, 1, 6]);
  hub.mode = 'lwp3';
  await h.hardware.sendLwp3Led.call(hub, 3);
  assert.deepEqual(packets.pop(), [8, 0, 129, 50, 17, 81, 0, 3]);
  await hub.beep();
  assert.deepEqual(packets.pop(), [6, 0, 3, 1, 1, 0]);
  hub.mode = null;
  await h.hardware.sendLwp3Led.call(hub, 6);
  assert.deepEqual(packets, []);
  await assert.rejects(h.transport.call(hub, 0, 30), /LWP3 mode required/);
});
