const crypto = require("node:crypto");

const DEFAULT_SAMPLE_RATE_HZ = 50;
const DEFAULT_DURATION_MS = 3000;

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function describeProfile(profile) {
  return {
    ...profile,
    adapter: "m5stack-basex-simulated",
    capabilities: [
      "motor-duty-command",
      "encoder-position",
      "speed-estimate",
      "stall-flag",
      "imu-synthetic"
    ]
  };
}

function motorPorts(profile) {
  return Object.entries(profile.ports || {})
    .filter(([, value]) => value.kind === "motor")
    .map(([port]) => port);
}

function createProbePlan(profile, options = {}) {
  const ports = motorPorts(profile);
  const primary = ports[0] || "A";
  const secondary = ports[1] || primary;
  const duty = Number(options.duty || 20);
  const sampleRateHz = Number(options.sampleRateHz || DEFAULT_SAMPLE_RATE_HZ);

  const commands = [
    { tMs: 0, port: primary, mode: "duty", value: duty },
    { tMs: 500, port: primary, mode: "duty", value: 0 },
    { tMs: 700, port: secondary, mode: "duty", value: duty },
    { tMs: 1200, port: secondary, mode: "duty", value: 0 },
    { tMs: 1400, port: primary, mode: "duty", value: duty },
    { tMs: 1400, port: secondary, mode: "duty", value: duty },
    { tMs: 1900, port: primary, mode: "duty", value: 0 },
    { tMs: 1900, port: secondary, mode: "duty", value: 0 },
    { tMs: 2100, port: primary, mode: "duty", value: duty },
    { tMs: 2100, port: secondary, mode: "duty", value: -duty },
    { tMs: 2600, port: primary, mode: "duty", value: 0 },
    { tMs: 2600, port: secondary, mode: "duty", value: 0 }
  ];

  return {
    version: 1,
    family: profile.family || "m5stack-basex",
    profileId: profile.id,
    sampleRateHz,
    durationMs: Number(options.durationMs || DEFAULT_DURATION_MS),
    safety: {
      maxDuty: duty,
      emergencyStop: true,
      notes: "Low-power simulated probe. Real adapters should enforce battery, stall, and user abort checks."
    },
    commands
  };
}

function dutyAt(commands, port, tMs) {
  let value = 0;
  for (const command of commands) {
    if (command.port === port && command.tMs <= tMs) value = Number(command.value || 0);
  }
  return value;
}

function simulatePort({ profile, port, duty, previousSpeed, previousPosition, dtSec }) {
  const simulator = profile.simulator || {};
  const kind = profile.robotKind || "unknown";
  const baseScale = Number(simulator.speedScale || 4);
  const inertia = Number(simulator.inertia || 0.28);
  const stallAfterDegrees = Number(simulator.stallAfterDegrees || 0);
  const shouldStall = kind === "gripper" && stallAfterDegrees > 0 && Math.abs(previousPosition) > stallAfterDegrees;
  const targetSpeed = shouldStall ? 0 : duty * baseScale;
  const speed = previousSpeed + (targetSpeed - previousSpeed) * inertia;
  const position = previousPosition + speed * dtSec;

  return {
    position,
    speed,
    duty,
    stalled: shouldStall,
    port
  };
}

function syntheticImu(profile, states) {
  const kind = profile.robotKind || "unknown";
  const ports = Object.keys(states);
  const first = states[ports[0]] || { speed: 0 };
  const second = states[ports[1]] || { speed: 0 };

  if (kind === "two_wheel_drive" || kind === "tracked_vehicle") {
    const forward = (first.speed + second.speed) / 2;
    const turn = second.speed - first.speed;
    return {
      ax: round(forward * 0.002),
      ay: 0,
      az: 9.8,
      gx: 0,
      gy: 0,
      gz: round(turn * 0.01)
    };
  }

  if (kind === "gripper" || kind === "arm") {
    return {
      ax: 0,
      ay: round(first.speed * 0.001),
      az: 9.8,
      gx: 0,
      gy: round(first.speed * 0.008),
      gz: 0
    };
  }

  return { ax: 0, ay: 0, az: 9.8, gx: 0, gy: 0, gz: 0 };
}

function runProbe({ profile, plan, label }) {
  const sampleRateHz = Number(plan.sampleRateHz || DEFAULT_SAMPLE_RATE_HZ);
  const durationMs = Number(plan.durationMs || DEFAULT_DURATION_MS);
  const dtMs = Math.round(1000 / sampleRateHz);
  const dtSec = dtMs / 1000;
  const ports = motorPorts(profile);
  const states = {};
  const telemetry = [];

  for (const port of ports) {
    states[port] = { position: 0, speed: 0, duty: 0, stalled: false };
  }

  for (let tMs = 0; tMs <= durationMs; tMs += dtMs) {
    const rowPorts = {};
    for (const port of ports) {
      const duty = dutyAt(plan.commands || [], port, tMs);
      const next = simulatePort({
        profile,
        port,
        duty,
        previousSpeed: states[port].speed,
        previousPosition: states[port].position,
        dtSec
      });
      states[port] = next;
      rowPorts[port] = {
        position: round(next.position),
        speed: round(next.speed),
        duty: round(next.duty),
        stalled: next.stalled
      };
    }
    telemetry.push({
      tMs,
      ports: rowPorts,
      imu: syntheticImu(profile, states)
    });
  }

  return {
    sessionId: crypto.randomUUID(),
    profileId: profile.id,
    label,
    sampleRateHz,
    device: {
      id: profile.id,
      family: profile.family || "m5stack-basex",
      simulated: true
    },
    commands: plan.commands || [],
    telemetry,
    attachments: []
  };
}

module.exports = {
  createProbePlan,
  describeProfile,
  runProbe
};
