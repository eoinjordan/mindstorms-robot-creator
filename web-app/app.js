/* Mindstorms Robot Studio — web-app/app.js
   Standalone browser app. Works offline for code generation and .lms download.
   Connects to local action server at 127.0.0.1:3095 for builder sessions.
   Connects to Robot Inventor hub via Web Serial (Chrome/Edge, HTTPS/localhost only).
*/

// ─── Embedded profiles ────────────────────────────────────────────────────────

const PROFILES = [
  {
    id: "51515-blast", name: "Blast", family: "robot-inventor",
    kit: "LEGO MINDSTORMS Robot Inventor 51515",
    robotKind: "humanoid_drive_launcher",
    ports: {
      A: { kind: "motor", part: "angular-motor", role: "right_drive" },
      B: { kind: "motor", part: "angular-motor", role: "action_launcher" },
      C: { kind: "motor", part: "angular-motor", role: "left_drive", positiveDirection: "counterclockwise" },
      D: { kind: "motor", part: "angular-motor", role: "arm_lift" },
      E: { kind: "sensor", part: "color-sensor", role: "color_detection" },
      F: { kind: "sensor", part: "distance-sensor", role: "obstacle_detection" }
    }
  },
  {
    id: "51515-charlie", name: "Charlie", family: "robot-inventor",
    kit: "LEGO MINDSTORMS Robot Inventor 51515",
    robotKind: "humanoid_drive_companion",
    needsConfirmation: true,
    ports: {
      A: { kind: "motor", part: "angular-motor", role: "right_drive_or_body_motion" },
      B: { kind: "motor", part: "angular-motor", role: "left_drive_or_body_motion" },
      E: { kind: "motor", part: "angular-motor", role: "left_arm_or_head_motion" },
      F: { kind: "motor", part: "angular-motor", role: "right_arm_or_head_motion" }
    }
  },
  {
    id: "51515-gelo", name: "Gelo", family: "robot-inventor",
    kit: "LEGO MINDSTORMS Robot Inventor 51515",
    robotKind: "quadruped_walker",
    ports: {
      A: { kind: "motor", part: "angular-motor", role: "rear_right_leg", positiveDirection: "counterclockwise" },
      B: { kind: "motor", part: "angular-motor", role: "rear_left_leg" },
      C: { kind: "motor", part: "angular-motor", role: "front_right_leg", positiveDirection: "counterclockwise" },
      D: { kind: "motor", part: "angular-motor", role: "front_left_leg" },
      E: { kind: "sensor", part: "distance-sensor", role: "obstacle_detection" },
      F: { kind: "sensor", part: "color-sensor", role: "trick_selection" }
    }
  },
  {
    id: "51515-mvp", name: "M.V.P.", family: "robot-inventor",
    kit: "LEGO MINDSTORMS Robot Inventor 51515",
    robotKind: "modular_vehicle_platform",
    ports: {
      A: { kind: "motor", part: "angular-motor", role: "steering" },
      B: { kind: "motor", part: "angular-motor", role: "drive", positiveDirection: "counterclockwise" }
    }
  },
  {
    id: "51515-tricky", name: "Tricky", family: "robot-inventor",
    kit: "LEGO MINDSTORMS Robot Inventor 51515",
    robotKind: "sports_drive_kicker",
    ports: {
      A: { kind: "motor", part: "angular-motor", role: "drive_right" },
      B: { kind: "motor", part: "angular-motor", role: "drive_left", positiveDirection: "counterclockwise" },
      C: { kind: "motor", part: "angular-motor", role: "kicker_or_attachment" },
      D: { kind: "sensor", part: "distance-sensor", role: "trigger_detection" },
      E: { kind: "sensor", part: "color-sensor", role: "ball_or_line_detection" }
    }
  },
  // ── EV3 31313 robots ───────────────────────────────────────────────────────
  {
    id: "ev3-ev3rstorm", name: "EV3RSTORM", family: "ev3",
    kit: "LEGO MINDSTORMS EV3 31313",
    robotKind: "tracked_drive_shooter",
    crossGenNotes: "Tank drive (B+C tracks) is equivalent to the tracked_vehicle morphology.",
    ports: {
      A: { kind: "motor", part: "medium-motor", role: "blaster_arm" },
      B: { kind: "motor", part: "large-motor", role: "left_track_drive" },
      C: { kind: "motor", part: "large-motor", role: "right_track_drive", positiveDirection: "counterclockwise" },
      "1": { kind: "sensor", part: "infrared-sensor", role: "obstacle_detection" },
      "4": { kind: "sensor", part: "color-sensor", role: "color_detection" }
    }
  },
  {
    id: "ev3-gripp3r", name: "GRIPP3R", family: "ev3",
    kit: "LEGO MINDSTORMS EV3 31313",
    robotKind: "gripper_drive",
    crossGenNotes: "Gripper morphology — equivalent to NXT Tribot claw and 51515 custom gripper builds.",
    ports: {
      A: { kind: "motor", part: "medium-motor", role: "gripper_claw" },
      B: { kind: "motor", part: "large-motor", role: "left_drive" },
      C: { kind: "motor", part: "large-motor", role: "right_drive", positiveDirection: "counterclockwise" },
      "1": { kind: "sensor", part: "ultrasonic-sensor", role: "obstacle_detection" },
      "4": { kind: "sensor", part: "gyro-sensor", role: "orientation" }
    }
  },
  // ── NXT robots ─────────────────────────────────────────────────────────────
  {
    id: "nxt-alpha-rex", name: "Alpha Rex", family: "nxt",
    kit: "LEGO MINDSTORMS NXT 2.0 8547",
    robotKind: "humanoid_biped_walker",
    crossGenNotes: "Bipedal humanoid walker — thematically related to Robot Inventor Charlie (51515-charlie).",
    ports: {
      A: { kind: "motor", part: "nxt-servo-motor", role: "right_leg" },
      B: { kind: "motor", part: "nxt-servo-motor", role: "left_leg" },
      C: { kind: "motor", part: "nxt-servo-motor", role: "arm_gesture" },
      "1": { kind: "sensor", part: "ultrasonic-sensor", role: "obstacle_detection" },
      "3": { kind: "sensor", part: "touch-sensor", role: "bump_detect" }
    }
  },
  {
    id: "nxt-tribot", name: "Tribot", family: "nxt",
    kit: "LEGO MINDSTORMS NXT 1.0 8527",
    robotKind: "two_wheel_drive_claw",
    crossGenNotes: "Two-wheel drive with claw — closely equivalent to EV3 GRIPP3R (ev3-gripp3r).",
    ports: {
      A: { kind: "motor", part: "nxt-servo-motor", role: "claw" },
      B: { kind: "motor", part: "nxt-servo-motor", role: "left_drive" },
      C: { kind: "motor", part: "nxt-servo-motor", role: "right_drive", positiveDirection: "counterclockwise" },
      "1": { kind: "sensor", part: "ultrasonic-sensor", role: "obstacle_detection" },
      "2": { kind: "sensor", part: "touch-sensor", role: "bump_detect" },
      "3": { kind: "sensor", part: "light-sensor", role: "line_following" }
    }
  },
  // ── RCX robots ─────────────────────────────────────────────────────────────
  {
    id: "rcx-pushbot", name: "Pushbot", family: "rcx",
    kit: "LEGO MINDSTORMS RCX 3804 / 9747",
    robotKind: "two_wheel_drive_pusher",
    crossGenNotes: "The original 1998 MINDSTORMS brick. Two-wheel drive equivalent to NXT Tribot and EV3 GRIPP3R.",
    ports: {
      A: { kind: "motor", part: "rcx-motor", role: "right_drive" },
      B: { kind: "motor", part: "rcx-motor", role: "arm_or_attachment" },
      C: { kind: "motor", part: "rcx-motor", role: "left_drive" },
      "1": { kind: "sensor", part: "touch-sensor", role: "bump_detect" },
      "2": { kind: "sensor", part: "light-sensor", role: "light_or_line" }
    }
  }
];

// ─── Generation metadata ──────────────────────────────────────────────────────

const GEN_META = {
  "robot-inventor": { label: "51515", color: "#006A6A", textColor: "#fff", ext: "lms",  extLabel: "Download .lms" },
  "spike-prime":    { label: "SPIKE", color: "#2980b9", textColor: "#fff", ext: "lms",  extLabel: "Download .lms" },
  "ev3":            { label: "EV3",   color: "#c0392b", textColor: "#fff", ext: "py",   extLabel: "Download .py"  },
  "nxt":            { label: "NXT",   color: "#d97706", textColor: "#fff", ext: "py",   extLabel: "Download .py"  },
  "rcx":            { label: "RCX",   color: "#6b7280", textColor: "#fff", ext: "nqc",  extLabel: "Download .nqc" }
};

// Valid code targets per MINDSTORMS generation
const FAMILY_TARGETS = {
  "robot-inventor": [
    { value: "lego-stock-python", label: "LEGO MINDSTORMS App (Python)" },
    { value: "pybricks-python",   label: "Pybricks (Python)" }
  ],
  "spike-prime": [
    { value: "lego-stock-python", label: "LEGO SPIKE App (Python)" },
    { value: "pybricks-python",   label: "Pybricks (Python)" }
  ],
  "ev3": [
    { value: "pybricks-ev3",   label: "Pybricks EV3 (Python)" },
    { value: "ev3dev-python",  label: "ev3dev MicroPython" }
  ],
  "nxt": [
    { value: "nxt-python", label: "nxt-python (USB / Bluetooth)" }
  ],
  "rcx": [
    { value: "rcx-nqc", label: "NQC — Not Quite C" }
  ]
};

// ─── Code generation (browser-side mirror of server.js logic) ─────────────────

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
  }
  const L = [
    `# ${profile.name} — ${profile.kit || "Robot Inventor 51515"}`,
    `# Target: pybricks-python`,
    `# Generated by Mindstorms Robot Studio`,
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
  if (motorEntries.length) {
    L.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries) {
      const dir = p.positiveDirection === "counterclockwise"
        ? `, positive_direction=Direction.COUNTERCLOCKWISE` : "";
      L.push(`${toVarName(p.role)} = Motor(Port.${port}${dir})  # ${p.role}`);
    }
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings from profile");
    for (const [port, p] of sensorEntries) {
      if (p.part === "color-sensor")    L.push(`${toVarName(p.role)} = ColorSensor(Port.${port})  # ${p.role}`);
      if (p.part === "distance-sensor") L.push(`${toVarName(p.role)} = UltrasonicSensor(Port.${port})  # ${p.role}`);
    }
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`hub.speaker.beep(frequency=500, duration=300)`, `hub.light.on(Color.GREEN)`, `wait(1000)`, `hub.light.off()`);
  } else if (intent === "safe_probe") {
    L.push(`hub.light.on(Color.YELLOW)`);
    for (const [port, p] of motorEntries) {
      L.push(`print("Testing ${p.role} (Port ${port})")`,
        `${toVarName(p.role)}.run_angle(SAFE_SPEED, SAFE_ANGLE)`, `wait(WAIT_MS)`,
        `${toVarName(p.role)}.run_angle(SAFE_SPEED, -SAFE_ANGLE)`, `wait(WAIT_MS)`);
    }
    L.push(`hub.light.on(Color.GREEN)`, `hub.speaker.beep(frequency=800, duration=200)`, `print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel/.test(p.role));
    if (drives.length >= 2) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.run(SAFE_SPEED)`));
      L.push(`wait(1000)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.stop()`));
    } else if (drives.length === 1) {
      L.push(`${toVarName(drives[0][1].role)}.run_angle(SAFE_SPEED, SAFE_ANGLE)`);
    } else {
      L.push(`# No drive motors found — add motor code for ${profile.name}`);
    }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|action|body/.test(p.role));
    if (arms.length) {
      const v = toVarName(arms[0][1].role);
      L.push(`for _ in range(3):`, `    ${v}.run_angle(SAFE_SPEED, 90)`, `    wait(200)`,
        `    ${v}.run_angle(SAFE_SPEED, -90)`, `    wait(200)`);
    } else {
      L.push(`hub.speaker.beep()  # No arm motor found for wave`);
    }
  } else if (intent === "custom" && customCode) {
    L.push(String(customCode));
  } else {
    L.push(`hub.speaker.beep()`, `wait(500)`);
  }
  return L.join("\n") + "\n";
}

function generateLegoStockCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const L = [
    `# ${profile.name} — ${profile.kit || "Robot Inventor 51515"}`,
    `# Target: lego-stock-python (MINDSTORMS Robot Inventor app)`,
    `# Generated by Mindstorms Robot Studio`,
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
  if (motorEntries.length) {
    L.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries) L.push(`${toVarName(p.role)} = Motor('${port}')  # ${p.role}`);
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings from profile");
    for (const [port, p] of sensorEntries) {
      if (p.part === "color-sensor")    L.push(`${toVarName(p.role)} = ColorSensor('${port}')  # ${p.role}`);
      if (p.part === "distance-sensor") L.push(`${toVarName(p.role)} = DistanceSensor('${port}')  # ${p.role}`);
    }
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`hub.speaker.beep()`, `wait_for_seconds(1)`);
  } else if (intent === "safe_probe") {
    for (const [port, p] of motorEntries) {
      L.push(`# Testing ${p.role} on Port ${port}`,
        `${toVarName(p.role)}.run_for_seconds(1, speed=SAFE_SPEED)`, `wait_for_seconds(WAIT_SECS)`,
        `${toVarName(p.role)}.run_for_seconds(1, speed=-SAFE_SPEED)`, `wait_for_seconds(WAIT_SECS)`);
    }
    L.push(`hub.speaker.beep()`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel/.test(p.role));
    if (drives.length >= 2) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.start(speed=SAFE_SPEED)`));
      L.push(`wait_for_seconds(1)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.stop()`));
    } else if (drives.length === 1) {
      L.push(`${toVarName(drives[0][1].role)}.run_for_seconds(1, speed=SAFE_SPEED)`);
    } else {
      L.push(`# No drive motors found — add motor code for ${profile.name}`);
    }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|action|body/.test(p.role));
    if (arms.length) {
      const v = toVarName(arms[0][1].role);
      L.push(`for i in range(3):`,
        `    ${v}.run_for_degrees(90, speed=SAFE_SPEED)`, `    wait_for_seconds(0.2)`,
        `    ${v}.run_for_degrees(-90, speed=SAFE_SPEED)`, `    wait_for_seconds(0.2)`);
    } else {
      L.push(`hub.speaker.beep()  # No arm motor found for wave`);
    }
  } else if (intent === "custom" && customCode) {
    L.push(String(customCode));
  } else {
    L.push(`hub.speaker.beep()`);
  }
  return L.join("\n") + "\n";
}

function generateCode(profile, target, intent, customCode) {
  if (target === "pybricks-python") return generatePybricksCode(profile, intent, customCode);
  if (target === "pybricks-ev3")    return generatePybricksEv3Code(profile, intent, customCode);
  if (target === "ev3dev-python")   return generateEv3devCode(profile, intent, customCode);
  if (target === "nxt-python")      return generateNxtPythonCode(profile, intent, customCode);
  if (target === "rcx-nqc")         return generateRcxNqcCode(profile, intent, customCode);
  return generateLegoStockCode(profile, intent, customCode);
}

// ─── EV3 Pybricks code generation ─────────────────────────────────────────────

function generatePybricksEv3Code(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const sensorImports = new Set();
  for (const [, p] of sensorEntries) {
    if (p.part === "color-sensor")         sensorImports.add("ColorSensor");
    else if (p.part === "ultrasonic-sensor") sensorImports.add("UltrasonicSensor");
    else if (p.part === "touch-sensor")    sensorImports.add("TouchSensor");
    else if (p.part === "infrared-sensor") sensorImports.add("InfraredSensor");
    else if (p.part === "gyro-sensor")     sensorImports.add("GyroSensor");
  }
  const sensorLine = sensorImports.size ? `, ${[...sensorImports].join(", ")}` : "";
  const L = [
    `# ${profile.name} — ${profile.kit || "LEGO MINDSTORMS EV3 31313"}`,
    `# Target: pybricks-ev3  |  Flash firmware: https://code.pybricks.com`,
    `# Generated by Mindstorms Robot Creator`,
    ``,
    `from pybricks.hubs import EV3Brick`,
    `from pybricks.ev3devices import Motor${sensorLine}`,
    `from pybricks.parameters import Port, Direction, Color, Stop, Button`,
    `from pybricks.tools import wait, StopWatch`,
    ``,
    `SAFE_SPEED = 200   # deg/s`,
    `SAFE_ANGLE = 360`,
    `WAIT_MS    = 500`,
    ``,
    `ev3 = EV3Brick()`,
    ``
  ];
  if (motorEntries.length) {
    L.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries) {
      const dir = p.positiveDirection === "counterclockwise"
        ? `, positive_direction=Direction.COUNTERCLOCKWISE` : "";
      L.push(`${toVarName(p.role)} = Motor(Port.${port}${dir})  # ${p.role}`);
    }
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings from profile  (EV3 sensor ports: S1–S4)");
    for (const [port, p] of sensorEntries) {
      const v = toVarName(p.role); const sp = `Port.S${port}`;
      if (p.part === "color-sensor")         L.push(`${v} = ColorSensor(${sp})  # ${p.role}`);
      else if (p.part === "ultrasonic-sensor") L.push(`${v} = UltrasonicSensor(${sp})  # ${p.role}`);
      else if (p.part === "touch-sensor")    L.push(`${v} = TouchSensor(${sp})  # ${p.role}`);
      else if (p.part === "infrared-sensor") L.push(`${v} = InfraredSensor(${sp})  # ${p.role}`);
      else if (p.part === "gyro-sensor")     L.push(`${v} = GyroSensor(${sp})  # ${p.role}`);
    }
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`ev3.speaker.beep(frequency=500, duration=500)`, `ev3.light.on(Color.GREEN)`, `wait(1000)`, `ev3.light.off()`);
  } else if (intent === "safe_probe") {
    L.push(`ev3.light.on(Color.YELLOW)`);
    for (const [port, p] of motorEntries) {
      L.push(`print("Testing ${p.role} (Port ${port})")`,
        `${toVarName(p.role)}.run_angle(SAFE_SPEED, SAFE_ANGLE)`, `wait(WAIT_MS)`,
        `${toVarName(p.role)}.run_angle(SAFE_SPEED, -SAFE_ANGLE)`, `wait(WAIT_MS)`);
    }
    L.push(`ev3.light.on(Color.GREEN)`, `ev3.speaker.beep(frequency=800, duration=200)`, `print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|track|wheel/.test(p.role));
    if (drives.length >= 2) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.run(SAFE_SPEED)`));
      L.push(`wait(1000)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.stop()`));
    } else if (drives.length === 1) {
      L.push(`${toVarName(drives[0][1].role)}.run_angle(SAFE_SPEED, SAFE_ANGLE)`);
    } else { L.push(`# No drive motors found`); }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|blaster|claw|grip|gesture/.test(p.role));
    if (arms.length) {
      const v = toVarName(arms[0][1].role);
      L.push(`for _ in range(3):`, `    ${v}.run_angle(SAFE_SPEED, 90)`, `    wait(200)`,
        `    ${v}.run_angle(SAFE_SPEED, -90)`, `    wait(200)`);
    } else { L.push(`ev3.speaker.beep()  # No arm motor`); }
  } else if (intent === "custom" && customCode) { L.push(String(customCode));
  } else { L.push(`ev3.speaker.beep()`, `wait(500)`); }
  return L.join("\n") + "\n";
}

// ─── EV3 ev3dev2 MicroPython code generation ──────────────────────────────────

function generateEv3devCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const motorOutputs = motorEntries.map(([port]) => `OUTPUT_${port}`);
  const sensorInputs = sensorEntries.map(([port]) => `INPUT_${port}`);
  const sensorImports = new Set();
  for (const [, p] of sensorEntries) {
    if (p.part === "color-sensor")         sensorImports.add("ColorSensor");
    else if (p.part === "ultrasonic-sensor") sensorImports.add("UltrasonicSensor");
    else if (p.part === "touch-sensor")    sensorImports.add("TouchSensor");
    else if (p.part === "infrared-sensor") sensorImports.add("InfraredSensor");
    else if (p.part === "gyro-sensor")     sensorImports.add("GyroSensor");
  }
  const L = [
    `#!/usr/bin/env python3`,
    `# ${profile.name} — ${profile.kit || "LEGO MINDSTORMS EV3 31313"}`,
    `# Target: ev3dev MicroPython  |  https://ev3dev.org`,
    `# Generated by Mindstorms Robot Creator`,
    ``,
    `from ev3dev2.motor import LargeMotor, MediumMotor, SpeedPercent${motorOutputs.length ? `, ${motorOutputs.join(", ")}` : ""}`,
    `from ev3dev2.sensor import ${sensorInputs.length ? sensorInputs.join(", ") : "INPUT_1"}`,
    `from ev3dev2.sensor.lego import ${[...sensorImports].join(", ") || "TouchSensor"}`,
    `from ev3dev2.led import Leds`,
    `from ev3dev2.sound import Sound`,
    `from time import sleep`,
    ``,
    `sound = Sound()`,
    `leds  = Leds()`,
    `SAFE_SPEED = SpeedPercent(30)`,
    `WAIT_SECS  = 0.5`,
    ``
  ];
  if (motorEntries.length) {
    L.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries) {
      const cls = p.part === "medium-motor" ? "MediumMotor" : "LargeMotor";
      L.push(`${toVarName(p.role)} = ${cls}(OUTPUT_${port})  # ${p.role}`);
    }
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings from profile");
    for (const [port, p] of sensorEntries) {
      const v = toVarName(p.role);
      if (p.part === "color-sensor")         L.push(`${v} = ColorSensor(INPUT_${port})  # ${p.role}`);
      else if (p.part === "ultrasonic-sensor") L.push(`${v} = UltrasonicSensor(INPUT_${port})  # ${p.role}`);
      else if (p.part === "touch-sensor")    L.push(`${v} = TouchSensor(INPUT_${port})  # ${p.role}`);
      else if (p.part === "infrared-sensor") L.push(`${v} = InfraredSensor(INPUT_${port})  # ${p.role}`);
    }
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`sound.beep()`, `leds.set_color("LEFT", "GREEN")`, `leds.set_color("RIGHT", "GREEN")`, `sleep(1)`);
  } else if (intent === "safe_probe") {
    for (const [port, p] of motorEntries) {
      L.push(`print("Testing ${p.role} (OUTPUT_${port})")`,
        `${toVarName(p.role)}.on_for_seconds(SAFE_SPEED, 1)`, `sleep(WAIT_SECS)`,
        `${toVarName(p.role)}.on_for_seconds(-SAFE_SPEED, 1)`, `sleep(WAIT_SECS)`);
    }
    L.push(`sound.beep()`, `print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|track|wheel/.test(p.role));
    if (drives.length >= 2) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.on(SAFE_SPEED)`));
      L.push(`sleep(1)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.off()`));
    } else if (drives.length === 1) {
      L.push(`${toVarName(drives[0][1].role)}.on_for_seconds(SAFE_SPEED, 1)`);
    } else { L.push(`# No drive motors found`); }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|blaster|claw|grip|gesture/.test(p.role));
    if (arms.length) {
      const v = toVarName(arms[0][1].role);
      L.push(`for _ in range(3):`, `    ${v}.on_for_degrees(SAFE_SPEED, 90)`, `    sleep(0.2)`,
        `    ${v}.on_for_degrees(-SAFE_SPEED, 90)`, `    sleep(0.2)`);
    } else { L.push(`sound.beep()  # No arm motor`); }
  } else if (intent === "custom" && customCode) { L.push(String(customCode));
  } else { L.push(`sound.beep()`); }
  return L.join("\n") + "\n";
}

// ─── NXT Python code generation ───────────────────────────────────────────────

function generateNxtPythonCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const sensorImports = new Set();
  for (const [, p] of sensorEntries) {
    if (p.part === "ultrasonic-sensor") sensorImports.add("Ultrasonic");
    else if (p.part === "touch-sensor") sensorImports.add("Touch");
    else if (p.part === "light-sensor") sensorImports.add("Light");
    else if (p.part === "color-sensor") sensorImports.add("Color20");
  }
  const L = [
    `# ${profile.name} — ${profile.kit || "LEGO MINDSTORMS NXT"}`,
    `# Target: nxt-python  |  Install: pip install nxt-python`,
    `# Generated by Mindstorms Robot Creator`,
    `# Connect NXT brick via USB or pair via Bluetooth before running.`,
    ``,
    `import nxt.locator`,
    `from nxt.motor import Motor, Port as MotorPort`,
    `from nxt.sensor import PORT_1, PORT_2, PORT_3, PORT_4`,
    ...(sensorImports.size ? [`from nxt.sensor import ${[...sensorImports].join(", ")}`] : []),
    `import time`,
    ``,
    `brick = nxt.locator.find()`,
    ``,
    `SAFE_POWER = 60   # 0-127`,
    `WAIT_SECS  = 0.5`,
    ``
  ];
  if (motorEntries.length) {
    L.push("# Motor bindings from profile");
    for (const [port, p] of motorEntries)
      L.push(`${toVarName(p.role)} = Motor(brick, MotorPort.${port})  # ${p.role}`);
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings from profile");
    for (const [port, p] of sensorEntries) {
      const v = toVarName(p.role); const c = `PORT_${port}`;
      if (p.part === "ultrasonic-sensor") L.push(`${v} = Ultrasonic(brick, ${c})  # ${p.role}`);
      else if (p.part === "touch-sensor") L.push(`${v} = Touch(brick, ${c})  # ${p.role}`);
      else if (p.part === "light-sensor") L.push(`${v} = Light(brick, ${c})  # ${p.role}`);
      else if (p.part === "color-sensor") L.push(`${v} = Color20(brick, ${c})  # ${p.role}`);
    }
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`brick.play_tone_and_wait(440, 500)  # Beep hello`);
  } else if (intent === "safe_probe") {
    for (const [port, p] of motorEntries) {
      L.push(`print("Testing ${p.role} (Port ${port})")`,
        `${toVarName(p.role)}.run(SAFE_POWER)`, `time.sleep(1)`,
        `${toVarName(p.role)}.run(-SAFE_POWER)`, `time.sleep(1)`,
        `${toVarName(p.role)}.idle()`, `time.sleep(WAIT_SECS)`);
    }
    L.push(`brick.play_tone_and_wait(700, 300)`, `print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel|track/.test(p.role));
    if (drives.length >= 2) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.run(SAFE_POWER)`));
      L.push(`time.sleep(1)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.idle()`));
    } else if (drives.length === 1) {
      L.push(`${toVarName(drives[0][1].role)}.run(SAFE_POWER)`, `time.sleep(1)`,
        `${toVarName(drives[0][1].role)}.idle()`);
    } else { L.push(`# No drive motors found`); }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|leg|lift|wave|claw|grip|gesture/.test(p.role));
    if (arms.length) {
      const v = toVarName(arms[0][1].role);
      L.push(`for _ in range(3):`, `    ${v}.run(SAFE_POWER)`, `    time.sleep(0.3)`,
        `    ${v}.run(-SAFE_POWER)`, `    time.sleep(0.3)`, `    ${v}.idle()`, `    time.sleep(0.2)`);
    } else { L.push(`brick.play_tone_and_wait(440, 200)  # No arm motor`); }
  } else if (intent === "custom" && customCode) { L.push(String(customCode));
  } else { L.push(`brick.play_tone_and_wait(440, 300)`); }
  return L.join("\n") + "\n";
}

// ─── RCX NQC (Not Quite C) code generation ────────────────────────────────────

function generateRcxNqcCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const L = [
    `// ${profile.name} — ${profile.kit || "LEGO MINDSTORMS RCX"}`,
    `// Target: NQC (Not Quite C)  |  https://bricxcc.sourceforge.net/nqc/`,
    `// Generated by Mindstorms Robot Creator`,
    `// Compile:  nqcc program.nqc`,
    `// Download: nqc -download program.rcx   (requires IR tower)`,
    ``
  ];
  if (motorEntries.length) {
    L.push("// Motor port definitions");
    for (const [port, p] of motorEntries)
      L.push(`#define ${toVarName(p.role).toUpperCase().padEnd(20)} OUT_${port}  // ${p.role}`);
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("// Sensor port definitions");
    for (const [port, p] of sensorEntries)
      L.push(`#define ${toVarName(p.role).toUpperCase().padEnd(20)} SENSOR_${port}  // ${p.role}`);
    L.push("");
  }
  L.push("#define SAFE_POWER  60  // 0-100");
  L.push("");
  L.push("task main()");
  L.push("{");
  if (sensorEntries.length) {
    L.push("    // Sensor type setup");
    for (const [port, p] of sensorEntries) {
      if (p.part === "touch-sensor")  L.push(`    SetSensor(SENSOR_${port}, SENSOR_TOUCH);`);
      else if (p.part === "light-sensor") L.push(`    SetSensor(SENSOR_${port}, SENSOR_LIGHT);`);
    }
    L.push("");
  }
  if (intent === "beep_hello") {
    L.push(`    PlayTone(440, 3);  // Beep hello`, `    Wait(30);`);
  } else if (intent === "safe_probe") {
    for (const [port, p] of motorEntries) {
      L.push(`    // Testing ${p.role} (OUT_${port})`,
        `    SetOutput(OUT_${port}, OUT_ON);`, `    SetPower(OUT_${port}, SAFE_POWER);`, `    Wait(10);`,
        `    SetOutput(OUT_${port}, OUT_OFF);`, `    Wait(5);`,
        `    SetDirection(OUT_${port}, OUT_REV);`, `    SetOutput(OUT_${port}, OUT_ON);`, `    Wait(10);`,
        `    SetOutput(OUT_${port}, OUT_OFF);`, `    SetDirection(OUT_${port}, OUT_FWD);`, `    Wait(5);`);
    }
    L.push(`    PlayTone(700, 3);`, `    Wait(30);`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel|track/.test(p.role));
    if (drives.length >= 2) {
      const mask = drives.map(([port]) => `OUT_${port}`).join(" | ");
      L.push(`    SetOutput(${mask}, OUT_ON);`, `    SetPower(${mask}, SAFE_POWER);`,
        `    Wait(20);  // ~2 seconds`, `    SetOutput(${mask}, OUT_OFF);`);
    } else if (drives.length === 1) {
      const [port] = drives[0];
      L.push(`    SetOutput(OUT_${port}, OUT_ON);`, `    SetPower(OUT_${port}, SAFE_POWER);`,
        `    Wait(20);`, `    SetOutput(OUT_${port}, OUT_OFF);`);
    } else { L.push(`    // No drive motors found`); }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /arm|lift|wave|claw|grip/.test(p.role));
    if (arms.length) {
      const [port] = arms[0];
      L.push(`    int i;`, `    for (i = 0; i < 3; i++)`, `    {`,
        `        SetOutput(OUT_${port}, OUT_ON);`, `        SetPower(OUT_${port}, SAFE_POWER);`, `        Wait(3);`,
        `        SetOutput(OUT_${port}, OUT_OFF);`, `        SetDirection(OUT_${port}, OUT_REV);`,
        `        SetOutput(OUT_${port}, OUT_ON);`, `        Wait(3);`,
        `        SetOutput(OUT_${port}, OUT_OFF);`, `        SetDirection(OUT_${port}, OUT_FWD);`, `        Wait(2);`,
        `    }`);
    } else { L.push(`    PlayTone(440, 3);  // No arm motor`, `    Wait(30);`); }
  } else if (intent === "custom" && customCode) {
    L.push(String(customCode).split("\n").map(l => `    ${l}`).join("\n"));
  } else { L.push(`    PlayTone(440, 3);`, `    Wait(30);`); }
  L.push("}");
  return L.join("\n") + "\n";
}

// ─── LMS file builder (browser, uses JSZip) ───────────────────────────────────

const HUB_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="12" fill="#006A6A"/>
<rect x="10" y="18" width="44" height="28" rx="7" fill="#004D4D"/>
<circle cx="32" cy="32" r="9" fill="#00BFBF"/>
<circle cx="32" cy="32" r="5" fill="#006A6A"/>
<rect x="14" y="48" width="10" height="4" rx="2" fill="#003535"/>
<rect x="40" y="48" width="10" height="4" rx="2" fill="#003535"/>
</svg>`;

async function buildLmsBlob(name, pythonSource) {
  const id = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(16).padStart(2, "0")).join("");
  const now = new Date().toISOString();
  const manifest = {
    type: "python", created: now, id, lastsaved: now, size: 0, name,
    version: 11, slotIndex: 0, state: { playMode: "download" },
    zoomLevel: 1, workspaceX: 120, workspaceY: 120,
    extensions: [], showAllBlocks: true
  };
  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(manifest));
  zip.file("projectbody.json", JSON.stringify({ main: pythonSource }));
  zip.file("icon.svg", HUB_ICON_SVG);
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}

async function downloadLms(name, pythonSource) {
  const blob = await buildLmsBlob(name, pythonSource);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.lms`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ─── LMS file reader (browser, uses JSZip) ────────────────────────────────────

async function readLmsBlob(file) {
  const zip = await JSZip.loadAsync(file);
  const manifest = zip.file("manifest.json")
    ? JSON.parse(await zip.file("manifest.json").async("string")) : null;
  const projectBody = zip.file("projectbody.json")
    ? JSON.parse(await zip.file("projectbody.json").async("string")) : null;
  return { manifest, projectBody, name: manifest?.name, type: manifest?.type,
    source: projectBody?.main || null };
}

// ─── Web Bluetooth hub connection ─────────────────────────────────────────────
// Uses the Pybricks BLE UART service (Nordic UART Service) when Pybricks
// firmware is flashed. Also does a best-effort beep on stock LEGO firmware
// using the LEGO Wireless Protocol 3.0 hub properties service.
//
// Service UUIDs:
//   Pybricks service       : 'c5f50001-8280-46da-89f4-6d8051e4aeef'
//   Pybricks UART TX char  : 'c5f50002-8280-46da-89f4-6d8051e4aeef' (notify)
//   Pybricks UART RX char  : 'c5f50003-8280-46da-89f4-6d8051e4aeef' (write)
//   LEGO LWP3 service      : '00001623-1212-efde-1623-785feabcd123'
//   LEGO LWP3 char         : '00001624-1212-efde-1623-785feabcd123'

const PYBRICKS_SERVICE     = "c5f50001-8280-46da-89f4-6d8051e4aeef";
const PYBRICKS_TX          = "c5f50002-8280-46da-89f4-6d8051e4aeef"; // hub → browser
const PYBRICKS_RX          = "c5f50003-8280-46da-89f4-6d8051e4aeef"; // browser → hub
const LWP3_SERVICE         = "00001623-1212-efde-1623-785feabcd123";
const LWP3_CHAR            = "00001624-1212-efde-1623-785feabcd123";

const hubBle = {
  device: null,
  server: null,
  rxChar: null,     // write-to-hub
  txChar: null,     // notifications from hub
  mode: null,       // "pybricks" | "lwp3" | null
  _onData: null,

  get connected() { return this.server !== null && this.server.connected; },

  async connect() {
    // Try Pybricks first, then fall back to LWP3 (stock firmware)
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: "Pybricks" },
        { namePrefix: "LEGO" },
        { namePrefix: "Technic" },
        { services: [PYBRICKS_SERVICE] },
        { services: [LWP3_SERVICE] }
      ],
      optionalServices: [PYBRICKS_SERVICE, LWP3_SERVICE]
    });

    this.device = device;
    device.addEventListener("gattserverdisconnected", () => this._onDisconnect());

    this.server = await device.gatt.connect();

    // Try Pybricks first
    try {
      const svc  = await this.server.getPrimaryService(PYBRICKS_SERVICE);
      this.txChar = await svc.getCharacteristic(PYBRICKS_TX);
      this.rxChar = await svc.getCharacteristic(PYBRICKS_RX);
      await this.txChar.startNotifications();
      this.txChar.addEventListener("characteristicvaluechanged", (e) => {
        const text = new TextDecoder().decode(e.target.value);
        if (this._onData) this._onData(text);
      });
      this.mode = "pybricks";
      return;
    } catch (_) { /* no Pybricks service — try LWP3 */ }

    // Fall back to LEGO LWP3 (stock firmware)
    try {
      const svc   = await this.server.getPrimaryService(LWP3_SERVICE);
      this.rxChar = await svc.getCharacteristic(LWP3_CHAR);
      this.txChar = this.rxChar; // same char for notify + write on LWP3
      await this.rxChar.startNotifications();
      this.rxChar.addEventListener("characteristicvaluechanged", (e) => {
        const bytes = new Uint8Array(e.target.value.buffer);
        if (this._onData) this._onData(`[LWP3] ${Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join(' ')}\n`);
      });
      this.mode = "lwp3";
      return;
    } catch (_) { /* neither service found */ }

    throw new Error("Hub connected but no known service found. Only Pybricks and LEGO LWP3 are supported.");
  },

  async write(text) {
    if (!this.rxChar) throw new Error("Not connected");
    const data = new TextEncoder().encode(text);
    // BLE write-with-response, chunked to 20 bytes (BLE ATT default)
    for (let i = 0; i < data.length; i += 20) {
      await this.rxChar.writeValueWithResponse(data.slice(i, i + 20));
    }
  },

  async beep() {
    if (this.mode === "pybricks") {
      // Send a one-liner to Pybricks REPL via BLE UART
      await this.write("hub.speaker.beep(frequency=500, duration=200)\r\n");
    } else if (this.mode === "lwp3") {
      // LWP3 hub alert — plays sound: msgLen=6, hub=0x00, type=0x01, port=0x00
      // Hub Alert: [0x06, 0x00, 0x01, 0x01+sound=0x01, enable=0x01]
      const msg = new Uint8Array([0x06, 0x00, 0x03, 0x01, 0x01, 0x00]);
      await this.rxChar.writeValueWithResponse(msg);
    }
  },

  async sendRepl(line) {
    if (this.mode !== "pybricks") {
      throw new Error("REPL requires Pybricks firmware. Hub is running stock LEGO firmware (LWP3).");
    }
    await this.write(line + "\r\n");
  },

  async disconnect() {
    try { if (this.txChar) await this.txChar.stopNotifications(); } catch (_) {}
    try { if (this.server && this.server.connected) this.server.disconnect(); } catch (_) {}
    this.device = null; this.server = null; this.rxChar = null; this.txChar = null; this.mode = null;
  },

  _onDisconnect() {
    this.server = null; this.rxChar = null; this.txChar = null; this.mode = null;
    updateHubPill();
    appendTerminal("BLE hub disconnected.\n");
  }
};

// ─── Web Serial hub connection ────────────────────────────────────────────────

const hubSerial = {
  port: null,
  reader: null,
  writer: null,
  readBuffer: "",

  get connected() { return this.port !== null; },

  async connect(filterLegoOnly = true) {
    // LEGO Group USB Vendor ID: 0x0694
    // Try filtering to LEGO devices first so the picker is less overwhelming.
    // Falls back to showing all ports if filtered picker is dismissed without selection.
    const legoFilters = [{ usbVendorId: 0x0694 }];
    if (filterLegoOnly) {
      this.port = await navigator.serial.requestPort({ filters: legoFilters });
    } else {
      this.port = await navigator.serial.requestPort({ filters: [] });
    }
    await this.port.open({ baudRate: 115200 });
    this.writer = this.port.writable.getWriter();
    this._startReader();
  },

  _startReader() {
    const self = this;
    const textDecoder = new TextDecoderStream();
    this.port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    self.reader = reader;
    (async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          self.readBuffer += value;
          if (self._onData) self._onData(value);
        }
      } catch (_) { /* disconnected */ }
    })();
  },

  async write(text) {
    const encoded = new TextEncoder().encode(text);
    await this.writer.write(encoded);
  },

  async waitFor(marker, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const idx = this.readBuffer.indexOf(marker);
        if (idx >= 0) { resolve(this.readBuffer.slice(0, idx + marker.length)); return; }
        if (Date.now() - start > timeoutMs) { reject(new Error(`timeout waiting for ${JSON.stringify(marker)}`)); return; }
        setTimeout(check, 50);
      };
      check();
    });
  },

  async runCode(pythonSource) {
    this.readBuffer = "";
    // Interrupt any running program
    await this.write("\x03\x03");
    await new Promise(r => setTimeout(r, 300));
    // Enter raw REPL
    await this.write("\x01");
    await this.waitFor(">");
    this.readBuffer = "";
    // Send code and execute
    await this.write(pythonSource + "\x04");
    const out = await this.waitFor("\x04");
    // Exit raw REPL
    await this.write("\x02");
    return out.replace(/^OK/, "").replace(/\x04/g, "").trim();
  },

  async sendRepl(line) {
    this.readBuffer = "";
    await this.write(line + "\r\n");
    await new Promise(r => setTimeout(r, 500));
    return this.readBuffer;
  },

  async disconnect() {
    try { if (this.reader) await this.reader.cancel(); } catch (_) {}
    try { if (this.writer) await this.writer.close(); } catch (_) {}
    try { if (this.port) await this.port.close(); } catch (_) {}
    this.port = null; this.reader = null; this.writer = null;
  }
};

// ─── App state ────────────────────────────────────────────────────────────────

const state = {
  profiles: [...PROFILES],
  selectedId: PROFILES[0].id,
  serverUrl: "http://127.0.0.1:3095",
  serverOk: false,
  sessionId: null,
  genFilter: "all"
};

function selectedProfile() {
  return state.profiles.find(p => p.id === state.selectedId) || null;
}

// ─── Server API ───────────────────────────────────────────────────────────────

async function api(action, params = {}) {
  const res = await fetch(`${state.serverUrl}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, params })
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

async function checkServer() {
  try {
    const res = await fetch(`${state.serverUrl}/health`);
    const json = await res.json();
    state.serverOk = true;
    el("serverPill").textContent = `\u25CF ${json.service || "server"} \u2014 ${json.profiles || 0} profiles`;
    el("serverPill").className = "pill pill-on";
    return true;
  } catch (_) {
    state.serverOk = false;
    el("serverPill").textContent = "\u25CF server offline";
    el("serverPill").className = "pill pill-off";
    return false;
  }
}

// ─── Generation filter ────────────────────────────────────────────────────────

function renderGenFilter() {
  const wrap = el("genFilter");
  if (!wrap) return;
  // Collect unique families present in profiles
  const families = ["all", ...new Set(state.profiles.map(p => p.family).filter(Boolean))];
  wrap.innerHTML = "";
  for (const fam of families) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gen-chip" + (state.genFilter === fam ? " active" : "");
    btn.dataset.gen = fam;
    if (fam === "all") {
      btn.textContent = "All";
    } else {
      const meta = GEN_META[fam];
      btn.textContent = meta ? meta.label : fam.toUpperCase();
      if (meta) {
        btn.style.setProperty("--gen-color", meta.color);
        btn.style.setProperty("--gen-text", meta.textColor);
      }
    }
    btn.addEventListener("click", () => {
      state.genFilter = fam;
      renderGenFilter();
      renderFleet();
    });
    wrap.appendChild(btn);
  }
}

// ─── Fleet ────────────────────────────────────────────────────────────────────

function renderFleet() {
  const list = el("fleetList");
  list.innerHTML = "";
  const visible = state.genFilter === "all"
    ? state.profiles
    : state.profiles.filter(p => p.family === state.genFilter);
  for (const p of visible) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fleet-robot" + (p.id === state.selectedId ? " selected" : "");
    const motorCount  = Object.values(p.ports || {}).filter(x => x.kind === "motor").length;
    const sensorCount = Object.values(p.ports || {}).filter(x => x.kind === "sensor").length;
    const meta = GEN_META[p.family] || {};
    const genBadge = meta.label
      ? `<span class="fleet-gen-badge" style="background:${meta.color};color:${meta.textColor}">${meta.label}</span>`
      : "";
    const crossNote = p.crossGenNotes
      ? `<span class="fleet-cross-note" title="${p.crossGenNotes}">↔ cross-gen</span>` : "";
    btn.innerHTML = `<div class="fleet-robot-header"><strong>${p.name}</strong>${genBadge}</div>
      <span class="fleet-kind">${(p.robotKind || "").replace(/_/g, " ")}</span>
      <span class="fleet-meta">${motorCount}M ${sensorCount}S${p.needsConfirmation ? " ⚠" : ""}${crossNote}</span>`;
    btn.addEventListener("click", () => selectProfile(p.id));
    list.appendChild(btn);
  }
  // If selected profile is hidden by filter, show a note
  if (visible.length === 0) {
    const note = document.createElement("p");
    note.className = "fleet-empty-note";
    note.textContent = "No robots in this generation.";
    list.appendChild(note);
  }
}

function selectProfile(id) {
  state.selectedId = id;
  const p = selectedProfile();
  renderFleet();
  el("codeRobotName").textContent = p ? p.name : "none";
  updateTargetSelector(p ? p.family : "robot-inventor");
  // Show cross-gen note if available
  const noteEl = el("crossGenNote");
  if (noteEl) {
    noteEl.textContent = p && p.crossGenNotes ? `↔ ${p.crossGenNotes}` : "";
    noteEl.style.display = p && p.crossGenNotes ? "block" : "none";
  }
}

function updateTargetSelector(family) {
  const sel = el("targetSel");
  if (!sel) return;
  const targets = FAMILY_TARGETS[family] || FAMILY_TARGETS["robot-inventor"];
  sel.innerHTML = targets.map(t => `<option value="${t.value}">${t.label}</option>`).join("");

  // Update download button label
  const meta = GEN_META[family] || GEN_META["robot-inventor"];
  const dlBtn = el("downloadLmsBtn");
  if (dlBtn) dlBtn.textContent = `↓ ${meta.extLabel}`;

  // Disable Save-to-server (.lms) for non-51515 families
  const saveBtn = el("saveLmsBtn");
  if (saveBtn) {
    const isLms = meta.ext === "lms";
    saveBtn.disabled = !isLms;
    saveBtn.title = isLms ? "" : "Save to server only supported for Robot Inventor / SPIKE (51515)";
  }

  // Show/hide connect-tab note about non-BLE generations
  const connNote = el("nonBleGenNote");
  if (connNote) {
    const isBle = (family === "robot-inventor" || family === "spike-prime");
    connNote.style.display = isBle ? "none" : "block";
    connNote.textContent = isBle ? "" :
      `Note: ${(meta.label || family.toUpperCase())} hubs use USB or legacy Bluetooth (not Web Bluetooth). ` +
      `Generate and Download code here, then deploy with the appropriate desktop tool.`;
  }
}

// ─── Code tab ─────────────────────────────────────────────────────────────────

let editor;

function initEditor() {
  editor = CodeMirror.fromTextArea(el("editorArea"), {
    mode: "python",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: false,
    lineWrapping: false,
    autofocus: false
  });
  editor.setSize("100%", "100%");
}

function setCodeStatus(msg, isError = false) {
  const bar = el("codeStatus");
  bar.textContent = msg;
  bar.className = "status-bar" + (isError ? " error" : " ok");
}

function doGenerate() {
  const profile = selectedProfile();
  if (!profile) { setCodeStatus("Select a robot first", true); return; }
  const target = el("targetSel").value;
  const intent = el("intentSel").value;
  const customCode = intent === "custom" ? editor.getValue() : null;
  const src = generateCode(profile, target, intent, customCode);
  editor.setValue(src);
  setCodeStatus(`Generated ${intent} for ${profile.name} (${target})`);
}

async function doGenerateFromServer() {
  if (!state.serverOk) { doGenerate(); return; }
  const profile = selectedProfile();
  if (!profile) { setCodeStatus("Select a robot first", true); return; }
  try {
    const res = await api("code_generate", {
      profileId: profile.id,
      target: el("targetSel").value,
      intent: el("intentSel").value,
      customCode: el("intentSel").value === "custom" ? editor.getValue() : null
    });
    editor.setValue(res.source);
    setCodeStatus(`Generated ${res.intent} for ${res.profileName} (${res.target}) via server`);
  } catch (err) {
    setCodeStatus(`Server error: ${err.message} — using local generator`, true);
    doGenerate();
  }
}

async function doDownloadLms() {
  const profile = selectedProfile();
  const src = editor.getValue().trim();
  if (!src) { setCodeStatus("Generate or write code first", true); return; }
  const family  = profile ? profile.family : "robot-inventor";
  const meta    = GEN_META[family] || GEN_META["robot-inventor"];
  const baseName = profile
    ? `${profile.id}-${el("intentSel").value}`.replace(/[^a-z0-9_-]/g, "-")
    : "program";

  if (meta.ext === "lms") {
    await downloadLms(baseName, src);
    setCodeStatus(`Downloaded ${baseName}.lms — open it in the LEGO MINDSTORMS app`);
  } else {
    // Plain text download (.py or .nqc)
    const filename = `${baseName}.${meta.ext}`;
    const blob = new Blob([src], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setCodeStatus(`Downloaded ${filename}`);
  }
}

async function doSaveToServer() {
  if (!state.serverOk) { setCodeStatus("Server not available", true); return; }
  const profile = selectedProfile();
  const src = editor.getValue().trim();
  if (!src) { setCodeStatus("No code to save", true); return; }
  try {
    const res = await api("lms_write", {
      source: src,
      name: profile ? `${profile.id}-${el("intentSel").value}` : "program",
      profileId: profile?.id
    });
    setCodeStatus(`Saved: ${res.filePath}`);
  } catch (err) {
    setCodeStatus(`Save failed: ${err.message}`, true);
  }
}

async function doRunViaUsb() {
  if (!hubSerial.connected) { appendTerminal("Hub not connected\n"); return; }
  const src = editor.getValue().trim();
  if (!src) { appendTerminal("No code to run\n"); return; }
  try {
    setCodeStatus("Running on hub...");
    const out = await hubSerial.runCode(src);
    appendTerminal(out || "(no output)");
    appendTerminal("\n--- done ---\n");
    setCodeStatus("Run complete");
  } catch (err) {
    appendTerminal(`Error: ${err.message}\n`);
    setCodeStatus(`Run error: ${err.message}`, true);
  }
}

// ─── Builder tab ──────────────────────────────────────────────────────────────

function logBuilder(payload) {
  const pane = el("builderLog");
  pane.textContent = JSON.stringify(payload, null, 2);
}

function renderBuilderResult(payload) {
  const grid = el("builderResult");
  if (!payload?.summary) { grid.innerHTML = ""; return; }
  const s = payload.summary;
  grid.innerHTML = [
    renderBlock("Likely issues", s.likelyIssues || [], "warning"),
    renderBlock("Next actions", s.nextActions || [], ""),
    renderBlock("Questions to ask", s.questions || [], ""),
    s.safetyReminder ? `<div class="result-block danger"><strong>Safety</strong><p>${s.safetyReminder}</p></div>` : ""
  ].join("");
}

function renderBlock(title, rows, kind) {
  return `<div class="result-block ${kind}">
    <strong>${title}</strong>
    ${rows.length ? `<ul>${rows.map(r => `<li>${r}</li>`).join("")}</ul>` : "<span>none</span>"}
  </div>`;
}

async function doStartBuilder() {
  if (!state.serverOk) { alert("Builder sessions require the local server.\nRun: node cli.js server"); return; }
  const profile = selectedProfile();
  if (!profile) { alert("Select a robot first"); return; }
  try {
    const res = await api("builder_session_start", {
      profileId: profile.id,
      goal: el("goalInput").value,
      audience: el("audienceInput").value,
      sessionId: el("sessionIdInput").value || undefined
    });
    state.sessionId = res.session.id;
    el("sessionIdInput").value = res.session.id;
    renderBuilderResult(res);
    logBuilder(res);
  } catch (err) { alert(`Start failed: ${err.message}`); }
}

async function doObserve() {
  if (!state.sessionId) { alert("Start a session first"); return; }
  const text = el("observationInput").value.trim();
  if (!text) { alert("Enter an observation"); return; }
  try {
    const res = await api("builder_session_append", {
      sessionId: state.sessionId, type: "observation", text
    });
    el("observationInput").value = "";
    renderBuilderResult(res);
    logBuilder(res);
  } catch (err) { alert(`Error: ${err.message}`); }
}

async function doHandoff() {
  const profile = selectedProfile();
  try {
    const res = await api("official_client_handoff", {
      profileId: profile?.id,
      goal: el("goalInput").value
    });
    logBuilder(res);
    renderBuilderResult({ summary: {
      likelyIssues: [],
      nextActions: res.handoff.steps,
      questions: res.handoff.safety
    }});
  } catch (err) { alert(`Error: ${err.message}`); }
}

async function doSummarize() {
  if (!state.sessionId) { alert("Start a session first"); return; }
  try {
    const res = await api("builder_session_summary", { sessionId: state.sessionId });
    renderBuilderResult(res);
    logBuilder(res);
  } catch (err) { alert(`Error: ${err.message}`); }
}

// ─── Connect tab ──────────────────────────────────────────────────────────────

function updateHubPill() {
  const pill = el("hubPill");
  if (hubSerial.connected) {
    pill.textContent = "\u25CF hub connected";
    pill.className = "pill pill-on";
    el("runUsbBtn").disabled = false;
    el("sendReplBtn").disabled = false;
    el("disconnectBtn").disabled = false;
    el("connectBtn").disabled = true;
  } else {
    pill.textContent = "\u25CF hub disconnected";
    pill.className = "pill pill-off";
    el("runUsbBtn").disabled = true;
    el("sendReplBtn").disabled = true;
    el("disconnectBtn").disabled = true;
    el("connectBtn").disabled = false;
  }
}

function appendTerminal(text) {
  const out = el("terminalOutput");
  out.textContent += text;
  out.scrollTop = out.scrollHeight;
}

async function doConnect(filterLegoOnly = true) {
  if (!navigator.serial) {
    const msg = "Web Serial not supported — use Chrome or Edge on desktop.";
    appendTerminal(msg + "\n");
    showConnectError(msg);
    return;
  }
  el("connectError").classList.add("hidden");
  try {
    await hubSerial.connect(filterLegoOnly);
    hubSerial._onData = str => appendTerminal(str);
    appendTerminal("Connected. Sending Ctrl+C to stop running program...\n");
    await hubSerial.write("\x03\x03");
    el("hubInfo").textContent = "Hub connected via USB serial";
    updateHubPill();
  } catch (err) {
    const isNoneSelected = err.name === "NotFoundError" || err.message.includes("No port selected");
    if (isNoneSelected && filterLegoOnly) {
      showConnectError(
        "No LEGO hub found in filtered list. Try \u201CShow all ports\u201D \u2014 look for " +
        "\u201CUSB Serial Device (COMx)\u201D. If nothing appears, install the LEGO MINDSTORMS " +
        "app first (it registers the Windows COM driver)."
      );
    } else if (isNoneSelected) {
      showConnectError("No port selected. Plug in the hub USB cable and try again.");
    } else {
      showConnectError(err.message);
    }
    appendTerminal(`Connect failed: ${err.message}\n`);
  }
}

function showConnectError(msg) {
  const div = el("connectError");
  div.textContent = msg;
  div.classList.remove("hidden");
}

async function doConnectAllPorts() {
  await doConnect(false);
}

async function doDisconnect() {
  await hubSerial.disconnect();
  el("hubInfo").textContent = "";
  updateHubPill();
  appendTerminal("Disconnected.\n");
}

async function doSendRepl() {
  const line = el("terminalInput").value;
  if (!line.trim()) return;
  appendTerminal(`> ${line}\n`);
  try {
    const out = await hubSerial.sendRepl(line);
    appendTerminal(out);
  } catch (err) {
    appendTerminal(`Error: ${err.message}\n`);
  }
}

// ─── Load server profiles ─────────────────────────────────────────────────────

async function doLoadServerProfiles() {
  if (!state.serverOk) { alert("Server not available"); return; }
  try {
    const res = await api("robot_scan", {});
    const existing = new Set(state.profiles.map(p => p.id));
    let added = 0;
    for (const d of res.devices || []) {
      if (!existing.has(d.id)) {
        // Fetch full profile
        try {
          const desc = await api("robot_describe", { profileId: d.id });
          if (desc.profile) { state.profiles.push(desc.profile); existing.add(d.id); added++; }
        } catch (_) {}
      }
    }
    renderFleet();
    alert(`Loaded ${added} additional profiles from server.`);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// ─── LMS file reader UI ───────────────────────────────────────────────────────

async function doReadLmsFile(file) {
  try {
    const result = await readLmsBlob(file);
    const out = el("lmsReadOutput");
    if (result.type === "python") {
      out.textContent = `Type: python\nName: ${result.name}\n\n--- Source ---\n${result.source || "(empty)"}`;
    } else {
      out.textContent = `Type: ${result.type}\nName: ${result.name}\n(Block programs require the LEGO app to view)`;
    }
  } catch (err) {
    el("lmsReadOutput").textContent = `Error reading file: ${err.message}`;
  }
}

// ─── Tab switching ────────────────────────────────────────────────────────────

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.toggle("hidden", p.id !== `tab-${name}`);
  });
  if (name === "code") editor && editor.refresh();
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initEditor();
  renderGenFilter();
  renderFleet();
  selectProfile(state.profiles[0].id);

  // Tab buttons
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Server
  el("refreshBtn").addEventListener("click", () => {
    state.serverUrl = el("serverUrl").value.trim().replace(/\/$/, "");
    checkServer();
  });
  checkServer();

  // Code tab
  el("generateBtn").addEventListener("click", doGenerateFromServer);
  el("downloadLmsBtn").addEventListener("click", doDownloadLms);
  el("runUsbBtn").addEventListener("click", doRunViaUsb);
  el("saveLmsBtn").addEventListener("click", doSaveToServer);
  el("targetSel").addEventListener("change", () => el("intentSel").disabled = false);

  // Builder tab
  el("startBuilderBtn").addEventListener("click", doStartBuilder);
  el("observeBtn").addEventListener("click", doObserve);
  el("handoffBtn").addEventListener("click", doHandoff);
  el("summaryBtn").addEventListener("click", doSummarize);

  // Connect tab
  el("connectBtn").addEventListener("click", doConnect);
  el("disconnectBtn").addEventListener("click", doDisconnect);
  el("sendReplBtn").addEventListener("click", doSendRepl);
  el("clearTermBtn").addEventListener("click", () => { el("terminalOutput").textContent = ""; });
  el("lmsFileInput").addEventListener("change", e => {
    if (e.target.files[0]) doReadLmsFile(e.target.files[0]);
  });

  // Fleet sidebar
  el("loadServerBtn").addEventListener("click", doLoadServerProfiles);

  updateHubPill();
});
