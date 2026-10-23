// Expand test filenames ourselves so Node 20 and Windows need no shell glob support.
const { readdirSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { spawnSync } = require('node:child_process');

const root = resolve(__dirname, '..');
const files = readdirSync(join(root, 'tests'))
  .filter(name => name.endsWith('.test.js'))
  .sort()
  .map(name => join('tests', name));
const result = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...files], {
  cwd: root, stdio: 'inherit'
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
