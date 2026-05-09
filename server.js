#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const crypto = require("node:crypto");
const http = require("node:http");
const path = require("node:path");

const { createProbePlan, describeProfile, runProbe } = require("./adapters/m5stack-basex");
const { officialClientStatus } = require("./adapters/lego-official-client");

const PORT = Number(process.env.PORT || 3095);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 1024 * 1024);
const PROFILE_DIR = path.join(__dirname, "examples", "profiles");
const EXAMPLE_SESSION_DIR = path.join(__dirname, "examples", "sessions");
const OUT_DIR = path.join(__dirname, "out");
const BUILDER_SESSION_DIR = path.join(OUT_DIR, "builder-sessions");

const ACTIONS = [
  "robot_scan",
  "robot_describe",
  "probe_plan_create",
  "probe_run",
  "robot_classify",
  "dataset_export",
  "official_client_status",
  "official_client_handoff",
  "builder_session_start",
  "builder_session_append",
  "builder_session_summary",
  "code_generate",
  "lms_write",
  "lms_read"
];

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  };
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function listProfiles() {
  if (!fs.existsSync(PROFILE_DIR)) return [];
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".json")) files.push(entryPath);
    }
  };
  walk(PROFILE_DIR);
  return files.sort().map((filePath) => readJsonFile(filePath));
}

function getProfile(profileId) {
  const profiles = listProfiles();
  if (!profileId && profiles.length > 0) return profiles[0];
  const id = String(profileId || "").trim();
  const profile = profiles.find((item) => item.id === id || item.name === id);
  if (!profile) {
    throw new Error(`unknown profile: ${id || "(default)"}`);
  }
  return profile;
}

function readyState() {
  const required = [
    path.join(__dirname, "schemas", "robot-profile.schema.json"),
    path.join(__dirname, "schemas", "probe-session.schema.json"),
    path.join(__dirname, "schemas", "builder-session.schema.json")
  ];
  const missing = required.filter((filePath) => !fs.existsSync(filePath));
  return {
    ok: missing.length === 0,
    missing
  };
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function safeSlug(value, fallback = "item") {
  const text = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return text || fallback;
}

function builderSessionPath(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");
  return path.join(BUILDER_SESSION_DIR, `${safeSlug(sessionId, "session")}.json`);
}

function range(values) {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

function extractFeatures(session) {
  const telemetry = Array.isArray(session.telemetry) ? session.telemetry : [];
  const portNames = Object.keys(telemetry[0]?.ports || {});
  const deltas = {};
  const speedRanges = {};
  const meanAbsSpeeds = {};
  const stalledPorts = new Set();

  for (const port of portNames) {
    const positions = telemetry.map((row) => safeNumber(row.ports?.[port]?.position));
    const speeds = telemetry.map((row) => safeNumber(row.ports?.[port]?.speed));
    deltas[port] = positions.length > 1 ? positions[positions.length - 1] - positions[0] : 0;
    speedRanges[port] = range(speeds);
    meanAbsSpeeds[port] = speeds.length === 0
      ? 0
      : speeds.reduce((sum, speed) => sum + Math.abs(speed), 0) / speeds.length;
    for (const row of telemetry) {
      if (row.ports?.[port]?.stalled) stalledPorts.add(port);
    }
  }

  const imuGz = telemetry.map((row) => safeNumber(row.imu?.gz));
  const imuGy = telemetry.map((row) => safeNumber(row.imu?.gy));
  const activePorts = portNames.filter((port) => Math.abs(deltas[port]) > 10 || speedRanges[port] > 5);
  const meanSpeedRange = activePorts.length === 0
    ? 0
    : activePorts.reduce((sum, port) => sum + speedRanges[port], 0) / activePorts.length;
  const meanAbsSpeed = activePorts.length === 0
    ? 0
    : activePorts.reduce((sum, port) => sum + meanAbsSpeeds[port], 0) / activePorts.length;

  return {
    activePorts,
    deltas,
    speedRanges,
    meanSpeedRange,
    meanAbsSpeeds,
    meanAbsSpeed,
    stalledPorts: Array.from(stalledPorts),
    imuGzRange: range(imuGz),
    imuGyRange: range(imuGy)
  };
}

function classifySession(session) {
  const features = extractFeatures(session);
  let label = "unknown";
  let confidence = 0.35;

  if (features.stalledPorts.length > 0) {
    label = "gripper";
    confidence = 0.86;
  } else if (features.activePorts.length >= 2 && features.imuGzRange > 0.35) {
    if (features.meanAbsSpeed < 40) {
      label = "tracked_vehicle";
      confidence = 0.73;
    } else {
      label = "two_wheel_drive";
      confidence = 0.82;
    }
  } else if (features.activePorts.length === 1 && features.imuGyRange > 0.25) {
    label = "arm";
    confidence = 0.68;
  }

  return {
    label,
    confidence,
    features
  };
}

function flattenTelemetry(session) {
  const rows = Array.isArray(session.telemetry) ? session.telemetry : [];
  const ports = Object.keys(rows[0]?.ports || {});
  return rows.map((row) => {
    const flat = {
      sessionId: session.sessionId,
      label: session.label || "unknown",
      tMs: row.tMs
    };
    for (const port of ports) {
      flat[`${port}_position`] = row.ports?.[port]?.position ?? 0;
      flat[`${port}_speed`] = row.ports?.[port]?.speed ?? 0;
      flat[`${port}_duty`] = row.ports?.[port]?.duty ?? 0;
      flat[`${port}_stalled`] = row.ports?.[port]?.stalled ? 1 : 0;
    }
    flat.imu_ax = row.imu?.ax ?? 0;
    flat.imu_ay = row.imu?.ay ?? 0;
    flat.imu_az = row.imu?.az ?? 0;
    flat.imu_gx = row.imu?.gx ?? 0;
    flat.imu_gy = row.imu?.gy ?? 0;
    flat.imu_gz = row.imu?.gz ?? 0;
    return flat;
  });
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))
  ].join("\n");
}

function exportDataset(session, format = "jsonl") {
  const rows = flattenTelemetry(session);
  if (format === "json") return JSON.stringify(session, null, 2);
  if (format === "csv") return toCsv(rows);
  if (format === "edge-impulse-json") {
    const sample = rows[0] || {};
    const sensorNames = Object.keys(sample).filter((key) => !["sessionId", "label", "tMs"].includes(key));
    const values = rows.map((row) => sensorNames.map((name) => row[name]));
    return JSON.stringify({
      protected: { ver: "v1", alg: "none" },
      signature: "unsigned",
      payload: {
        device_name: session.device?.id || "simulated",
        device_type: session.device?.family || "m5stack-basex",
        interval_ms: Math.round(1000 / safeNumber(session.sampleRateHz, 50)),
        sensors: sensorNames.map((name) => ({ name, units: name.includes("position") ? "count" : "raw" })),
        values
      }
    }, null, 2);
  }
  return rows.map((row) => JSON.stringify(row)).join("\n");
}

function saveExport(session, format, content) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const extension = format === "csv" ? "csv" : format === "json" || format === "edge-impulse-json" ? "json" : "jsonl";
  const safeId = String(session.sessionId || "session").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filePath = path.join(OUT_DIR, `${safeId}.${extension}`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function recommendedClientId(profile) {
  if (!profile) return "robot-inventor-51515";
  if (profile.family === "ev3") return "ev3-classroom";
  if (profile.family === "robot-inventor" || profile.family === "spike-prime") return "robot-inventor-51515";
  return "local-mcp";
}

function createOfficialClientHandoff(params = {}) {
  const profile = params.profileId ? getProfile(params.profileId) : null;
  const clientId = String(params.clientId || recommendedClientId(profile));
  const goal = String(params.goal || "run a small safe test program").trim();
  const profileName = profile?.name || "selected robot";
  const safety = [
    "Put the robot on the floor or a stand with space around moving parts.",
    "Keep one hand near the hub stop button or app stop control.",
    "Run only short low-power tests until the ports and direction are confirmed."
  ];
  let steps;

  if (clientId === "ev3-classroom") {
    steps = [
      "Open EV3 Classroom and connect the EV3 brick.",
      `Select or create a project for ${profileName}.`,
      "Add the generated blocks or code exactly as shown by the agent.",
      "Run the program once at low power.",
      "Report what moved, what did not move, and any error text back to the builder session."
    ];
  } else if (clientId === "robot-inventor-51515") {
    steps = [
      "Open the LEGO MINDSTORMS Robot Inventor app and connect the 51515 hub.",
      `Open or create a project for ${profileName}.`,
      "Add the generated program or recreate the short test sequence in the LEGO app.",
      "Run the program once with the robot clear of hands and cables.",
      "Report the exact movement, sounds, hub light, and any app error back to the builder session."
    ];
  } else {
    steps = [
      "Connect the robot through the local adapter or simulator.",
      `Load the profile for ${profileName}.`,
      "Run the generated test through the local action server or Android app.",
      "Stop immediately if a motor strains, stalls, or moves toward a hard stop.",
      "Append the observed result to the builder session."
    ];
  }

  return {
    profileId: profile?.id || null,
    profileName,
    family: profile?.family || null,
    clientId,
    goal,
    safety,
    steps
  };
}

function createBuilderSession(params = {}) {
  const profile = getProfile(params.profileId);
  const createdAt = nowIso();
  const id = params.sessionId
    ? safeSlug(params.sessionId, "builder-session")
    : `${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}-${safeSlug(profile.id)}-${crypto.randomUUID().slice(0, 8)}`;
  const goal = String(params.goal || `build and debug ${profile.name}`).trim();
  const audience = String(params.audience || "family").trim();
  const handoff = createOfficialClientHandoff({
    profileId: profile.id,
    clientId: params.clientId,
    goal
  });
  const session = {
    schemaVersion: 1,
    id,
    title: String(params.title || `${profile.name} builder session`).trim(),
    profileId: profile.id,
    profileName: profile.name,
    family: profile.family,
    audience,
    mode: String(params.mode || handoff.clientId),
    goal,
    state: "ready_for_user",
    safetyLevel: "kid-safe",
    createdAt,
    updatedAt: createdAt,
    steps: [
      {
        id: "step-1",
        type: "agent_instruction",
        author: "agent",
        createdAt,
        text: "Start with one short, low-power test. The human runs the robot and reports what happened before the agent suggests the next change.",
        data: { handoff }
      }
    ],
    nextActions: [
      "Open the recommended LEGO client or simulator.",
      "Run the first safe test only once.",
      "Append a user observation with exact movement, lights, sounds, and error text."
    ]
  };
  writeJsonFile(builderSessionPath(session.id), session);
  return session;
}

function readBuilderSession(sessionId) {
  const filePath = builderSessionPath(sessionId);
  if (fs.existsSync(filePath)) return readJsonFile(filePath);
  const examplePath = path.join(EXAMPLE_SESSION_DIR, `${safeSlug(sessionId, "session")}.json`);
  if (fs.existsSync(examplePath)) return readJsonFile(examplePath);
  throw new Error(`unknown builder session: ${sessionId}`);
}

function writeBuilderSession(session) {
  session.updatedAt = nowIso();
  writeJsonFile(builderSessionPath(session.id), session);
}

function appendBuilderSessionStep(session, params = {}) {
  const type = String(params.type || "observation").trim();
  const allowedTypes = new Set([
    "agent_instruction",
    "user_action",
    "observation",
    "run_result",
    "fix",
    "question",
    "answer",
    "note"
  ]);
  if (!allowedTypes.has(type)) {
    throw new Error(`unsupported builder step type: ${type}`);
  }
  const step = {
    id: `step-${(Array.isArray(session.steps) ? session.steps.length : 0) + 1}`,
    type,
    author: String(params.author || (type === "agent_instruction" || type === "fix" ? "agent" : "human")),
    createdAt: nowIso(),
    text: String(params.text || "").trim(),
    data: params.data || {}
  };
  if (!step.text) throw new Error("text is required");
  session.steps = Array.isArray(session.steps) ? session.steps : [];
  session.steps.push(step);
  if (type === "observation" || type === "run_result" || type === "answer") session.state = "debugging";
  if (type === "agent_instruction" || type === "fix") session.state = "ready_for_user";
  return step;
}

function summarizeBuilderSession(session) {
  const steps = Array.isArray(session.steps) ? session.steps : [];
  const observations = steps.filter((step) => ["observation", "run_result", "answer"].includes(step.type));
  const latest = observations[observations.length - 1] || null;
  const text = String(latest?.text || "").toLowerCase();
  const likelyIssues = [];
  const nextActions = [];
  const questions = [];

  if (!latest) {
    nextActions.push("Ask the user to run one short safe test and describe exactly what happened.");
    questions.push("Which motor or part moved first?");
    questions.push("Did the LEGO app show an error?");
  } else if (/disconnect|bluetooth|pair|connect|hub not found|lost/.test(text)) {
    likelyIssues.push("connection_or_pairing");
    nextActions.push("Keep the code unchanged and reconnect the hub in the official LEGO client.");
    nextActions.push("Confirm battery level and that no other app is connected to the hub.");
    questions.push("Does the hub appear connected in the LEGO app before running the program?");
  } else if (/error|exception|warning|red|failed|cannot|can't/.test(text)) {
    likelyIssues.push("program_or_client_error");
    nextActions.push("Capture the exact error text before changing the robot or ports.");
    nextActions.push("Run the smallest single-motor program to separate app/code errors from build issues.");
    questions.push("What is the exact app or hub error text?");
  } else if (/not move|did not move|doesn.t move|nothing happened|no movement|stopped/.test(text)) {
    likelyIssues.push("missing_motor_or_wrong_port");
    nextActions.push("Check that the expected motor port in the profile matches the physical cable.");
    nextActions.push("Run a one-port low-power motor test on the suspected port.");
    questions.push("Did any hub light, sound, or motor twitch happen?");
  } else if (/wrong way|backward|reverse|opposite|spins wrong|turns wrong/.test(text)) {
    likelyIssues.push("motor_direction_reversed");
    nextActions.push("Keep the port assignment and reverse that motor direction in the generated code.");
    nextActions.push("Run the same test again without increasing power.");
    questions.push("Which side or joint moved the wrong way?");
  } else if (/stall|stuck|jam|grind|struggle|blocked|hard stop/.test(text)) {
    likelyIssues.push("mechanical_binding_or_stall");
    nextActions.push("Stop testing powered movement until the mechanism can move freely by hand.");
    nextActions.push("Reduce duty and duration before the next motor test.");
    questions.push("Can the affected joint or wheel move freely when the robot is off?");
  } else {
    likelyIssues.push("needs_more_observation");
    nextActions.push("Change only one thing: port, direction, or program step.");
    nextActions.push("Run another short test and append the result.");
    questions.push("Which exact motor, wheel, or attachment moved?");
  }

  return {
    state: session.state || "debugging",
    latestObservation: latest ? latest.text : null,
    likelyIssues,
    nextActions,
    questions,
    safetyReminder: "Use short low-power tests and keep stop controls visible."
  };
}

// ─── ZIP / LMS helpers ────────────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xFFFFFFFF >>> 0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0);
}

function dosDateTime(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)) & 0xFFFF;
  const d = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF;
  return { time, date: d };
}

function buildZip(entries) {
  const now = new Date();
  const dt = dosDateTime(now);
  const localParts = [];
  const centralRecords = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const dataBytes = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const checksum = crc32(dataBytes);
    const size = dataBytes.length;
    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dt.time, 10);
    local.writeUInt16LE(dt.date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    nameBytes.copy(local, 30);
    centralRecords.push({ nameBytes, checksum, size, offset, dt });
    localParts.push(local, dataBytes);
    offset += local.length + size;
  }
  const centralParts = centralRecords.map(({ nameBytes, checksum, size, offset: fo, dt: fdt }) => {
    const rec = Buffer.alloc(46 + nameBytes.length);
    rec.writeUInt32LE(0x02014b50, 0);
    rec.writeUInt16LE(20, 4);
    rec.writeUInt16LE(20, 6);
    rec.writeUInt16LE(0, 8);
    rec.writeUInt16LE(0, 10);
    rec.writeUInt16LE(fdt.time, 12);
    rec.writeUInt16LE(fdt.date, 14);
    rec.writeUInt32LE(checksum, 16);
    rec.writeUInt32LE(size, 20);
    rec.writeUInt32LE(size, 24);
    rec.writeUInt16LE(nameBytes.length, 28);
    rec.writeUInt16LE(0, 30);
    rec.writeUInt16LE(0, 32);
    rec.writeUInt16LE(0, 34);
    rec.writeUInt16LE(0, 36);
    rec.writeUInt32LE(0, 38);
    rec.writeUInt32LE(fo, 42);
    nameBytes.copy(rec, 46);
    return rec;
  });
  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(centralRecords.length, 8);
  eocd.writeUInt16LE(centralRecords.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDir, eocd]);
}

const HUB_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="12" fill="#006A6A"/>
<rect x="10" y="18" width="44" height="28" rx="7" fill="#004D4D"/>
<circle cx="32" cy="32" r="9" fill="#00BFBF"/>
<circle cx="32" cy="32" r="5" fill="#006A6A"/>
<rect x="14" y="48" width="10" height="4" rx="2" fill="#003535"/>
<rect x="40" y="48" width="10" height="4" rx="2" fill="#003535"/>
</svg>`;

function writeLmsFile(name, pythonSource) {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const now = new Date().toISOString();
  const manifest = JSON.stringify({
    type: "python",
    created: now,
    id,
    lastsaved: now,
    size: 0,
    name,
    version: 11,
    slotIndex: 0,
    state: { playMode: "download" },
    zoomLevel: 1,
    workspaceX: 120,
    workspaceY: 120,
    extensions: [],
    showAllBlocks: true
  });
  const projectBody = JSON.stringify({ main: pythonSource });
  const zipBuf = buildZip([
    { name: "manifest.json", data: manifest },
    { name: "projectbody.json", data: projectBody },
    { name: "icon.svg", data: HUB_ICON_SVG }
  ]);
  const slug = safeSlug(name, "program");
  const filePath = path.join(OUT_DIR, `${slug}.lms`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(filePath, zipBuf);
  return filePath;
}

function readLmsFile(filePath) {
  const buf = fs.readFileSync(filePath);
  // Locate and walk local file headers (no decompression needed for STORED entries)
  const entries = {};
  let pos = 0;
  while (pos < buf.length - 4) {
    if (buf.readUInt32LE(pos) !== 0x04034b50) { pos++; continue; }
    const compression = buf.readUInt16LE(pos + 8);
    const compressedSize = buf.readUInt32LE(pos + 18);
    const nameLen = buf.readUInt16LE(pos + 26);
    const extraLen = buf.readUInt16LE(pos + 28);
    const name = buf.slice(pos + 30, pos + 30 + nameLen).toString("utf8");
    const dataStart = pos + 30 + nameLen + extraLen;
    const dataEnd = dataStart + compressedSize;
    if (compression === 0) {
      entries[name] = buf.slice(dataStart, dataEnd).toString("utf8");
    } else if (compression === 8) {
      const { inflateRawSync } = require("node:zlib");
      entries[name] = inflateRawSync(buf.slice(dataStart, dataEnd)).toString("utf8");
    }
    pos = dataEnd;
  }
  return entries;
}

// ─── Code generation ─────────────────────────────────────────────────────────

function toVarName(role) {
  return String(role || "motor")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase() || "motor";
}

function generatePybricksCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const pupParts = new Set(["Motor"]);
  for (const [, p] of sensorEntries) {
    if (p.part === "color-sensor") pupParts.add("ColorSensor");
    if (p.part === "distance-sensor") pupParts.add("UltrasonicSensor");
    if (p.part === "force-sensor") pupParts.add("ForceSensor");
  }
  const lines = [
    `# ${profile.name} — ${profile.kit || "Robot Inventor 51515"}`,
    `# Target: pybricks-python`,
    `# Generated by lego-mindstorms-mcp`,
    ``,
    `from pybricks.hubs import InventorHub`,
    `from pybricks.pupdevices import ${[...pupParts].join(", ")}`,
    `from pybricks.parameters import Port, Direction, Button, Color, Stop`,
    `from pybricks.tools import wait, StopWatch`,
    ``,
    `# Safety constants — adjust carefully`,
    `SAFE_SPEED = 200   # deg/s`,
    `SAFE_ANGLE = 360   # degrees per probe sweep`,
    `WAIT_MS    = 500   # pause between steps`,
    ``,
    `hub = InventorHub()`,
    ``
  ];
  if (motorEntries.length > 0) {
    lines.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries) {
      const varName = toVarName(p.role);
      const dir = p.positiveDirection === "counterclockwise"
        ? `, positive_direction=Direction.COUNTERCLOCKWISE` : "";
      lines.push(`${varName} = Motor(Port.${port}${dir})  # ${p.role}`);
    }
    lines.push("");
  }
  if (sensorEntries.length > 0) {
    lines.push("# Sensor bindings from profile");
    for (const [port, p] of sensorEntries) {
      const varName = toVarName(p.role);
      if (p.part === "color-sensor") lines.push(`${varName} = ColorSensor(Port.${port})  # ${p.role}`);
      else if (p.part === "distance-sensor") lines.push(`${varName} = UltrasonicSensor(Port.${port})  # ${p.role}`);
    }
    lines.push("");
  }
  lines.push("# Program");
  if (intent === "beep_hello") {
    lines.push(`hub.speaker.beep(frequency=500, duration=300)`);
    lines.push(`hub.light.on(Color.GREEN)`);
    lines.push(`wait(1000)`);
    lines.push(`hub.light.off()`);
  } else if (intent === "safe_probe") {
    lines.push(`hub.light.on(Color.YELLOW)`);
    for (const [port, p] of motorEntries) {
      const varName = toVarName(p.role);
      lines.push(`print("Testing ${p.role} (Port ${port})")`);
      lines.push(`${varName}.run_angle(SAFE_SPEED, SAFE_ANGLE)`);
      lines.push(`wait(WAIT_MS)`);
      lines.push(`${varName}.run_angle(SAFE_SPEED, -SAFE_ANGLE)`);
      lines.push(`wait(WAIT_MS)`);
    }
    lines.push(`hub.light.on(Color.GREEN)`);
    lines.push(`hub.speaker.beep(frequency=800, duration=200)`);
    lines.push(`print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel/.test(p.role));
    if (drives.length >= 2) {
      lines.push(`# Drive forward 1 second`);
      for (const [, p] of drives) lines.push(`${toVarName(p.role)}.run(SAFE_SPEED)`);
      lines.push(`wait(1000)`);
      for (const [, p] of drives) lines.push(`${toVarName(p.role)}.stop()`);
    } else if (drives.length === 1) {
      lines.push(`${toVarName(drives[0][1].role)}.run_angle(SAFE_SPEED, SAFE_ANGLE)`);
    } else {
      lines.push(`# No drive motors found — add motor code for ${profile.name}`);
    }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|action|body/.test(p.role));
    if (arms.length > 0) {
      const [, p] = arms[0];
      const varName = toVarName(p.role);
      lines.push(`for _ in range(3):`);
      lines.push(`    ${varName}.run_angle(SAFE_SPEED, 90)`);
      lines.push(`    wait(200)`);
      lines.push(`    ${varName}.run_angle(SAFE_SPEED, -90)`);
      lines.push(`    wait(200)`);
    } else {
      lines.push(`hub.speaker.beep()  # No arm motor found for wave`);
    }
  } else if (intent === "custom" && customCode) {
    lines.push(String(customCode));
  } else {
    lines.push(`hub.speaker.beep()`);
    lines.push(`wait(500)`);
  }
  return lines.join("\n") + "\n";
}

function generateLegoStockCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const lines = [
    `# ${profile.name} — ${profile.kit || "Robot Inventor 51515"}`,
    `# Target: lego-stock-python (MINDSTORMS Robot Inventor app)`,
    `# Generated by lego-mindstorms-mcp`,
    ``,
    `from mindstorms import MSHub, Motor, MotorPair, ColorSensor, DistanceSensor, App`,
    `from mindstorms.control import wait_for_seconds, wait_until, Timer`,
    `from mindstorms.operator import greater_than, greater_than_or_equal_to, less_than, less_than_or_equal_to, equal_to, not_equal_to`,
    `import math`,
    ``,
    `# Safety constants — adjust carefully`,
    `SAFE_SPEED = 30   # percent`,
    `WAIT_SECS  = 0.5`,
    ``,
    `hub = MSHub()`,
    ``
  ];
  if (motorEntries.length > 0) {
    lines.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries) {
      lines.push(`${toVarName(p.role)} = Motor('${port}')  # ${p.role}`);
    }
    lines.push("");
  }
  if (sensorEntries.length > 0) {
    lines.push("# Sensor bindings from profile");
    for (const [port, p] of sensorEntries) {
      if (p.part === "color-sensor") lines.push(`${toVarName(p.role)} = ColorSensor('${port}')  # ${p.role}`);
      else if (p.part === "distance-sensor") lines.push(`${toVarName(p.role)} = DistanceSensor('${port}')  # ${p.role}`);
    }
    lines.push("");
  }
  lines.push("# Program");
  if (intent === "beep_hello") {
    lines.push(`hub.speaker.beep()`);
    lines.push(`wait_for_seconds(1)`);
  } else if (intent === "safe_probe") {
    for (const [port, p] of motorEntries) {
      const varName = toVarName(p.role);
      lines.push(`# Testing ${p.role} on Port ${port}`);
      lines.push(`${varName}.run_for_seconds(1, speed=SAFE_SPEED)`);
      lines.push(`wait_for_seconds(WAIT_SECS)`);
      lines.push(`${varName}.run_for_seconds(1, speed=-SAFE_SPEED)`);
      lines.push(`wait_for_seconds(WAIT_SECS)`);
    }
    lines.push(`hub.speaker.beep()`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel/.test(p.role));
    if (drives.length >= 2) {
      lines.push(`# Drive forward 1 second`);
      for (const [, p] of drives) lines.push(`${toVarName(p.role)}.start(speed=SAFE_SPEED)`);
      lines.push(`wait_for_seconds(1)`);
      for (const [, p] of drives) lines.push(`${toVarName(p.role)}.stop()`);
    } else if (drives.length === 1) {
      lines.push(`${toVarName(drives[0][1].role)}.run_for_seconds(1, speed=SAFE_SPEED)`);
    } else {
      lines.push(`# No drive motors found — add motor code for ${profile.name}`);
    }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|action|body/.test(p.role));
    if (arms.length > 0) {
      const [, p] = arms[0];
      const varName = toVarName(p.role);
      lines.push(`for i in range(3):`);
      lines.push(`    ${varName}.run_for_degrees(90, speed=SAFE_SPEED)`);
      lines.push(`    wait_for_seconds(0.2)`);
      lines.push(`    ${varName}.run_for_degrees(-90, speed=SAFE_SPEED)`);
      lines.push(`    wait_for_seconds(0.2)`);
    } else {
      lines.push(`hub.speaker.beep()  # No arm motor found for wave`);
    }
  } else if (intent === "custom" && customCode) {
    lines.push(String(customCode));
  } else {
    lines.push(`hub.speaker.beep()`);
  }
  return lines.join("\n") + "\n";
}

function generateCode(profile, target, intent, customCode) {
  if (target === "pybricks-python") return generatePybricksCode(profile, intent, customCode);
  return generateLegoStockCode(profile, intent, customCode);
}

// ─────────────────────────────────────────────────────────────────────────────

async function handleAction(action, params = {}) {
  if (!ACTIONS.includes(action)) {
    throw new Error(`unknown action: ${action}`);
  }

  if (action === "robot_scan") {
    return {
      ok: true,
      devices: listProfiles().map((profile) => ({
        id: profile.id,
        name: profile.name,
        family: profile.family,
        kit: profile.kit,
        robotKind: profile.robotKind,
        simulated: true,
        connection: profile.controller?.connection || []
      }))
    };
  }

  if (action === "robot_describe") {
    const profile = getProfile(params.profileId);
    return { ok: true, profile: describeProfile(profile) };
  }

  if (action === "probe_plan_create") {
    const profile = getProfile(params.profileId);
    return { ok: true, plan: createProbePlan(profile, params) };
  }

  if (action === "probe_run") {
    const profile = getProfile(params.profileId);
    const plan = params.plan || createProbePlan(profile, params);
    const session = runProbe({
      profile,
      plan,
      label: params.label || profile.robotKind || "unknown"
    });
    return { ok: true, session };
  }

  if (action === "robot_classify") {
    const session = params.session || (params.sessionPath ? readJsonFile(path.resolve(params.sessionPath)) : null);
    if (!session) throw new Error("session or sessionPath is required");
    return { ok: true, classification: classifySession(session) };
  }

  if (action === "dataset_export") {
    const session = params.session || (params.sessionPath ? readJsonFile(path.resolve(params.sessionPath)) : null);
    if (!session) throw new Error("session or sessionPath is required");
    const format = String(params.format || "jsonl");
    const content = exportDataset(session, format);
    const filePath = params.save ? saveExport(session, format, content) : null;
    return { ok: true, format, filePath, content };
  }

  if (action === "official_client_status") {
    return officialClientStatus();
  }

  if (action === "official_client_handoff") {
    return { ok: true, handoff: createOfficialClientHandoff(params) };
  }

  if (action === "builder_session_start") {
    const session = createBuilderSession(params);
    return {
      ok: true,
      session,
      filePath: builderSessionPath(session.id),
      summary: summarizeBuilderSession(session)
    };
  }

  if (action === "builder_session_append") {
    const session = readBuilderSession(params.sessionId);
    const step = appendBuilderSessionStep(session, params);
    const summary = summarizeBuilderSession(session);
    session.nextActions = summary.nextActions;
    writeBuilderSession(session);
    return {
      ok: true,
      session,
      step,
      summary,
      filePath: builderSessionPath(session.id)
    };
  }

  if (action === "builder_session_summary") {
    const session = readBuilderSession(params.sessionId);
    return {
      ok: true,
      session,
      summary: summarizeBuilderSession(session),
      filePath: builderSessionPath(session.id)
    };
  }

  if (action === "code_generate") {
    const profile = getProfile(params.profileId);
    const target = String(params.target || "lego-stock-python").trim();
    const intent = String(params.intent || "beep_hello").trim();
    const customCode = params.customCode || null;
    const validTargets = new Set(["pybricks-python", "lego-stock-python"]);
    if (!validTargets.has(target)) throw new Error(`unsupported target: ${target}`);
    const source = generateCode(profile, target, intent, customCode);
    const name = safeSlug(`${profile.id}-${intent}`, "program");
    return { ok: true, source, target, intent, profileId: profile.id, profileName: profile.name, name };
  }

  if (action === "lms_write") {
    const source = String(params.source || "");
    if (!source.trim()) throw new Error("source is required");
    const name = safeSlug(params.name || params.profileId || "program");
    const filePath = writeLmsFile(name, source);
    return { ok: true, filePath, name };
  }

  if (action === "lms_read") {
    const filePath = String(params.filePath || "").trim();
    if (!filePath) throw new Error("filePath is required");
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) throw new Error(`file not found: ${resolved}`);
    const entries = readLmsFile(resolved);
    const manifest = entries["manifest.json"] ? JSON.parse(entries["manifest.json"]) : null;
    const projectBody = entries["projectbody.json"] ? JSON.parse(entries["projectbody.json"]) : null;
    return {
      ok: true,
      filePath: resolved,
      type: manifest?.type || "unknown",
      name: manifest?.name || null,
      source: projectBody?.main || null,
      manifest,
      projectBody
    };
  }

  throw new Error(`unhandled action: ${action}`);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    ...corsHeaders(),
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error(`request body exceeds ${MAX_BODY_BYTES} bytes`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      resolve(raw ? JSON.parse(raw) : {});
    });
    req.on("error", reject);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

      if (req.method === "OPTIONS") {
        res.writeHead(204, corsHeaders());
        res.end();
        return;
      }

      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, {
          status: "ok",
          service: "lego-mindstorms-mcp",
          profiles: listProfiles().length
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/ready") {
        const state = readyState();
        sendJson(res, state.ok ? 200 : 503, state);
        return;
      }

      if (req.method === "GET" && url.pathname === "/actions") {
        sendJson(res, 200, { service: "lego-mindstorms-mcp", actions: ACTIONS });
        return;
      }

      if (req.method === "POST" && url.pathname === "/run") {
        const body = await readBody(req);
        const action = String(body.action || "").trim();
        if (!action) {
          sendJson(res, 400, { ok: false, error: "action is required" });
          return;
        }
        const payload = await handleAction(action, body.params || {});
        sendJson(res, 200, payload);
        return;
      }

      sendJson(res, 404, { ok: false, error: "not found" });
    } catch (err) {
      sendJson(res, 500, { ok: false, error: err.message || String(err) });
    }
  });
}

function main() {
  createServer().listen(PORT, HOST, () => {
    console.log(`lego-mindstorms-mcp listening on http://${HOST}:${PORT}`);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  ACTIONS,
  classifySession,
  createServer,
  exportDataset,
  generateCode,
  handleAction,
  writeLmsFile,
  readLmsFile
};
