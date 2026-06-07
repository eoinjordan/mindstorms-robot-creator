const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "cli.js");

async function runCli(args) {
  const { stdout } = await execFileAsync(process.execPath, [CLI, ...args], {
    cwd: ROOT,
    windowsHide: true
  });
  return stdout.trim();
}

test("CLI lists actions as compact JSON", async () => {
  const raw = await runCli(["actions", "--compact"]);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.actions.includes("robot_scan"));
  assert.ok(parsed.actions.includes("builder_session_summary"));
});

test("CLI describe uses convenience command", async () => {
  const raw = await runCli(["describe", "51515-blast", "--compact"]);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.profile.id, "51515-blast");
});

test("CLI raw run supports --set params", async () => {
  const raw = await runCli([
    "run",
    "probe_plan_create",
    "--set",
    "profileId=sim-two-wheel-drive",
    "--set",
    "duty=15",
    "--compact"
  ]);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.plan.safety.maxDuty, 15);
});

test("CLI builder flow starts, observes, and summarizes", async () => {
  const sessionId = `cli-test-${Date.now()}`;
  const startRaw = await runCli([
    "builder",
    "start",
    "51515-blast",
    "--goal",
    "test safe movement",
    "--audience",
    "kid",
    "--session-id",
    sessionId,
    "--compact"
  ]);
  const start = JSON.parse(startRaw);
  assert.equal(start.ok, true);
  assert.equal(start.session.id, sessionId);

  const observeRaw = await runCli([
    "builder",
    "observe",
    sessionId,
    "The right motor did not move.",
    "--compact"
  ]);
  const observe = JSON.parse(observeRaw);
  assert.equal(observe.ok, true);
  assert.equal(observe.summary.likelyIssues[0], "missing_motor_or_wrong_port");

  const summaryRaw = await runCli(["builder", "summary", sessionId, "--compact"]);
  const summary = JSON.parse(summaryRaw);
  assert.equal(summary.ok, true);
  assert.equal(summary.summary.latestObservation, "The right motor did not move.");
});
