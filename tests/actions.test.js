const assert = require("node:assert/strict");
const test = require("node:test");

const { createServer, handleAction } = require("../server");

test("action layer scans seed profiles", async () => {
  const result = await handleAction("robot_scan", {});
  assert.equal(result.ok, true);
  assert.ok(result.devices.some((device) => device.id === "51515-blast"));
  assert.ok(result.devices.some((device) => device.id === "sim-two-wheel-drive"));
});

test("simulated probe can be classified", async () => {
  const probe = await handleAction("probe_run", {
    profileId: "sim-two-wheel-drive",
    label: "two_wheel_drive"
  });
  assert.equal(probe.ok, true);
  assert.equal(probe.session.profileId, "sim-two-wheel-drive");

  const classified = await handleAction("robot_classify", { session: probe.session });
  assert.equal(classified.ok, true);
  assert.equal(classified.classification.label, "two_wheel_drive");
  assert.ok(classified.classification.confidence >= 0.8);
});

test("builder session records observations and recommends next action", async () => {
  const sessionId = `test-builder-${Date.now()}`;
  const start = await handleAction("builder_session_start", {
    profileId: "51515-blast",
    goal: "test safe movement",
    audience: "kid",
    sessionId
  });
  assert.equal(start.ok, true);
  assert.equal(start.session.id, sessionId);

  const appended = await handleAction("builder_session_append", {
    sessionId,
    type: "observation",
    text: "The left wheel turned backward."
  });
  assert.equal(appended.ok, true);
  assert.equal(appended.summary.likelyIssues[0], "motor_direction_reversed");

  const summary = await handleAction("builder_session_summary", { sessionId });
  assert.equal(summary.ok, true);
  assert.equal(summary.summary.latestObservation, "The left wheel turned backward.");
  assert.ok(summary.summary.nextActions.some((item) => item.includes("reverse")));
});

test("official client handoff is generated for 51515 profiles", async () => {
  const result = await handleAction("official_client_handoff", {
    profileId: "51515-blast",
    goal: "run a first test"
  });
  assert.equal(result.ok, true);
  assert.equal(result.handoff.clientId, "robot-inventor-51515");
  assert.ok(result.handoff.steps.length >= 5);
});

test("HTTP wrapper exposes action API and CORS headers", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const options = await fetch(`${baseUrl}/run`, { method: "OPTIONS" });
    assert.equal(options.status, 204);
    assert.equal(options.headers.get("access-control-allow-origin"), "*");

    const actions = await fetch(`${baseUrl}/actions`);
    assert.equal(actions.status, 200);
    const actionsBody = await actions.json();
    assert.ok(actionsBody.actions.includes("builder_session_start"));

    const run = await fetch(`${baseUrl}/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "robot_describe",
        params: { profileId: "51515-blast" }
      })
    });
    assert.equal(run.status, 200);
    const runBody = await run.json();
    assert.equal(runBody.profile.id, "51515-blast");
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
});
