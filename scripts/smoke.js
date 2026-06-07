#!/usr/bin/env node
/* eslint-disable no-console */
const { handleAction } = require("../server");

async function main() {
  const scan = await handleAction("robot_scan");
  const devices = scan.devices.filter((device) => device.id.startsWith("sim-"));
  const labels = [];

  for (const device of devices) {
    const probe = await handleAction("probe_run", { profileId: device.id });
    const result = await handleAction("robot_classify", { session: probe.session });
    labels.push({
      profileId: device.id,
      expected: probe.session.label,
      classified: result.classification.label,
      confidence: result.classification.confidence
    });
  }

  console.log(JSON.stringify({ ok: true, labels }, null, 2));
}

main().catch((err) => {
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});
