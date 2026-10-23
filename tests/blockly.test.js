const test = require('node:test');
const assert = require('node:assert/strict');
const Blockly = require('blockly/node');
const { pythonGenerator } = require('blockly/python');
const { browserHarness } = require('./helpers/browser');

Blockly.Python = pythonGenerator;
const setup = browserHarness();
Blockly.defineBlocksWithJsonArray(JSON.parse(JSON.stringify(setup.evaluate('WEDO2_BLOCKLY_BLOCKS'))));
setup.context.Blockly = Blockly;
setup.context.registerWeDo2BlocklyGenerators();

for (const id of ['wedo2-milo', 'wedo2-kraz', 'wedo2-custom']) {
  for (const intent of ['safe_probe', 'drive_forward', 'wave', 'beep_hello', 'custom']) {
    test(`real Blockly ${id} ${intent} compiles and executes`, async () => {
      const h = browserHarness();
      const profile = h.evaluate(`PROFILES.find(p => p.id === '${id}')`);
      const workspace = new Blockly.Workspace();
      try {
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(h.context.buildWeDo2BlocklyIntentXml(profile, intent)), workspace);
        const source = pythonGenerator.workspaceToCode(workspace);
        assert.ok(source.trim());
        await h.run(source, profile);
        assert.match(h.log(), /code complete/, source);
        if (intent === 'wave') assert.equal(h.motors.filter(([, speed]) => speed < 0).length, 3);
      } finally {
        workspace.dispose();
      }
    });
  }
}

test('changing a real Blockly motor field changes the emitted BLE command', async () => {
  const h = browserHarness();
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('wd_motor_run');
    block.setFieldValue('B', 'PORT');
    block.setFieldValue(0.1, 'SECS');
    for (const speed of [20, 100, -100, 0]) {
      block.setFieldValue(speed, 'SPEED');
      h.motors.length = 0;
      await h.run(pythonGenerator.workspaceToCode(workspace));
      assert.deepEqual(h.motors[0], [1, speed]);
    }
  } finally {
    workspace.dispose();
  }
});
