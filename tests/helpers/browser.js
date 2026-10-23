const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load the complete shipped script, without firing DOMContentLoaded or opening hardware.
// Tests can access lexical bindings through evaluate(), avoiding copied implementations.
function browserHarness() {
  const elements = new Map();
  const waits = [];
  const context = vm.createContext({
    console, Uint8Array, TextEncoder, TextDecoder,
    navigator: {}, window: {},
    document: {
      addEventListener() {},
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, { value: '', textContent: '', style: {} });
        return elements.get(id);
      }
    },
    localStorage: { getItem: () => null },
    setTimeout(callback, ms) { waits.push(ms); callback(); }
  });
  const appPath = path.join(__dirname, '../../web-app/app.js');
  vm.runInContext(fs.readFileSync(appPath, 'utf8'), context, { filename: appPath });
  const evaluate = code => vm.runInContext(code, context);
  const motors = [], leds = [];
  const transport = evaluate('hubBle.sendLwp3Motor');
  const hardware = Object.fromEntries(Object.entries(evaluate('hubBle')).filter(([, value]) => typeof value === 'function'));
  Object.assign(evaluate('hubBle'), {
    server: { connected: true }, mode: 'wedo2',
    sendLwp3Motor: async (port, speed) => motors.push([port, speed]),
    sendLwp3Led: async color => leds.push(color)
  });
  return {
    context, evaluate, motors, leds, waits, transport, hardware,
    profile: evaluate('PROFILES.find(p => p.id === "wedo2-custom")'),
    log: () => elements.get('terminalOutput')?.textContent || '',
    run(source, profile) { return context.executeWeDo2CodeViaBle(profile || this.profile, source); }
  };
}
module.exports = { browserHarness };
