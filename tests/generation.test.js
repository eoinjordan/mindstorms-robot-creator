const test = require('node:test');
const assert = require('node:assert/strict');
const { browserHarness } = require('./helpers/browser');

const inventory = browserHarness();
const profiles = inventory.evaluate('PROFILES');
const targets = inventory.evaluate('FAMILY_TARGETS');
for (const profile of profiles) {
  for (const { value: target } of targets[profile.family]) {
    if (target === 'blockly-python') continue;
    test(`${profile.id}: ${target} generation supports every preset and custom edits`, () => {
      const h = browserHarness();
      for (const intent of ['safe_probe', 'drive_forward', 'wave', 'beep_hello']) {
        const code = h.context.generateCode(profile, target, intent);
        assert.ok(code.includes(profile.name));
        assert.ok(!code.includes('undefined'));
        assert.equal(code, h.context.generateCode(profile, target, intent));
        assert.ok(code.endsWith('\n'));
      }
      const custom = target === 'rcx-nqc' ? 'OnFwd(OUT_A);' : 'print("edited program")';
      assert.ok(h.context.generateCode(profile, target, 'custom', custom).includes(custom));
    });
  }
}

test('every Blockly preset can be generated for every profile', () => {
  const h = browserHarness();
  for (const profile of profiles) {
    for (const intent of ['safe_probe', 'drive_forward', 'wave', 'beep_hello', 'custom']) {
      const xml = h.context.buildBlocklyIntentXml(profile, intent);
      assert.match(xml, /^<xml/);
      assert.match(xml, /<\/xml>$/);
      assert.ok(!xml.includes('undefined'));
    }
  }
});
