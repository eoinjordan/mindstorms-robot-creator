/* Mindstorms Robot Creator - web-app/app.js
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
  },
  // ── WeDo 2.0 robots ────────────────────────────────────────────────────────
  {
    id: "wedo2-milo", name: "Milo", family: "wedo2",
    kit: "LEGO Education WeDo 2.0 45300",
    robotKind: "science_rover",
    crossGenNotes: "Science rover with motion sensor. Two-port LPF2 Smart Hub 2 I/O (BLE). Connects as 'LPF2 Smart Hub 2 I/O'.",
    ports: {
      A: { kind: "motor",  part: "wedo2-medium-motor",  role: "drive_and_tilt" },
      B: { kind: "sensor", part: "wedo2-motion-sensor", role: "obstacle_detection" }
    }
  },
  {
    id: "wedo2-kraz", name: "Kraz", family: "wedo2",
    kit: "LEGO Education WeDo 2.0 45300",
    robotKind: "animal_action",
    crossGenNotes: "Animal robot with motion trigger. Port A motor for body action, Port B motion sensor.",
    ports: {
      A: { kind: "motor",  part: "wedo2-medium-motor",  role: "body_action" },
      B: { kind: "sensor", part: "wedo2-motion-sensor", role: "motion_trigger" }
    }
  },
  {
    id: "wedo2-custom", name: "WeDo 2.0 Custom", family: "wedo2",
    kit: "LEGO Education WeDo 2.0 45300",
    robotKind: "custom_build",
    needsConfirmation: true,
    ports: {
      A: { kind: "motor",  part: "wedo2-medium-motor",  role: "motor_a" },
      B: { kind: "motor",  part: "wedo2-medium-motor",  role: "motor_b" }
    }
  }
];

// ─── Generation metadata ──────────────────────────────────────────────────────

const GEN_META = {
  "robot-inventor": { label: "51515", color: "#006A6A", textColor: "#fff", ext: "lms",  extLabel: "Download .lms" },
  "spike-prime":    { label: "SPIKE", color: "#2980b9", textColor: "#fff", ext: "lms",  extLabel: "Download .lms" },
  "ev3":            { label: "EV3",   color: "#c0392b", textColor: "#fff", ext: "py",   extLabel: "Download .py"  },
  "nxt":            { label: "NXT",   color: "#d97706", textColor: "#fff", ext: "py",   extLabel: "Download .py"  },
  "rcx":            { label: "RCX",   color: "#6b7280", textColor: "#fff", ext: "nqc",  extLabel: "Download .nqc" },
  "wedo2":          { label: "WeDo 2", color: "#e47b00", textColor: "#fff", ext: "py",  extLabel: "Download .py"  }
};

// Valid code targets per MINDSTORMS generation
const FAMILY_TARGETS = {
  "robot-inventor": [
    { value: "lego-stock-python", label: "LEGO MINDSTORMS App (Python)" },
    { value: "pybricks-python",   label: "Pybricks (Python)" },
    { value: "blockly-python",    label: "Blockly (Visual)" }
  ],
  "spike-prime": [
    { value: "lego-stock-python", label: "LEGO SPIKE App (Python)" },
    { value: "pybricks-python",   label: "Pybricks (Python)" },
    { value: "blockly-python",    label: "Blockly (Visual)" }
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
  ],
  "wedo2": [
    { value: "wedo2-micropython",  label: "WeDo 2.0 App (MicroPython)" },
    { value: "pybricks-city",      label: "Pybricks CityHub (Python)" },
    { value: "blockly-python",     label: "Blockly (Visual)" }
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
    `# Generated by Mindstorms Robot Creator`,
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
    `# Generated by Mindstorms Robot Creator`,
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

// ─── WeDo 2.0 MicroPython code generation (hub module / LPF2 firmware) ────────

function generateWeDo2Code(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const L = [
    `# ${profile.name} — ${profile.kit || "LEGO Education WeDo 2.0 45300"}`,
    `# Target: WeDo 2.0 MicroPython (hub module)`,
    `# Hub: LPF2 Smart Hub 2 I/O  |  App: LEGO Education WeDo 2.0`,
    `# Generated by Mindstorms Robot Creator`,
    `# NOTE: WeDo 2.0 App is available until July 31 2026.`,
    `#       For continued use, migrate to Pybricks CityHub target.`,
    ``,
    `import hub`,
    `import time`,
    ``,
    `# Safety constants`,
    `SAFE_SPEED = 50   # percent (-100 to 100)`,
    `WAIT_SECS  = 0.5`,
    ``
  ];
  if (motorEntries.length) {
    L.push("# Motor bindings — Port A = connector 1, Port B = connector 2");
    for (const [port, p] of motorEntries)
      L.push(`${toVarName(p.role)} = hub.port.${port}.motor  # ${p.role}`);
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings");
    for (const [port, p] of sensorEntries)
      L.push(`${toVarName(p.role)} = hub.port.${port}.device  # ${p.role}`);
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`hub.sound.beep()`, `hub.led(6)  # green`, `time.sleep(1)`, `hub.led(0)  # off`);
  } else if (intent === "safe_probe") {
    L.push(`hub.led(7)  # yellow`);
    for (const [port, p] of motorEntries) {
      const v = toVarName(p.role);
      L.push(`print("Testing ${p.role} (Port ${port})")`,
        `${v}.run_for_seconds(speed=SAFE_SPEED, seconds=1)`,
        `time.sleep(WAIT_SECS)`,
        `${v}.run_for_seconds(speed=-SAFE_SPEED, seconds=1)`,
        `time.sleep(WAIT_SECS)`);
    }
    L.push(`hub.led(6)  # green`, `hub.sound.beep()`, `print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel|tilt/.test(p.role));
    if (drives.length) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.start(speed=SAFE_SPEED)`));
      L.push(`time.sleep(1)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.stop()`));
    } else if (motorEntries.length) {
      L.push(`${toVarName(motorEntries[0][1].role)}.run_for_seconds(speed=SAFE_SPEED, seconds=1)`);
    } else {
      L.push(`# No motor found — connect WeDo 2.0 Medium Motor to Port A`);
    }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /action|body|arm|lift|wave/.test(p.role));
    const m = (arms.length ? arms : motorEntries)[0];
    if (m) {
      const v = toVarName(m[1].role);
      L.push(`for _ in range(3):`,
        `    ${v}.run_for_seconds(speed=SAFE_SPEED, seconds=0.3)`,
        `    time.sleep(0.1)`,
        `    ${v}.run_for_seconds(speed=-SAFE_SPEED, seconds=0.3)`,
        `    time.sleep(0.1)`);
    } else { L.push(`hub.sound.beep()  # No motor found`); }
  } else if (intent === "custom" && customCode) {
    L.push(String(customCode));
  } else {
    L.push(`hub.sound.beep()`);
  }
  return L.join("\n") + "\n";
}

// ─── WeDo 2.0 Pybricks CityHub code generation ────────────────────────────────

function generatePybricksCityCode(profile, intent, customCode) {
  const ports = profile.ports || {};
  const motorEntries = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensorEntries = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const pupParts = new Set(["Motor"]);
  for (const [, p] of sensorEntries) {
    if (p.part === "wedo2-motion-sensor") pupParts.add("UltrasonicSensor");
    if (p.part === "wedo2-tilt-sensor")   pupParts.add("AccelerometerSensor");
    if (p.part === "color-sensor")        pupParts.add("ColorSensor");
  }
  const L = [
    `# ${profile.name} — ${profile.kit || "LEGO Education WeDo 2.0 45300"}`,
    `# Target: Pybricks CityHub  |  Flash firmware: https://code.pybricks.com`,
    `# Hub: LPF2 Smart Hub 2 I/O  |  Generated by Mindstorms Robot Creator`,
    ``,
    `from pybricks.hubs import CityHub`,
    `from pybricks.pupdevices import ${[...pupParts].join(", ")}`,
    `from pybricks.parameters import Port, Direction, Color, Stop`,
    `from pybricks.tools import wait, StopWatch`,
    ``,
    `SAFE_SPEED = 200   # deg/s`,
    `SAFE_ANGLE = 360`,
    `WAIT_MS    = 500`,
    ``,
    `hub = CityHub()`,
    ``
  ];
  if (motorEntries.length) {
    L.push("# Motor bindings — Port A = connector 1, Port B = connector 2");
    for (const [port, p] of motorEntries) {
      const dir = p.positiveDirection === "counterclockwise"
        ? `, positive_direction=Direction.COUNTERCLOCKWISE` : "";
      L.push(`${toVarName(p.role)} = Motor(Port.${port}${dir})  # ${p.role}`);
    }
    L.push("");
  }
  if (sensorEntries.length) {
    L.push("# Sensor bindings");
    for (const [port, p] of sensorEntries) {
      const v = toVarName(p.role);
      if (p.part === "wedo2-motion-sensor") L.push(`${v} = UltrasonicSensor(Port.${port})  # ${p.role}`);
      else if (p.part === "color-sensor")   L.push(`${v} = ColorSensor(Port.${port})  # ${p.role}`);
    }
    L.push("");
  }
  L.push("# Program");
  if (intent === "beep_hello") {
    L.push(`hub.light.on(Color.GREEN)`, `wait(1000)`, `hub.light.off()`);
  } else if (intent === "safe_probe") {
    L.push(`hub.light.on(Color.YELLOW)`);
    for (const [port, p] of motorEntries) {
      const v = toVarName(p.role);
      L.push(`print("Testing ${p.role} (Port ${port})")`,
        `${v}.run_angle(SAFE_SPEED, SAFE_ANGLE)`, `wait(WAIT_MS)`,
        `${v}.run_angle(SAFE_SPEED, -SAFE_ANGLE)`, `wait(WAIT_MS)`);
    }
    L.push(`hub.light.on(Color.GREEN)`, `print("Probe complete")`);
  } else if (intent === "drive_forward") {
    const drives = motorEntries.filter(([, p]) => /drive|wheel|tilt/.test(p.role));
    if (drives.length >= 2) {
      L.push(`# Drive forward 1 second`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.run(SAFE_SPEED)`));
      L.push(`wait(1000)`);
      drives.forEach(([, p]) => L.push(`${toVarName(p.role)}.stop()`));
    } else if (motorEntries.length) {
      L.push(`${toVarName(motorEntries[0][1].role)}.run_angle(SAFE_SPEED, SAFE_ANGLE)`);
    } else {
      L.push(`# No motor found — connect WeDo 2.0 Medium Motor to Port A`);
    }
  } else if (intent === "wave") {
    const arms = motorEntries.filter(([, p]) => /action|body|arm|lift|wave/.test(p.role));
    const m = (arms.length ? arms : motorEntries)[0];
    if (m) {
      const v = toVarName(m[1].role);
      L.push(`for _ in range(3):`,
        `    ${v}.run_angle(SAFE_SPEED, 90)`, `    wait(200)`,
        `    ${v}.run_angle(SAFE_SPEED, -90)`, `    wait(200)`);
    } else { L.push(`hub.light.on(Color.GREEN)  # No motor found`); }
  } else if (intent === "custom" && customCode) {
    L.push(String(customCode));
  } else {
    L.push(`hub.light.on(Color.GREEN)`, `wait(500)`, `hub.light.off()`);
  }
  return L.join("\n") + "\n";
}

function generateCode(profile, target, intent, customCode) {
  if (target === "pybricks-python") return generatePybricksCode(profile, intent, customCode);
  if (target === "pybricks-ev3")    return generatePybricksEv3Code(profile, intent, customCode);
  if (target === "pybricks-city")   return generatePybricksCityCode(profile, intent, customCode);
  if (target === "ev3dev-python")   return generateEv3devCode(profile, intent, customCode);
  if (target === "nxt-python")      return generateNxtPythonCode(profile, intent, customCode);
  if (target === "rcx-nqc")         return generateRcxNqcCode(profile, intent, customCode);
  if (target === "wedo2-micropython") return generateWeDo2Code(profile, intent, customCode);
  return generateLegoStockCode(profile, intent, customCode);
}

// ─── Blockly Integration ──────────────────────────────────────────────────────

let blocklyWorkspace = null;

// ─── Python autocomplete ──────────────────────────────────────────────────────
const MINDSTORMS_WORDS = [
  // Robot Inventor / SPIKE classes + members
  "MSHub","Motor","MotorPair","ColorSensor","DistanceSensor","ForceSensor","UltrasonicSensor","App",
  // Pybricks classes
  "InventorHub","EV3Brick","CityHub","TechnicHub","PrimeHub",
  // Motor methods
  "run_for_seconds","run_for_degrees","run_angle","run_time","run_until_stalled",
  "run_target","run","start","stop","brake","hold","dc","reset_angle","angle","speed","load",
  // Pair
  "move","move_tank","move_steering",
  // Hub
  "speaker","status_light","battery","imu","buttons","display",
  "beep","play_notes","on","off","blink",
  // Sensor methods
  "color","ambient","reflection","rgb","distance","presence","force","touched",
  // Tools
  "wait_for_seconds","wait_until","wait","StopWatch","multitask",
  // Parameters / enums
  "Port","Direction","Color","Stop","Button","Axis","Side",
  "COUNTERCLOCKWISE","CLOCKWISE","BLACK","WHITE","RED","GREEN","BLUE","YELLOW","ORANGE","VIOLET",
  // mindstorms module
  "from mindstorms import","from mindstorms.control import","from mindstorms.operator import",
  "from pybricks.hubs import","from pybricks.pupdevices import",
  "from pybricks.parameters import","from pybricks.tools import",
  // NQC keywords
  "task","sub","SetMotor","SetSensor","PlaySound","ClearTimer","GetTimer","Until",
  "SENSOR_1","SENSOR_2","SENSOR_3","OUT_A","OUT_B","OUT_C",
  "OUT_FWD","OUT_REV","OUT_FLOAT","OUT_OFF",
  // Python builtins
  "import","from","def","class","return","for","while","if","elif","else",
  "in","range","print","True","False","None","and","or","not","is","try","except","pass",
  // WeDo 2.0 hub module API
  "hub.port.A.motor","hub.port.B.motor","hub.port.A.device","hub.port.B.device",
  "hub.sound.beep","hub.led","hub.motion.tilt_angles","hub.motion.gyro",
  "run_for_seconds","run_for_degrees","start","stop",
  // Pybricks CityHub
  "CityHub","from pybricks.hubs import CityHub"
];

function mindstormsHint(cm) {
  const cur = cm.getCursor();
  const token = cm.getTokenAt(cur);
  let word = token.string;
  let start = token.start;
  const m = word.match(/[a-zA-Z_]\w*$/);
  if (m) { word = m[0]; start = token.end - word.length; } else { word = ""; }
  const docWords = [...new Set((cm.getValue().match(/\b[a-zA-Z_]\w+/g) || []).filter(w => w.length > 2))];
  const all = [...new Set([...MINDSTORMS_WORDS, ...docWords])];
  const lower = word.toLowerCase();
  const list = all.filter(w => w.toLowerCase().startsWith(lower) && w !== word).sort().slice(0, 24);
  return { list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, token.end) };
}

// ─── LLM inline completion ──────────────────────────────────────────────────────
const llm = { url: "", model: "", backend: "" };
let ghostMark = null;
let pendingCompletion = "";
let _ghosting = false; // flag so change listener ignores our own inserts

function showGhostText(text) {
  clearGhostText();
  if (!text || !editor) return;
  const line = text.split("\n")[0];
  if (!line.trim()) return;
  const cur = editor.getCursor();
  _ghosting = true;
  editor.replaceRange(line, cur, cur, "+ghost");
  _ghosting = false;
  const end = { line: cur.line, ch: cur.ch + line.length };
  ghostMark = editor.markText(cur, end, { className: "cm-ghost-text", atomic: false, readOnly: false });
  editor.setCursor(cur); // keep cursor before ghost text
  pendingCompletion = line;
}

function clearGhostText() {
  if (!ghostMark) return;
  const range = ghostMark.find();
  ghostMark.clear();
  ghostMark = null;
  if (range) {
    _ghosting = true;
    editor.replaceRange("", range.from, range.to, "+ghost");
    _ghosting = false;
  }
  pendingCompletion = "";
}

function acceptGhostText() {
  if (!pendingCompletion || !ghostMark) return false;
  const range = ghostMark.find();
  ghostMark.clear();
  ghostMark = null;
  if (range) editor.setCursor(range.to); // move cursor past accepted text
  pendingCompletion = "";
  return true;
}

async function detectLlm() {
  const pill = el("aiPill");
  const urlInput = el("aiEndpointInput");
  const modelInput = el("aiModelInput");
  pill.textContent = "\u25cf detecting\u2026";
  pill.className = "pill pill-off";
  llm.url = ""; llm.model = ""; llm.backend = "";
  const base = (urlInput?.value || "").trim().replace(/\/$/, "") || "http://localhost:11434";
  // Ollama
  try {
    const r = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (r.ok) {
      const data = await r.json();
      llm.url = base; llm.backend = "ollama";
      const models = (data.models || []).map(m => m.name);
      // Use model from input if it exists in the list; otherwise use first available
      const typed = modelInput?.value?.trim();
      const matched = models.find(n => n.toLowerCase().startsWith((typed || "").toLowerCase())) || models[0] || typed;
      llm.model = matched || typed || "qwen2.5-coder:7b";
      if (modelInput) modelInput.value = llm.model;
      pill.textContent = `\u25cf Ollama (${llm.model})`;
      pill.className = "pill pill-on";
      setCodeStatus(`AI ready: Ollama. Available: ${models.join(", ") || "(none)"}`);
      return;
    }
  } catch {}
  // llama.cpp
  const cbase = (urlInput?.value || "").trim().replace(/\/$/, "") || "http://localhost:8080";
  try {
    const r = await fetch(`${cbase}/health`, { signal: AbortSignal.timeout(2500) });
    if (r.ok) {
      llm.url = cbase; llm.backend = "llamacpp"; llm.model = "";
      pill.textContent = "\u25cf llama.cpp";
      pill.className = "pill pill-on";
      setCodeStatus(`AI ready: llama.cpp at ${cbase}`);
      return;
    }
  } catch {}
  pill.textContent = "\u25cf AI off";
  pill.className = "pill pill-off";
  setCodeStatus("No local AI found. Start Ollama (ollama serve) or llama.cpp, enter its URL above, then click Detect AI.", true);
}

async function getLlmCompletion(prefix, suffix) {
  if (!llm.url) return "";
  try {
    if (llm.backend === "ollama") {
      const body = { model: llm.model, prompt: prefix, stream: false,
        options: { num_predict: 80, temperature: 0.15, stop: ["\n\n", "```", "def ", "class ", "\n#"] } };
      if (suffix) body.suffix = suffix;
      const r = await fetch(`${llm.url}/api/generate`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(6000) });
      if (!r.ok) return "";
      return ((await r.json()).response || "").trimStart();
    }
    if (llm.backend === "llamacpp") {
      const body = { prompt: prefix, n_predict: 80, temperature: 0.15, stop: ["\n\n", "```"] };
      const r = await fetch(`${llm.url}/completion`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(6000) });
      if (!r.ok) return "";
      return ((await r.json()).content || "").trimStart();
    }
  } catch {}
  return "";
}

function isBlocklyTarget() {
  return el("targetSel")?.value === "blockly-python";
}

// Load Blockly scripts on demand (avoids ~1 MB blocking load on startup)
function loadBlocklyScripts() {
  return new Promise((resolve, reject) => {
    if (window.Blockly) { resolve(); return; }
    const urls = [
      "https://unpkg.com/blockly@9.3.3/blockly_compressed.js",
      "https://unpkg.com/blockly@9.3.3/msg/en.js",
      "https://unpkg.com/blockly@9.3.3/blocks_compressed.js",
      "https://unpkg.com/blockly@9.3.3/python_compressed.js"
    ];
    function loadNext(i) {
      if (i >= urls.length) { resolve(); return; }
      const s = document.createElement("script");
      s.src = urls[i];
      s.onload = () => loadNext(i + 1);
      s.onerror = () => reject(new Error("Failed to load Blockly: " + urls[i]));
      document.head.appendChild(s);
    }
    loadNext(0);
  });
}

const MS_BLOCKLY_BLOCKS = [
  // ── Hub ──────────────────────────────────────────────────────────────────
  {
    "type": "ms_beep",
    "message0": "hub beep  freq %1 Hz  dur %2 ms",
    "args0": [
      { "type": "field_number", "name": "FREQ", "value": 440, "min": 100, "max": 5000 },
      { "type": "field_number", "name": "DUR",  "value": 500, "min": 50,  "max": 5000 }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_hub_light",
    "message0": "hub status light %1",
    "args0": [{ "type": "field_dropdown", "name": "COLOR", "options": [
      ["green","GREEN"],["red","RED"],["yellow","YELLOW"],["blue","BLUE"],["white","WHITE"],["orange","ORANGE"],["cyan","CYAN"],["magenta","MAGENTA"],["off","BLACK"]
    ]}],
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_hub_light_off",
    "message0": "hub status light off",
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_btn_wait",
    "message0": "wait for hub button %1",
    "args0": [{ "type": "field_dropdown", "name": "BTN", "options": [
      ["left","Button.LEFT"],["right","Button.RIGHT"],["center","Button.CENTER"],
      ["Bluetooth","Button.BLUETOOTH"]
    ]}],
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_btn_pressed",
    "message0": "hub button %1 is pressed",
    "args0": [{ "type": "field_dropdown", "name": "BTN", "options": [
      ["left","Button.LEFT"],["right","Button.RIGHT"],["center","Button.CENTER"]
    ]}],
    "output": "Boolean", "colour": "#0c7a71"
  },
  {
    "type": "ms_display_image",
    "message0": "hub display image %1",
    "args0": [{ "type": "field_dropdown", "name": "IMG", "options": [
      ["happy","Image.HAPPY"],["sad","Image.SAD"],["heart","Image.HEART"],["yes","Image.YES"],["no","Image.NO"],["smile","Image.SMILE"],["arrow N","Image.ARROW_N"],["arrow S","Image.ARROW_S"]
    ]}],
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_display_text",
    "message0": "hub display text %1",
    "args0": [{ "type": "field_input", "name": "TEXT", "text": "Hi!" }],
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_display_off",
    "message0": "hub display off",
    "previousStatement": null, "nextStatement": null, "colour": "#0c7a71"
  },
  {
    "type": "ms_imu_angle",
    "message0": "hub orientation angle %1",
    "args0": [{ "type": "field_dropdown", "name": "AXIS", "options": [
      ["pitch","pitch"],["roll","roll"],["yaw","yaw"]
    ]}],
    "output": "Number", "colour": "#0c7a71"
  },
  {
    "type": "ms_battery_pct",
    "message0": "hub battery %",
    "output": "Number", "colour": "#0c7a71"
  },
  // ── Motors ───────────────────────────────────────────────────────────────
  {
    "type": "ms_motor_run",
    "message0": "motor %1  speed %2 %%  for %3 sec",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "SPEED", "value": 30,  "min": -100, "max": 100 },
      { "type": "field_number", "name": "SECS",  "value": 1,   "min": 0.1,  "max": 30  }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "ms_motor_degrees",
    "message0": "motor %1  rotate %2 deg  at %3 %%",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "DEG",   "value": 90,  "min": -720, "max": 720 },
      { "type": "field_number", "name": "SPEED",  "value": 30,  "min": -100, "max": 100 }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "ms_motor_start",
    "message0": "motor %1  start at %2 %%",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "SPEED", "value": 30, "min": -100, "max": 100 }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "ms_motor_stop",
    "message0": "motor %1  stop",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "ms_motor_angle",
    "message0": "motor %1 angle",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#b45309"
  },
  {
    "type": "ms_motor_speed",
    "message0": "motor %1 speed",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#b45309"
  },
  {
    "type": "ms_pair_move",
    "message0": "drive  left %1  right %2  speed %3 %%  for %4 sec",
    "args0": [
      { "type": "field_dropdown", "name": "LEFT",  "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_dropdown", "name": "RIGHT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "SPEED", "value": 50, "min": -100, "max": 100 },
      { "type": "field_number", "name": "SECS",  "value": 2,  "min": 0.1,  "max": 30  }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "ms_pair_steer",
    "message0": "steer  left %1  right %2  steering %3  speed %4 %%  for %5 sec",
    "args0": [
      { "type": "field_dropdown", "name": "LEFT",  "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_dropdown", "name": "RIGHT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "STEER", "value": 0,  "min": -100, "max": 100 },
      { "type": "field_number", "name": "SPEED", "value": 50, "min": -100, "max": 100 },
      { "type": "field_number", "name": "SECS",  "value": 2,  "min": 0.1,  "max": 30  }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  // ── Color Sensor ─────────────────────────────────────────────────────────
  {
    "type": "ms_color_color",
    "message0": "color sensor %1 detected color",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": null, "colour": "#d97706"
  },
  {
    "type": "ms_color_is",
    "message0": "color sensor %1 is %2",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_dropdown", "name": "COLOR", "options": [
        ["red","Color.RED"],["green","Color.GREEN"],["blue","Color.BLUE"],["yellow","Color.YELLOW"],
        ["black","Color.BLACK"],["white","Color.WHITE"],["none","None"]
      ]}
    ],
    "output": "Boolean", "colour": "#d97706"
  },
  {
    "type": "ms_color_ambient",
    "message0": "color sensor %1 ambient light %%",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#d97706"
  },
  {
    "type": "ms_color_reflection",
    "message0": "color sensor %1 reflected light %%",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#d97706"
  },
  // ── Distance / Ultrasonic Sensor ─────────────────────────────────────────
  {
    "type": "ms_dist_mm",
    "message0": "distance sensor %1 distance mm",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#0284c7"
  },
  {
    "type": "ms_dist_cm",
    "message0": "distance sensor %1 distance cm",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#0284c7"
  },
  {
    "type": "ms_dist_less",
    "message0": "distance sensor %1 < %2 mm",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "MM", "value": 200, "min": 1, "max": 2000 }
    ],
    "output": "Boolean", "colour": "#0284c7"
  },
  {
    "type": "ms_dist_presence",
    "message0": "ultrasonic sensor %1 detects presence",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Boolean", "colour": "#0284c7"
  },
  // ── Force Sensor ─────────────────────────────────────────────────────────
  {
    "type": "ms_force_newton",
    "message0": "force sensor %1 force N",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Number", "colour": "#be185d"
  },
  {
    "type": "ms_force_pressed",
    "message0": "force sensor %1 is pressed",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Boolean", "colour": "#be185d"
  },
  {
    "type": "ms_force_touched",
    "message0": "force sensor %1 is touched",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "output": "Boolean", "colour": "#be185d"
  },
  // ── Control ──────────────────────────────────────────────────────────────
  {
    "type": "ms_wait",
    "message0": "wait %1 seconds",
    "args0": [{ "type": "field_number", "name": "SECS", "value": 1, "min": 0.1, "max": 60 }],
    "previousStatement": null, "nextStatement": null, "colour": "#5c6bc0"
  },
  {
    "type": "ms_wait_until_color",
    "message0": "wait until color sensor %1 sees %2",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_dropdown", "name": "COLOR", "options": [
        ["red","Color.RED"],["green","Color.GREEN"],["blue","Color.BLUE"],["yellow","Color.YELLOW"],["black","Color.BLACK"],["white","Color.WHITE"]
      ]}
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#5c6bc0"
  },
  {
    "type": "ms_wait_until_dist",
    "message0": "wait until distance sensor %1 < %2 mm",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] },
      { "type": "field_number", "name": "MM", "value": 200, "min": 1, "max": 2000 }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#5c6bc0"
  },
  {
    "type": "ms_wait_until_force",
    "message0": "wait until force sensor %1 pressed",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"],["C","C"],["D","D"],["E","E"],["F","F"]] }],
    "previousStatement": null, "nextStatement": null, "colour": "#5c6bc0"
  },
  // ── Debug ────────────────────────────────────────────────────────────────
  {
    "type": "ms_print",
    "message0": "print %1",
    "args0": [{ "type": "field_input", "name": "TEXT", "text": "Hello" }],
    "previousStatement": null, "nextStatement": null, "colour": "#607d8b"
  },
  {
    "type": "ms_print_val",
    "message0": "print %1 = %2",
    "args0": [
      { "type": "field_input", "name": "LABEL", "text": "value" },
      { "type": "input_value", "name": "VAL" }
    ],
    "inputsInline": true,
    "previousStatement": null, "nextStatement": null, "colour": "#607d8b"
  }
];

// ── WeDo 2.0 Blockly block definitions ────────────────────────────────────────
const WEDO2_BLOCKLY_BLOCKS = [
  {
    "type": "wd_led",
    "message0": "hub LED %1",
    "args0": [{ "type": "field_dropdown", "name": "COLOR", "options": [
      ["off","0"],["pink","1"],["purple","2"],["blue","3"],["light blue","4"],
      ["cyan","5"],["green","6"],["yellow","7"],["orange","8"],["red","9"],["white","10"]
    ]}],
    "previousStatement": null, "nextStatement": null, "colour": "#e47b00"
  },
  {
    "type": "wd_motor_run",
    "message0": "motor %1 run for %2 s at %3 %%",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"]] },
      { "type": "field_number", "name": "SECS", "value": 1, "min": 0.1, "max": 30 },
      { "type": "field_number", "name": "SPEED", "value": 50, "min": -100, "max": 100 }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "wd_motor_start",
    "message0": "motor %1 start at %2 %%",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"]] },
      { "type": "field_number", "name": "SPEED", "value": 50, "min": -100, "max": 100 }
    ],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "wd_motor_stop",
    "message0": "motor %1 stop",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"]] }],
    "previousStatement": null, "nextStatement": null, "colour": "#b45309"
  },
  {
    "type": "wd_motion_distance",
    "message0": "motion sensor %1 distance (0-10)",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"]] }],
    "output": "Number", "colour": "#0284c7"
  },
  {
    "type": "wd_motion_detected",
    "message0": "motion sensor %1 detects something",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"]] }],
    "output": "Boolean", "colour": "#0284c7"
  },
  {
    "type": "wd_tilt_angle",
    "message0": "hub tilt %1 angle",
    "args0": [{ "type": "field_dropdown", "name": "AXIS", "options": [
      ["pitch","pitch"],["roll","roll"]
    ]}],
    "output": "Number", "colour": "#0284c7"
  },
  {
    "type": "wd_wait",
    "message0": "wait %1 seconds",
    "args0": [{ "type": "field_number", "name": "SECS", "value": 1, "min": 0.1, "max": 60 }],
    "previousStatement": null, "nextStatement": null, "colour": "#5c6bc0"
  },
  {
    "type": "wd_wait_motion",
    "message0": "wait until motion sensor %1 detects something",
    "args0": [{ "type": "field_dropdown", "name": "PORT", "options": [["A","A"],["B","B"]] }],
    "previousStatement": null, "nextStatement": null, "colour": "#5c6bc0"
  },
  {
    "type": "wd_print",
    "message0": "print %1",
    "args0": [{ "type": "field_input", "name": "TEXT", "text": "Hello" }],
    "previousStatement": null, "nextStatement": null, "colour": "#607d8b"
  }
];

const WEDO2_BLOCKLY_TOOLBOX = {
  "kind": "categoryToolbox",
  "contents": [
    { "kind": "category", "name": "Hub", "colour": "#e47b00",
      "contents": [
        { "kind": "block", "type": "wd_led" }
      ]
    },
    { "kind": "category", "name": "Motors", "colour": "#b45309",
      "contents": [
        { "kind": "block", "type": "wd_motor_run" },
        { "kind": "block", "type": "wd_motor_start" },
        { "kind": "block", "type": "wd_motor_stop" }
      ]
    },
    { "kind": "category", "name": "Motion Sensor", "colour": "#0284c7",
      "contents": [
        { "kind": "block", "type": "wd_motion_distance" },
        { "kind": "block", "type": "wd_motion_detected" },
        { "kind": "block", "type": "wd_tilt_angle" }
      ]
    },
    { "kind": "category", "name": "Control", "colour": "#5c6bc0",
      "contents": [
        { "kind": "block", "type": "wd_wait" },
        { "kind": "block", "type": "wd_wait_motion" },
        { "kind": "block", "type": "controls_repeat_ext",
          "inputs": { "TIMES": { "shadow": { "type": "math_number", "fields": { "NUM": 3 } } } }
        },
        { "kind": "block", "type": "controls_whileUntil" },
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "controls_if", "extraState": { "hasElse": true } }
      ]
    },
    { "kind": "category", "name": "Debug", "colour": "#607d8b",
      "contents": [
        { "kind": "block", "type": "wd_print" }
      ]
    },
    { "kind": "sep" },
    { "kind": "category", "name": "Logic", "colour": "%{BKY_LOGIC_HUE}",
      "contents": [
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_negate" },
        { "kind": "block", "type": "logic_boolean" }
      ]
    },
    { "kind": "category", "name": "Math", "colour": "%{BKY_MATH_HUE}",
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "math_random_int" }
      ]
    },
    { "kind": "category", "name": "Variables", "colour": "%{BKY_VARIABLES_HUE}", "custom": "VARIABLE" }
  ]
};

const BLOCKLY_TOOLBOX = {
  "kind": "categoryToolbox",
  "contents": [
    { "kind": "category", "name": "Hub", "colour": "#0c7a71",
      "contents": [
        { "kind": "block", "type": "ms_beep" },
        { "kind": "block", "type": "ms_hub_light" },
        { "kind": "block", "type": "ms_hub_light_off" },
        { "kind": "block", "type": "ms_btn_wait" },
        { "kind": "block", "type": "ms_btn_pressed" },
        { "kind": "block", "type": "ms_display_image" },
        { "kind": "block", "type": "ms_display_text" },
        { "kind": "block", "type": "ms_display_off" },
        { "kind": "block", "type": "ms_imu_angle" },
        { "kind": "block", "type": "ms_battery_pct" }
      ]
    },
    { "kind": "category", "name": "Motors", "colour": "#b45309",
      "contents": [
        { "kind": "block", "type": "ms_motor_run" },
        { "kind": "block", "type": "ms_motor_degrees" },
        { "kind": "block", "type": "ms_motor_start" },
        { "kind": "block", "type": "ms_motor_stop" },
        { "kind": "block", "type": "ms_motor_angle" },
        { "kind": "block", "type": "ms_motor_speed" },
        { "kind": "block", "type": "ms_pair_move" },
        { "kind": "block", "type": "ms_pair_steer" }
      ]
    },
    { "kind": "category", "name": "Color Sensor", "colour": "#d97706",
      "contents": [
        { "kind": "block", "type": "ms_color_color" },
        { "kind": "block", "type": "ms_color_is" },
        { "kind": "block", "type": "ms_color_ambient" },
        { "kind": "block", "type": "ms_color_reflection" }
      ]
    },
    { "kind": "category", "name": "Distance Sensor", "colour": "#0284c7",
      "contents": [
        { "kind": "block", "type": "ms_dist_mm" },
        { "kind": "block", "type": "ms_dist_cm" },
        { "kind": "block", "type": "ms_dist_less" },
        { "kind": "block", "type": "ms_dist_presence" }
      ]
    },
    { "kind": "category", "name": "Force Sensor", "colour": "#be185d",
      "contents": [
        { "kind": "block", "type": "ms_force_newton" },
        { "kind": "block", "type": "ms_force_pressed" },
        { "kind": "block", "type": "ms_force_touched" }
      ]
    },
    { "kind": "category", "name": "Control", "colour": "#5c6bc0",
      "contents": [
        { "kind": "block", "type": "ms_wait" },
        { "kind": "block", "type": "ms_wait_until_color" },
        { "kind": "block", "type": "ms_wait_until_dist" },
        { "kind": "block", "type": "ms_wait_until_force" },
        { "kind": "block", "type": "controls_repeat_ext",
          "inputs": { "TIMES": { "shadow": { "type": "math_number", "fields": { "NUM": 3 } } } }
        },
        { "kind": "block", "type": "controls_whileUntil" },
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "controls_if", "extraState": { "hasElse": true } }
      ]
    },
    { "kind": "category", "name": "Debug", "colour": "#607d8b",
      "contents": [
        { "kind": "block", "type": "ms_print" },
        { "kind": "block", "type": "ms_print_val" }
      ]
    },
    { "kind": "sep" },
    { "kind": "category", "name": "Logic", "colour": "%{BKY_LOGIC_HUE}",
      "contents": [
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_negate" },
        { "kind": "block", "type": "logic_boolean" }
      ]
    },
    { "kind": "category", "name": "Math", "colour": "%{BKY_MATH_HUE}",
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "math_single" },
        { "kind": "block", "type": "math_constrain" },
        { "kind": "block", "type": "math_random_int" }
      ]
    },
    { "kind": "category", "name": "Text", "colour": "%{BKY_TEXTS_HUE}",
      "contents": [
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_join" }
      ]
    },
    { "kind": "category", "name": "Variables", "colour": "%{BKY_VARIABLES_HUE}", "custom": "VARIABLE" }
  ]
};

function registerBlocklyGenerators() {
  const Py = Blockly.Python;
  const PORT_OBJ = { color: "ColorSensor", dist: "DistanceSensor", force: "ForceSensor" };
  // Hub
  Py["ms_beep"]         = b => `hub.speaker.beep(frequency=${b.getFieldValue("FREQ")}, duration=${parseFloat(b.getFieldValue("DUR")) / 1000})\n`;
  Py["ms_hub_light"]    = b => { const c = b.getFieldValue("COLOR"); return c === "BLACK" ? `hub.status_light.off()\n` : `hub.status_light.on(Color.${c})\n`; };
  Py["ms_hub_light_off"]= () => `hub.status_light.off()\n`;
  const btnMap = { "Button.LEFT": "hub.left_button", "Button.RIGHT": "hub.right_button", "Button.CENTER": "hub.center_button", "Button.BLUETOOTH": "hub.bluetooth_button" };
  Py["ms_btn_wait"]     = b => { const btn = btnMap[b.getFieldValue("BTN")] || "hub.left_button"; return `wait_until(lambda: ${btn}.is_pressed())\n`; };
  Py["ms_btn_pressed"]  = b => { const btn = btnMap[b.getFieldValue("BTN")] || "hub.left_button"; return [`${btn}.is_pressed()`, Blockly.Python.ORDER_FUNCTION_CALL]; };
  Py["ms_display_image"]= b => `hub.light_matrix.show_image("${b.getFieldValue("IMG").replace("Image.","")}")\n`;
  Py["ms_display_text"] = b => `hub.light_matrix.write("${b.getFieldValue("TEXT")}")\n`;
  Py["ms_display_off"]  = () => `hub.light_matrix.off()\n`;
  Py["ms_imu_angle"]    = b => [`hub.motion_sensor.get_${b.getFieldValue("AXIS")}_angle()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_battery_pct"]  = () => [`hub.battery.voltage()`, Blockly.Python.ORDER_FUNCTION_CALL];
  // Motors
  Py["ms_motor_run"]    = b => `Motor('${b.getFieldValue("PORT")}').run_for_seconds(${b.getFieldValue("SECS")}, speed=${b.getFieldValue("SPEED")})\n`;
  Py["ms_motor_degrees"]= b => `Motor('${b.getFieldValue("PORT")}').run_for_degrees(${b.getFieldValue("DEG")}, speed=${b.getFieldValue("SPEED")})\n`;
  Py["ms_motor_start"]  = b => `Motor('${b.getFieldValue("PORT")}').start(speed=${b.getFieldValue("SPEED")})\n`;
  Py["ms_motor_stop"]   = b => `Motor('${b.getFieldValue("PORT")}').stop()\n`;
  Py["ms_motor_angle"]  = b => [`Motor('${b.getFieldValue("PORT")}').get_degrees_counted()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_motor_speed"]  = b => [`Motor('${b.getFieldValue("PORT")}').get_speed()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_pair_move"]    = b => `MotorPair('${b.getFieldValue("LEFT")}', '${b.getFieldValue("RIGHT")}').move(${b.getFieldValue("SECS")} * ${b.getFieldValue("SPEED")} / 10, 'cm', steering=0, speed=${b.getFieldValue("SPEED")})\n`;
  Py["ms_pair_steer"]   = b => `MotorPair('${b.getFieldValue("LEFT")}', '${b.getFieldValue("RIGHT")}').move_tank(${b.getFieldValue("SECS")}, 'seconds', left_speed=${b.getFieldValue("SPEED")}, right_speed=${b.getFieldValue("SPEED")})\n`;
  // Color sensor
  Py["ms_color_color"]    = b => [`ColorSensor('${b.getFieldValue("PORT")}').get_color()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_color_is"]       = b => [`ColorSensor('${b.getFieldValue("PORT")}').get_color() == ${b.getFieldValue("COLOR")}`, Blockly.Python.ORDER_RELATIONAL];
  Py["ms_color_ambient"]  = b => [`ColorSensor('${b.getFieldValue("PORT")}').get_ambient_light()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_color_reflection"]= b => [`ColorSensor('${b.getFieldValue("PORT")}').get_reflected_light()`, Blockly.Python.ORDER_FUNCTION_CALL];
  // Distance sensor
  Py["ms_dist_mm"]        = b => [`DistanceSensor('${b.getFieldValue("PORT")}').get_distance_mm()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_dist_cm"]        = b => [`DistanceSensor('${b.getFieldValue("PORT")}').get_distance_cm()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_dist_less"]      = b => [`DistanceSensor('${b.getFieldValue("PORT")}').get_distance_mm() < ${b.getFieldValue("MM")}`, Blockly.Python.ORDER_RELATIONAL];
  Py["ms_dist_presence"]  = b => [`DistanceSensor('${b.getFieldValue("PORT")}').wait_for_distance_closer_than(1, 'cm')`, Blockly.Python.ORDER_FUNCTION_CALL];
  // Force sensor
  Py["ms_force_newton"]   = b => [`ForceSensor('${b.getFieldValue("PORT")}').get_force_newton()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_force_pressed"]  = b => [`ForceSensor('${b.getFieldValue("PORT")}').is_pressed()`, Blockly.Python.ORDER_FUNCTION_CALL];
  Py["ms_force_touched"]  = b => [`ForceSensor('${b.getFieldValue("PORT")}').is_touched()`, Blockly.Python.ORDER_FUNCTION_CALL];
  // Control
  Py["ms_wait"]             = b => `wait_for_seconds(${b.getFieldValue("SECS")})\n`;
  Py["ms_wait_until_color"] = b => `wait_until(lambda: ColorSensor('${b.getFieldValue("PORT")}').get_color() == ${b.getFieldValue("COLOR")})\n`;
  Py["ms_wait_until_dist"]  = b => `wait_until(lambda: DistanceSensor('${b.getFieldValue("PORT")}').get_distance_mm() < ${b.getFieldValue("MM")})\n`;
  Py["ms_wait_until_force"] = b => `wait_until(lambda: ForceSensor('${b.getFieldValue("PORT")}').is_pressed())\n`;
  // Debug
  Py["ms_print"]    = b => `print("${b.getFieldValue("TEXT").replace(/"/g, '\\"')}")\n`;
  Py["ms_print_val"]= (b, gen) => `print("${b.getFieldValue("LABEL")}:", ${gen.valueToCode(b, "VAL", Blockly.Python.ORDER_NONE) || "None"})\n`;
}

function registerWeDo2BlocklyGenerators() {
  const Py = Blockly.Python;
  // Hub
  Py["wd_led"]            = b => `hub.led(${b.getFieldValue("COLOR")})\n`;
  // Motors (hub.port.X.motor API)
  Py["wd_motor_run"]      = b => `hub.port.${b.getFieldValue("PORT")}.motor.run_for_seconds(speed=${b.getFieldValue("SPEED")}, seconds=${b.getFieldValue("SECS")})\n`;
  Py["wd_motor_start"]    = b => `hub.port.${b.getFieldValue("PORT")}.motor.start(speed=${b.getFieldValue("SPEED")})\n`;
  Py["wd_motor_stop"]     = b => `hub.port.${b.getFieldValue("PORT")}.motor.stop()\n`;
  // Motion sensor
  Py["wd_motion_distance"]= b => [`hub.port.${b.getFieldValue("PORT")}.device.get()[0]`, Blockly.Python.ORDER_SUBSCRIPT];
  Py["wd_motion_detected"]= b => [`(hub.port.${b.getFieldValue("PORT")}.device.get()[0] is not None and hub.port.${b.getFieldValue("PORT")}.device.get()[0] < 10)`, Blockly.Python.ORDER_RELATIONAL];
  Py["wd_tilt_angle"]     = b => {
    const axis = b.getFieldValue("AXIS");
    const idx  = axis === "pitch" ? 0 : 1;
    return [`hub.motion.tilt_angles()[${idx}]`, Blockly.Python.ORDER_SUBSCRIPT];
  };
  // Control
  Py["wd_wait"]           = b => `time.sleep(${b.getFieldValue("SECS")})\n`;
  Py["wd_wait_motion"]    = b => `while hub.port.${b.getFieldValue("PORT")}.device.get()[0] is None or hub.port.${b.getFieldValue("PORT")}.device.get()[0] >= 10: time.sleep(0.05)\n`;
  // Debug
  Py["wd_print"]          = b => `print("${b.getFieldValue("TEXT").replace(/"/g, '\\"')}")\n`;
}

function initBlockly() {
  if (blocklyWorkspace || !window.Blockly) return;
  const profile = selectedProfile();
  const isWeDo = profile && profile.family === "wedo2";
  Blockly.defineBlocksWithJsonArray(MS_BLOCKLY_BLOCKS);
  Blockly.defineBlocksWithJsonArray(WEDO2_BLOCKLY_BLOCKS);
  registerBlocklyGenerators();
  registerWeDo2BlocklyGenerators();
  const toolbox = isWeDo ? WEDO2_BLOCKLY_TOOLBOX : BLOCKLY_TOOLBOX;
  blocklyWorkspace = Blockly.inject("blocklyDiv", {
    toolbox,
    grid: { spacing: 20, length: 3, colour: "#1e3040", snap: true },
    trashcan: true,
    zoom: { controls: true, wheel: true, startScale: 1.0 }
  });
  window._blocklyWs = blocklyWorkspace;
  registerCustomBlocks(); // load any saved custom blocks
}

// ─── Custom Blockly Blocks ─────────────────────────────────────────────────────
const CUSTOM_BLOCKS_KEY = "ms_custom_blocks";

function getCustomBlocks() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_BLOCKS_KEY) || "[]"); } catch { return []; }
}
function saveCustomBlocks(arr) {
  localStorage.setItem(CUSTOM_BLOCKS_KEY, JSON.stringify(arr));
}

// Build a Blockly JSON block definition from a saved custom-block descriptor.
function buildBlockDef(cb) {
  const inputs = cb.inputs || [];
  // Message: label text then one %N per input field
  const message = cb.label + (inputs.length ? " " + inputs.map((_, i) => `%${i + 1}`).join(" ") : "");
  const args0 = inputs.map(f => {
    if (f.type === "number")   return { type: "field_number",   name: f.name, value: parseFloat(f.default) || 0 };
    if (f.type === "dropdown") return { type: "field_dropdown", name: f.name,
      options: (f.options || f.default || "A,B,C").split(",").map(o => [o.trim(), o.trim()]) };
    return { type: "field_input", name: f.name, text: f.default || "" };
  });
  const def = { type: cb.id, message0: message, args0, colour: cb.colour || "#7c3aed",
    tooltip: cb.label, helpUrl: "" };
  if (cb.isStatement !== false) { def.previousStatement = null; def.nextStatement = null; }
  else { def.output = null; }
  return def;
}

function buildToolboxWithCustom(customs) {
  const base = JSON.parse(JSON.stringify(BLOCKLY_TOOLBOX));
  // Remove any previously injected custom categories
  base.contents = base.contents.filter(c => !c._isCustom);
  // Group custom blocks by category
  const catMap = {};
  for (const cb of customs) {
    const cat = cb.category || "Custom";
    if (!catMap[cat]) catMap[cat] = { colour: cb.colour || "#7c3aed", ids: [] };
    catMap[cat].ids.push(cb.id);
  }
  const cats = Object.entries(catMap);
  if (cats.length) {
    base.contents.push({ kind: "sep", _isCustom: true });
    for (const [name, { colour, ids }] of cats) {
      base.contents.push({ kind: "category", name, colour, _isCustom: true,
        contents: ids.map(type => ({ kind: "block", type })) });
    }
  }
  return base;
}

function registerCustomBlocks() {
  if (!window.Blockly || !blocklyWorkspace) return;
  const customs = getCustomBlocks();
  if (!customs.length) return;
  // Re-define blocks (safe to call multiple times; Blockly warns but doesn't error)
  Blockly.defineBlocksWithJsonArray(customs.map(buildBlockDef));
  // Register Python generators
  for (const cb of customs) {
    Blockly.Python[cb.id] = function(block) {
      let code = cb.pythonTemplate || "";
      for (const f of (cb.inputs || [])) {
        const raw = block.getFieldValue(f.name) ?? "";
        // Wrap text-type values in quotes; numbers/dropdowns go bare
        const val = f.type === "text" ? `"${String(raw).replace(/"/g, '\\"')}"` : raw;
        code = code.split(`{${f.name}}`).join(val);
      }
      if (cb.isStatement === false) {
        return [code || "None", Blockly.Python.ORDER_FUNCTION_CALL];
      }
      return code.endsWith("\n") ? code : code + "\n";
    };
  }
  // Update live toolbox
  try { blocklyWorkspace.updateToolbox(buildToolboxWithCustom(customs)); } catch {}
}

// ─── Custom Block Modal Controller ───────────────────────────────────────────────
let _cbInputSeq = 0;

function openCustomBlockModal() {
  _cbInputSeq = 0;
  el("cbInputRows").innerHTML = "";
  el("cbName").value = "";
  el("cbPythonTpl").value = "";
  el("cbCategory").value = "Custom";
  el("cbColour").value = "#7c3aed";
  el("cbIsStatement").value = "statement";
  renderCbSavedList();
  el("customBlockModal").style.display = "flex";
  el("cbName").focus();
}

function closeCustomBlockModal() {
  el("customBlockModal").style.display = "none";
}

function addCbInputRow() {
  const idx = _cbInputSeq++;
  const div = document.createElement("div");
  div.className = "cb-input-row";
  div.innerHTML = `
    <input type="text" class="cb-in-label" placeholder="Label in block" value="">
    <input type="text" class="cb-in-name"  placeholder="FIELD_NAME" value="PARAM${idx + 1}" style="max-width:110px;text-transform:uppercase">
    <select class="cb-in-type">
      <option value="number">Number</option>
      <option value="text">Text</option>
      <option value="dropdown">Dropdown</option>
    </select>
    <input type="text" class="cb-in-default" placeholder="Default / options (A,B,C)" value="">
    <button type="button" class="cb-rm" title="Remove">&times;</button>
  `;
  div.querySelector(".cb-in-name").addEventListener("input", e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  });
  div.querySelector(".cb-rm").addEventListener("click", () => div.remove());
  el("cbInputRows").appendChild(div);
}

function saveCbBlock() {
  const label = el("cbName").value.trim();
  if (!label) { el("cbName").focus(); el("cbName").style.outline = "2px solid #ef4444"; return; }
  el("cbName").style.outline = "";
  const rows = [...el("cbInputRows").querySelectorAll(".cb-input-row")];
  const inputs = rows.map(row => ({
    label:   row.querySelector(".cb-in-label")  .value.trim(),
    name:    row.querySelector(".cb-in-name")   .value.trim().toUpperCase() || `PARAM${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    type:    row.querySelector(".cb-in-type")   .value,
    default: row.querySelector(".cb-in-default").value.trim(),
    options: row.querySelector(".cb-in-type")   .value === "dropdown"
             ? row.querySelector(".cb-in-default").value.trim() : undefined
  }));
  const id = "custom_" + Date.now();
  const cb = {
    id, label,
    category:      el("cbCategory").value.trim() || "Custom",
    colour:        el("cbColour").value,
    inputs,
    pythonTemplate: el("cbPythonTpl").value,
    isStatement:   el("cbIsStatement").value !== "value"
  };
  const arr = getCustomBlocks();
  arr.push(cb);
  saveCustomBlocks(arr);
  registerCustomBlocks();
  renderCbSavedList();
  // Reset form fields for next block
  el("cbName").value = ""; el("cbPythonTpl").value = ""; el("cbInputRows").innerHTML = ""; _cbInputSeq = 0;
  setCodeStatus(`✓ Custom block "${label}" added to toolbox — find it in the ${cb.category} category`);
}

function deleteCbBlock(id) {
  if (!confirm("Delete this custom block?")) return;
  const arr = getCustomBlocks().filter(b => b.id !== id);
  saveCustomBlocks(arr);
  if (blocklyWorkspace) {
    blocklyWorkspace.getBlocksByType(id, false).forEach(b => b.dispose(false));
    try { blocklyWorkspace.updateToolbox(buildToolboxWithCustom(arr)); } catch {}
  }
  renderCbSavedList();
}

function renderCbSavedList() {
  const list = el("cbSavedList");
  const customs = getCustomBlocks();
  if (!customs.length) { list.innerHTML = ""; return; }
  const items = customs.map(cb => {
    const dot = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cb.colour};margin-right:6px"></span>`;
    return `<div class="cb-saved-item">
      <span class="cb-saved-item-name">${dot}${cb.label}</span>
      <span class="cb-saved-item-cat">${cb.category}</span>
      <button class="cb-saved-del" data-id="${cb.id}" title="Delete block">&#128465;</button>
    </div>`;
  }).join("");
  list.innerHTML = `<div class="cb-saved-list-title">Saved custom blocks (${customs.length})</div>${items}`;
  list.querySelectorAll(".cb-saved-del").forEach(btn => {
    btn.addEventListener("click", () => deleteCbBlock(btn.dataset.id));
  });
}

/* ── WeDo 2.0 Blockly intent starter XML ─────────────────────────────────── */
function buildWeDo2BlocklyIntentXml(profile, intent) {
  const ports   = profile.ports || {};
  const motors  = Object.entries(ports).filter(([, p]) => p.kind === "motor");
  const sensors = Object.entries(ports).filter(([, p]) => p.kind === "sensor");
  const motorPort  = motors.length  ? motors[0][0]  : "A";
  const sensorPort = sensors.length ? sensors[0][0] : "B";

  function chain(defs, x = 30, y = 30) {
    if (!defs.length) return "";
    function build(i) {
      if (i >= defs.length) return "";
      const d = defs[i];
      const fields = Object.entries(d.fields || {}).map(([k, v]) => `<field name="${k}">${v}</field>`).join("");
      const next   = build(i + 1);
      const xy     = i === 0 ? ` x="${x}" y="${y}"` : "";
      return `<block type="${d.type}"${xy}>${fields}${next ? `<next>${next}</next>` : ""}</block>`;
    }
    return build(0);
  }
  function repeatBlock(times, innerDefs, x = 30, y = 30) {
    const inner = chain(innerDefs);
    return `<block type="controls_repeat_ext" x="${x}" y="${y}">
      <value name="TIMES"><shadow type="math_number"><field name="NUM">${times}</field></shadow></value>
      ${inner ? `<statement name="DO">${inner}</statement>` : ""}
    </block>`;
  }

  let xml = "";

  if (intent === "beep_hello") {
    xml = chain([
      { type: "wd_led",   fields: { COLOR: "6" } },   /* green */
      { type: "wd_wait",  fields: { SECS: 0.5 } },
      { type: "wd_led",   fields: { COLOR: "0" } },   /* off */
      { type: "wd_print", fields: { TEXT: "Hello from WeDo 2.0!" } }
    ]);
  } else if (intent === "safe_probe") {
    const defs = [
      { type: "wd_led",  fields: { COLOR: "7" } },   /* yellow */
      ...motors.flatMap(([port]) => [
        { type: "wd_print",      fields: { TEXT: `Testing port ${port}` } },
        { type: "wd_motor_run",  fields: { PORT: port, SECS: 1, SPEED: 50 } },
        { type: "wd_wait",       fields: { SECS: 0.5 } },
        { type: "wd_motor_run",  fields: { PORT: port, SECS: 1, SPEED: -50 } },
        { type: "wd_wait",       fields: { SECS: 0.5 } }
      ]),
      { type: "wd_led",   fields: { COLOR: "6" } },   /* green */
      { type: "wd_print", fields: { TEXT: "Probe complete" } }
    ];
    xml = chain(defs);
  } else if (intent === "drive_forward") {
    xml = chain([
      { type: "wd_led",       fields: { COLOR: "6" } },
      { type: "wd_motor_run", fields: { PORT: motorPort, SECS: 2, SPEED: 60 } },
      { type: "wd_led",       fields: { COLOR: "0" } }
    ]);
  } else if (intent === "wave") {
    xml = repeatBlock(3, [
      { type: "wd_motor_run", fields: { PORT: motorPort, SECS: 0.5, SPEED:  70 } },
      { type: "wd_motor_run", fields: { PORT: motorPort, SECS: 0.5, SPEED: -70 } }
    ]);
  } else {
    xml = chain([{ type: "wd_led", fields: { COLOR: "6" } }, { type: "wd_wait", fields: { SECS: 1 } }]);
  }

  return `<xml xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
}

function buildBlocklyIntentXml(profile, intent) {
  // Dispatch to WeDo 2.0-specific builder for wedo2 family
  if (profile && profile.family === "wedo2") {
    return buildWeDo2BlocklyIntentXml(profile, intent);
  }

  const motors  = Object.entries(profile.ports || {}).filter(([, p]) => p.kind === "motor");
  const sensors = Object.entries(profile.ports || {}).filter(([, p]) => p.kind === "sensor");
  const drives  = motors.filter(([, p]) => /drive|wheel/.test(p.role));
  const arms    = motors.filter(([, p]) => /arm|lift|wave|action|body/.test(p.role));
  const colors  = sensors.filter(([, p]) => /color/.test(p.part || "") || /color/.test(p.role));
  const dists   = sensors.filter(([, p]) => /distance|ultrasonic/.test(p.part || "") || /dist/.test(p.role));

  // Builds a chain of statement blocks (next-connected) from x,y
  function chain(defs, x = 30, y = 30) {
    if (!defs.length) return "";
    function build(i) {
      if (i >= defs.length) return "";
      const d = defs[i];
      const fields = Object.entries(d.fields || {}).map(([k, v]) => `<field name="${k}">${v}</field>`).join("");
      const next   = build(i + 1);
      const xy     = i === 0 ? ` x="${x}" y="${y}"` : "";
      return `<block type="${d.type}"${xy}>${fields}${next ? `<next>${next}</next>` : ""}</block>`;
    }
    return build(0);
  }

  // Helper: wrap a chain inside controls_repeat_ext (N times)
  function repeatBlock(times, innerDefs, x = 30, y = 30) {
    const inner = chain(innerDefs);
    return `<block type="controls_repeat_ext" x="${x}" y="${y}">
      <value name="TIMES"><shadow type="math_number"><field name="NUM">${times}</field></shadow></value>
      ${inner ? `<statement name="DO">${inner}</statement>` : ""}
    </block>`;
  }

  let xml = "";

  if (intent === "beep_hello") {
    const defs = [
      { type: "ms_beep",      fields: { FREQ: 440, DUR: 500 } },
      { type: "ms_hub_light", fields: { COLOR: "GREEN" } },
      { type: "ms_wait",      fields: { SECS: 1 } },
      { type: "ms_hub_light_off", fields: {} }
    ];
    xml = chain(defs);

  } else if (intent === "safe_probe") {
    const defs = [
      { type: "ms_hub_light", fields: { COLOR: "YELLOW" } },
      ...motors.flatMap(([port, p]) => [
        { type: "ms_print",     fields: { TEXT: `Testing ${p.role} port ${port}` } },
        { type: "ms_motor_run", fields: { PORT: port, SPEED:  30, SECS: 1 } },
        { type: "ms_wait",      fields: { SECS: 0.5 } },
        { type: "ms_motor_run", fields: { PORT: port, SPEED: -30, SECS: 1 } },
        { type: "ms_wait",      fields: { SECS: 0.5 } }
      ]),
      { type: "ms_hub_light", fields: { COLOR: "GREEN" } },
      { type: "ms_beep",      fields: { FREQ: 800, DUR: 300 } },
      { type: "ms_print",     fields: { TEXT: "Probe complete" } }
    ];
    xml = chain(defs);

  } else if (intent === "drive_forward") {
    const targets = drives.length >= 2 ? drives : (motors.length >= 2 ? motors.slice(0, 2) : motors.slice(0, 1));
    if (targets.length >= 2) {
      // Use MotorPair move block
      const [l, r] = [targets[0][0], targets[1][0]];
      const defs = [
        { type: "ms_pair_move",  fields: { LEFT: l, RIGHT: r, SPEED: 50, SECS: 2 } },
        { type: "ms_beep",       fields: { FREQ: 500, DUR: 200 } }
      ];
      xml = chain(defs);
    } else if (targets.length === 1) {
      const defs = [
        { type: "ms_motor_run", fields: { PORT: targets[0][0], SPEED: 30, SECS: 2 } },
        { type: "ms_beep",      fields: { FREQ: 500, DUR: 200 } }
      ];
      xml = chain(defs);
    } else {
      xml = chain([{ type: "ms_beep", fields: { FREQ: 440, DUR: 500 } }]);
    }

  } else if (intent === "wave") {
    const target = arms.length ? arms[0] : (motors.length ? motors[0] : null);
    if (target) {
      const [port] = target;
      // Use repeat(3) { forward 90°, wait, back 90°, wait }
      xml = repeatBlock(3, [
        { type: "ms_motor_degrees", fields: { PORT: port, DEG:  90, SPEED: 40 } },
        { type: "ms_wait",          fields: { SECS: 0.2 } },
        { type: "ms_motor_degrees", fields: { PORT: port, DEG: -90, SPEED: 40 } },
        { type: "ms_wait",          fields: { SECS: 0.2 } }
      ]);
      // Add a beep after the repeat block
      const afterY = 30 + 3 * 82 + 40; // rough pixel offset
      xml += chain([{ type: "ms_beep", fields: { FREQ: 600, DUR: 200 } }], 30, afterY);
    } else {
      xml = chain([{ type: "ms_beep", fields: { FREQ: 440, DUR: 500 } }]);
    }

  } else {
    xml = chain([{ type: "ms_beep", fields: { FREQ: 440, DUR: 300 } }, { type: "ms_wait", fields: { SECS: 1 } }]);
  }

  return `<xml xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
}

function loadBlocklyIntent(profile, intent) {
  if (!blocklyWorkspace) return;
  blocklyWorkspace.clear();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(buildBlocklyIntentXml(profile, intent)), blocklyWorkspace);
    blocklyWorkspace.scrollCenter();
  } catch (e) { console.warn("Blockly XML load error:", e); }
}

function getBlocklyPython(profile) {
  if (!blocklyWorkspace || !window.Blockly) return "";
  const body = Blockly.Python.workspaceToCode(blocklyWorkspace);
  let header;
  if (profile && profile.family === "wedo2") {
    header = [
      `# ${profile.name} — ${profile.kit || "LEGO Education WeDo 2.0 45300"}`,
      `# Target: blockly-python → WeDo 2.0 hub module (MicroPython)`,
      `# Generated by Mindstorms Robot Creator`,
      ``,
      `import hub`,
      `import time`,
      ``
    ].join("\n");
  } else {
    header = [
      `# ${profile ? profile.name : "Robot"} — ${profile ? (profile.kit || "Robot Inventor 51515") : ""}`,
      `# Target: blockly-python (Blockly visual → Python)`,
      `# Generated by Mindstorms Robot Creator`,
      ``,
      `from mindstorms import MSHub, Motor, MotorPair, ColorSensor, DistanceSensor, App`,
      `from mindstorms.control import wait_for_seconds, wait_until, Timer`,
      `from mindstorms.color import BLACK, WHITE, RED, GREEN, BLUE, YELLOW`,
      `import math`,
      ``,
      `hub = MSHub()`,
      ``
    ].join("\n");
  }
  return header + body;
}

async function showBlocklyEditor() {
  el("editorWrap").style.display = "none";
  // Hide custom block button for WeDo 2.0 (simpler palette)
  const profile = selectedProfile();
  el("customBlockBtn").style.display = (profile && profile.family === "wedo2") ? "none" : "";
  const div = el("blocklyDiv");
  div.style.display = "block";
  setCodeStatus("Loading Blockly...");
  try {
    await loadBlocklyScripts();
    void div.offsetWidth; void div.offsetHeight;
    // Destroy and re-init if family changed so toolbox switches correctly
    if (blocklyWorkspace) {
      const prevIsWeDo = blocklyWorkspace._isWeDo2 || false;
      const nowIsWeDo  = !!(profile && profile.family === "wedo2");
      if (prevIsWeDo !== nowIsWeDo) {
        blocklyWorkspace.dispose();
        blocklyWorkspace = null;
      }
    }
    initBlockly();
    if (blocklyWorkspace) blocklyWorkspace._isWeDo2 = !!(profile && profile.family === "wedo2");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (blocklyWorkspace) Blockly.svgResize(blocklyWorkspace);
      // Auto-populate with the current intent immediately after init
      const profile = selectedProfile();
      const intent  = el("intentSel").value;
      if (profile && intent) loadBlocklyIntent(profile, intent);
    }));
    setCodeStatus("");
  } catch (e) {
    setCodeStatus("Could not load Blockly (offline?)", true);
  }
  updateHubPill();
}

function showTextEditor() {
  el("blocklyDiv").style.display = "none";
  el("customBlockBtn").style.display = "none";
  el("editorWrap").style.display = "";
  if (editor) editor.refresh();
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
//   WeDo 2.0 device service : '00001523-1212-efde-1523-785feabcd123' (advertised)
//   WeDo 2.0 IO service     : '00004f0e-1212-efde-1523-785feabcd123' (motor + LED output)
//   WeDo 2.0 output cmd     : '00001565-1212-efde-1523-785feabcd123' (motor ports 1/2 + LED port 6)

const PYBRICKS_SERVICE     = "c5f50001-8280-46da-89f4-6d8051e4aeef";
const PYBRICKS_TX          = "c5f50002-8280-46da-89f4-6d8051e4aeef"; // hub → browser
const PYBRICKS_RX          = "c5f50003-8280-46da-89f4-6d8051e4aeef"; // browser → hub
const LWP3_SERVICE         = "00001623-1212-efde-1623-785feabcd123";
const LWP3_CHAR            = "00001624-1212-efde-1623-785feabcd123";
const WEDO2_SERVICE        = "00001523-1212-efde-1523-785feabcd123"; // device service (advertised, used for filter)
const WEDO2_IO_SERVICE     = "00004f0e-1212-efde-1523-785feabcd123"; // IO service (holds output char)
const WEDO2_OUTPUT_CHAR    = "00001565-1212-efde-1523-785feabcd123"; // output command: motor (port 1/2) + LED (port 6)

const hubBle = {
  device: null,
  server: null,
  rxChar: null,     // write-to-hub
  txChar: null,     // notifications from hub
  mode: null,       // "pybricks" | "lwp3" | "wedo2" | null
  _onData: null,

  get connected() { return this.server !== null && this.server.connected; },

  async connect() {
    // Try Pybricks first, then LWP3 (hub gen 2+), then WeDo 2.0 native protocol
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: "Pybricks" },
        { namePrefix: "LEGO" },
        { namePrefix: "Technic" },
        { namePrefix: "LPF2 Smart Hub" },
        { namePrefix: "WeDo" },
        { services: [PYBRICKS_SERVICE] },
        { services: [LWP3_SERVICE] },
        { services: [WEDO2_SERVICE] }
      ],
      optionalServices: [PYBRICKS_SERVICE, LWP3_SERVICE, WEDO2_SERVICE, WEDO2_IO_SERVICE]
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

    // Try LEGO LWP3 (stock firmware — Hub gen 2, Technic Hub, City Hub, etc.)
    try {
      const svc   = await this.server.getPrimaryService(LWP3_SERVICE);
      this.rxChar = await svc.getCharacteristic(LWP3_CHAR);
      this.txChar = this.rxChar;
      await this.rxChar.startNotifications();
      this.rxChar.addEventListener("characteristicvaluechanged", (e) => {
        const bytes = new Uint8Array(e.target.value.buffer);
        if (this._onData) this._onData(`[LWP3] ${Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join(' ')}\n`);
      });
      this.mode = "lwp3";
      return;
    } catch (_) { /* not LWP3 — try WeDo 2.0 native */ }

    // Try WeDo 2.0 native protocol (advertised service 0x1523, output char in IO service 0x4f0e)
    try {
      const ioSvc = await this.server.getPrimaryService(WEDO2_IO_SERVICE);
      this.rxChar = await ioSvc.getCharacteristic(WEDO2_OUTPUT_CHAR);
      this.txChar = this.rxChar;
      this.mode = "wedo2";
      appendTerminal("[BLE] WeDo 2.0 native protocol connected (motor + LED ready).\n");
      return;
    } catch (_) { /* WeDo 2.0 service not found */ }

    throw new Error("Hub connected but no known service found. Supported: Pybricks, LEGO LWP3 (Hub gen 2+), WeDo 2.0 native.");
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

  /*
   * runPybricksCode — upload and execute a full Python program via Pybricks BLE REPL.
   * Sends Ctrl+C to interrupt, then pastes the code line by line.
   */
  async runPybricksCode(pythonSource) {
    if (this.mode !== "pybricks") throw new Error("Pybricks firmware required for BLE code upload.");
    // Interrupt running program
    await this.write("\x03\x03");
    await new Promise(r => setTimeout(r, 300));
    // Paste each line
    const lines = pythonSource.split("\n");
    for (const line of lines) {
      await this.write(line + "\r\n");
      await new Promise(r => setTimeout(r, 20));
    }
  },

  /*
   * sendLwp3Motor — send a minimal LWP3 motor output command to stock firmware.
   * port: 0x00=A, 0x01=B
   * power: -100..100 (signed)
   * This works on stock WeDo 2.0 / LEGO firmware without Pybricks.
   */
  async sendLwp3Motor(port, power) {
    if (this.mode === "wedo2") {
      // WeDo 2.0 native output command (4 bytes): [portId, 0x01 (motor power), 0x01 (len), power_byte]
      // port: 0x00=port1, 0x01=port2 → portId 1 or 2. Negative power wraps via two's complement.
      const p = Math.max(-100, Math.min(100, Math.round(power)));
      const portId = (port & 0xFF) + 1; // 0x00→1, 0x01→2
      await this.rxChar.writeValueWithResponse(new Uint8Array([portId, 0x01, 0x01, p & 0xFF]));
      return;
    }
    if (this.mode !== "lwp3") throw new Error("LWP3 mode required (stock firmware).");
    const p = Math.max(-100, Math.min(100, Math.round(power)));
    // LWP3 port output command: StartPower
    // [len, 0x00, 0x81, port, 0x11, 0x51, 0x00, power_int8]
    const msg = new Uint8Array([0x08, 0x00, 0x81, port & 0xFF, 0x11, 0x51, 0x00, p & 0xFF]);
    await this.rxChar.writeValueWithResponse(msg);
  },

  /*
   * sendLwp3Led — set the hub LED colour.
   * WeDo 2.0: writes [r, g, b] to the RGB LED characteristic.
   * LWP3: color index 0-9 to port 0x32.
   */
  async sendLwp3Led(color) {
    if (this.mode === "wedo2") {
      // WeDo 2.0 RGB LED = virtual port 6, indexed-color mode via output char:
      // [0x06 (port), 0x04 (write RGB/LED), 0x01 (len), colorIndex]
      const idx = Math.min(Math.max(color, 0), 10);
      await this.rxChar.writeValueWithResponse(new Uint8Array([0x06, 0x04, 0x01, idx]));
      return;
    }
    if (this.mode !== "lwp3") return;
    // Port 0x32 = hub LED
    const msg = new Uint8Array([0x08, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, color & 0xFF]);
    await this.rxChar.writeValueWithResponse(msg);
  },

  async disconnect() {
    try { if (this.txChar) await this.txChar.stopNotifications(); } catch (_) {}
    try { if (this.server && this.server.connected) this.server.disconnect(); } catch (_) {}
    this.device = null; this.server = null; this.rxChar = null; this.txChar = null;
    this.mode = null;
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

function portSummary(profile) {
  const ports = Object.values(profile?.ports || {});
  const motors = ports.filter(p => p.kind === "motor").length;
  const sensors = ports.filter(p => p.kind === "sensor").length;
  return `${motors} motors / ${sensors} sensors`;
}

function selectedTargetLabel() {
  const sel = el("targetSel");
  return sel?.selectedOptions?.[0]?.textContent || "No target";
}

function updateMissionStrip() {
  const profile = selectedProfile();
  const meta = GEN_META[profile?.family] || GEN_META["robot-inventor"];
  const robotEl = el("missionRobot");
  const kitEl = el("missionKit");
  const portsEl = el("missionPorts");
  const targetEl = el("missionTarget");
  const outputEl = el("missionOutput");
  if (robotEl) robotEl.textContent = profile?.name || "No robot selected";
  if (kitEl) kitEl.textContent = profile?.kit || "Select a robot profile";
  if (portsEl) portsEl.textContent = profile ? portSummary(profile) : "0 motors / 0 sensors";
  if (targetEl) targetEl.textContent = selectedTargetLabel();
  if (outputEl) outputEl.textContent = `.${meta.ext || "lms"}`;
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
  updateMissionStrip();
  // Show cross-gen note if available
  const noteEl = el("crossGenNote");
  if (noteEl) {
    noteEl.textContent = p && p.crossGenNotes ? `↔ ${p.crossGenNotes}` : "";
    noteEl.style.display = p && p.crossGenNotes ? "block" : "none";
  }
  updateHubPill();
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
    const isBle = (family === "robot-inventor" || family === "spike-prime" || family === "wedo2");
    connNote.style.display = isBle ? "none" : "block";
    connNote.textContent = isBle ? "" :
      `Note: ${(meta.label || family.toUpperCase())} hubs use USB or legacy Bluetooth (not Web Bluetooth). ` +
      `Generate and Download code here, then deploy with the appropriate desktop tool.`;
    if (family === "wedo2") {
      connNote.style.display = "block";
      connNote.textContent = "WeDo 2.0: Connect hub named \u2018LPF2 Smart Hub 2 I/O\u2019 via Bluetooth. " +
        "Use WeDo 2.0 App (MicroPython) target for the official app (available until July\u00a031\u00a02026), " +
        "or flash Pybricks firmware and use the Pybricks CityHub target for ongoing use.";
    }
  }
  updateMissionStrip();
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
    autofocus: false,
    extraKeys: {
      "Ctrl-Space": (cm) => { clearGhostText(); cm.showHint({ hint: mindstormsHint, completeSingle: false }); },
      "Tab": (cm) => {
        if (pendingCompletion && acceptGhostText()) return;
        cm.execCommand("indentMore");
      }
    },
    hintOptions: { hint: mindstormsHint, completeSingle: false, closeOnUnfocus: true }
  });
  editor.setSize("100%", "100%");

  // Dropdown on '.' or identifier chars (not on Tab — Tab accepts ghost text)
  editor.on("keyup", (cm, e) => {
    if (e.key === "Tab" || e.key === "Shift") return;
    if (ghostMark) return; // don't show dropdown while ghost is visible
    if (e.key === "." || (e.key.length === 1 && /[a-zA-Z_]/.test(e.key))) {
      if (!cm.state.completionActive) cm.showHint({ hint: mindstormsHint, completeSingle: false });
    }
  });

  // LLM inline suggestion on idle
  let llmTimer = null;
  editor.on("change", (cm, change) => {
    if (_ghosting || change.origin === "+ghost") return; // ignore ghost text mutations
    if (ghostMark) clearGhostText();
    clearTimeout(llmTimer);
    if (isBlocklyTarget() || !llm.url) return;
    llmTimer = setTimeout(async () => {
      const cur = cm.getCursor();
      const prefix = cm.getRange({ line: 0, ch: 0 }, cur);
      if (prefix.trim().length < 30) return;
      const suffix = cm.getRange(cur, { line: Math.min(cur.line + 5, cm.lastLine()), ch: 999 });
      const completion = await getLlmCompletion(prefix, suffix);
      if (completion && !ghostMark) showGhostText(completion);
    }, 900);
  });
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
  if (target === "blockly-python") {
    loadBlocklyIntent(profile, intent);
    setCodeStatus(`Loaded ${intent} blocks for ${profile.name}`);
    return;
  }
  const customCode = intent === "custom" ? editor.getValue() : null;
  const src = generateCode(profile, target, intent, customCode);
  editor.setValue(src);
  setCodeStatus(`Generated ${intent} for ${profile.name} (${target})`);
}

async function doGenerateFromServer() {
  if (!state.serverOk || isBlocklyTarget()) { doGenerate(); return; }
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
  if (isBlocklyTarget()) {
    const src = getBlocklyPython(profile);
    if (!src.trim()) { setCodeStatus("Generate blocks first, then download", true); return; }
    const baseName = profile ? `${profile.id}-blockly` : "blockly-program";
    const blob = new Blob([src], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${baseName}.py`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setCodeStatus(`Downloaded ${baseName}.py`);
    return;
  }
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
  const profile = selectedProfile();
  const src = isBlocklyTarget() ? getBlocklyPython(profile) : editor.getValue().trim();
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
  const bleConnected = hubBle.connected;
  const usbConnected = hubSerial.connected;

  if (bleConnected) {
    const modeLabel = hubBle.mode === "pybricks"
      ? "Pybricks BLE"
      : hubBle.mode === "wedo2"
        ? "WeDo 2.0 BLE"
        : "Stock BLE (LWP3)";
    const devName   = hubBle.device ? hubBle.device.name || "BLE Hub" : "BLE Hub";
    pill.textContent = `\u25CF ${devName} \u2014 ${modeLabel}`;
    pill.className   = "pill pill-on";
  } else if (usbConnected) {
    pill.textContent = "\u25CF hub connected (USB)";
    pill.className   = "pill pill-on";
  } else {
    pill.textContent = "\u25CF hub disconnected";
    pill.className   = "pill pill-off";
  }

  /* USB controls */
  el("runUsbBtn").disabled   = !usbConnected;
  el("sendReplBtn").disabled = !(usbConnected || bleConnected);
  el("disconnectBtn").disabled  = !usbConnected;
  el("connectBtn").disabled     = usbConnected;

  /* BLE controls */
  const bleConnectBtn    = el("bleConnectBtn");
  const bleDisconnectBtn = el("bleDisconnectBtn");
  const bleRunBtn        = el("bleRunBtn");
  const bleSendReplBtn   = el("bleSendReplBtn");
  const bleMotorTestBtn  = el("bleMotorTestBtn");
  if (bleConnectBtn)    bleConnectBtn.disabled    = bleConnected;
  if (bleDisconnectBtn) bleDisconnectBtn.disabled = !bleConnected;
  const isWeDo2Profile = !!(selectedProfile() && selectedProfile().family === "wedo2");
  const wedo2DirectBle = bleConnected && (hubBle.mode === "lwp3" || hubBle.mode === "wedo2") && isWeDo2Profile;
  if (bleRunBtn)        bleRunBtn.disabled        = !(bleConnected && (hubBle.mode === "pybricks" || wedo2DirectBle));
  const runBleInlineBtn = el("runBleInlineBtn");
  if (runBleInlineBtn)  runBleInlineBtn.disabled  = !(bleConnected && (hubBle.mode === "pybricks" || wedo2DirectBle));
  if (bleSendReplBtn)   bleSendReplBtn.disabled   = !(bleConnected && hubBle.mode === "pybricks");
  if (bleMotorTestBtn)  bleMotorTestBtn.disabled  = !wedo2DirectBle && !(bleConnected && hubBle.mode === "lwp3");

  /* Show/hide mode-specific rows */
  const bleInfo = el("bleInfo");
  if (bleInfo) {
    if (bleConnected) {
      if (hubBle.mode === "pybricks") {
        bleInfo.textContent = "\u2705 Pybricks firmware \u2014 full REPL available. Generate code and click \u201CRun via BLE\u201D.";
      } else if (hubBle.mode === "wedo2" && isWeDo2Profile && isBlocklyTarget()) {
        bleInfo.textContent = "\u2705 WeDo 2.0 native BLE connected. Blockly blocks execute directly as motor/LED commands. Click \u201CRun via BLE\u201D.";
      } else if (hubBle.mode === "wedo2") {
        bleInfo.textContent = "\u2705 WeDo 2.0 native BLE connected. Click \u201CRun via BLE\u201D to run the selected safe intent directly. Python upload requires Pybricks firmware.";
      } else if (isWeDo2Profile && isBlocklyTarget()) {
        bleInfo.textContent = "\u2705 WeDo 2.0 stock firmware (LWP3) \u2014 Blockly blocks will execute directly over BLE. Click \u201CRun via BLE\u201D.";
      } else if (isWeDo2Profile) {
        bleInfo.textContent = "\u2705 WeDo 2.0 stock BLE connected. Click \u201CRun via BLE\u201D to run the selected safe intent directly. Python upload requires Pybricks firmware.";
      } else {
        bleInfo.textContent = "\u26A0\uFE0F Stock LEGO firmware (LWP3). Select a WeDo 2.0 profile + Blockly target to run blocks directly, or flash Pybricks at code.pybricks.com for Python code execution.";
      }
    } else {
      bleInfo.textContent = "";
    }
  }
}

/* ── BLE connect / disconnect ─────────────────────────────────────────────── */

async function doBleConnect() {
  el("bleError")?.classList.add("hidden");
  try {
    appendTerminal("[BLE] Scanning for hub...\n");
    await hubBle.connect();
    hubBle._onData = txt => appendTerminal("[BLE] " + txt);
    const devName = hubBle.device?.name || "Unknown";
    appendTerminal(`[BLE] Connected to "${devName}" (mode: ${hubBle.mode})\n`);
    updateHubPill();
  } catch (err) {
    const msg = err.name === "NotFoundError" ? "No device selected — make sure the hub is on and in range." : err.message;
    appendTerminal(`[BLE] Connect failed: ${msg}\n`);
    const div = el("bleError");
    if (div) { div.textContent = msg; div.classList.remove("hidden"); }
  }
}

async function doBleDisconnect() {
  await hubBle.disconnect();
  appendTerminal("[BLE] Disconnected.\n");
  updateHubPill();
}

/* ── BLE run / REPL ───────────────────────────────────────────────────────── */

async function doRunViaBle() {
  if (!hubBle.connected) { appendTerminal("[BLE] Not connected.\n"); return; }
  const profile = selectedProfile();
  // WeDo 2.0 stock/native BLE cannot upload Python. Run safe direct commands instead.
  if ((hubBle.mode === "wedo2" || hubBle.mode === "lwp3") && profile && profile.family === "wedo2") {
    if (isBlocklyTarget()) await executeWeDo2BlocklyViaBle(profile);
    else {
      const source = editor ? editor.getValue() : "";
      await executeWeDo2CodeViaBle(profile, source, el("intentSel")?.value || "safe_probe");
    }
    return;
  }
  if (hubBle.mode !== "pybricks") {
    appendTerminal("[BLE] Error: Pybricks firmware required for Python code upload.\n"); return;
  }
  const src = isBlocklyTarget() ? getBlocklyPython(profile) : el("editorArea") && CodeMirror ? el("editorArea").nextSibling?.CodeMirror?.getValue() || "" : "";
  const code = src || (editor ? editor.getValue() : "");
  if (!code.trim()) { appendTerminal("[BLE] Nothing to run — generate code first.\n"); return; }
  try {
    appendTerminal("[BLE] Uploading program...\n");
    await hubBle.runPybricksCode(code);
    appendTerminal("[BLE] Program sent.\n");
  } catch (err) {
    appendTerminal(`[BLE] Run failed: ${err.message}\n`);
  }
}

async function executeWeDo2CodeViaBle(profile, source, fallbackIntent) {
  if (!source.trim()) {
    await executeWeDo2IntentViaBle(profile, fallbackIntent);
    return;
  }

  const delay = ms => new Promise(r => setTimeout(r, ms));
  const portNum = p => String(p || "A").toUpperCase() === "B" ? 0x01 : 0x00;
  const motorVars = new Map();
  const constants = new Map();

  for (const [port, p] of Object.entries(profile.ports || {})) {
    if (p.kind === "motor") motorVars.set(toVarName(p.role), port.toUpperCase());
  }

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    let m = line.match(/^([A-Za-z_]\w*)\s*=\s*hub\.port\.([AB])\.motor\b/i);
    if (m) motorVars.set(m[1], m[2].toUpperCase());
    m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?)/);
    if (m) constants.set(m[1], Number(m[2]));
  }

  function numberValue(expr, fallback = 0) {
    const text = String(expr || "").trim();
    if (constants.has(text)) return constants.get(text);
    const n = Number(text.replace(/['"]/g, ""));
    return Number.isFinite(n) ? n : fallback;
  }

  function clampSpeed(value) {
    return Math.max(-50, Math.min(50, Math.round(value)));
  }

  function clampSeconds(value) {
    return Math.max(0, Math.min(2, Number(value) || 0));
  }

  function parseArgs(argText) {
    const args = {};
    const positional = [];
    for (const part of String(argText || "").split(",")) {
      const piece = part.trim();
      if (!piece) continue;
      const eq = piece.indexOf("=");
      if (eq > 0) args[piece.slice(0, eq).trim()] = piece.slice(eq + 1).trim();
      else positional.push(piece);
    }
    return { args, positional };
  }

  function indentation(line) {
    const m = line.match(/^\s*/);
    return m ? m[0].replace(/\t/g, "    ").length : 0;
  }

  async function stopAll() {
    const ports = new Set(motorVars.values());
    if (!ports.size) { ports.add("A"); ports.add("B"); }
    for (const port of ports) await hubBle.sendLwp3Motor(portNum(port), 0);
  }

  async function runLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return true;
    if (/^(import|from)\b/.test(trimmed)) return true;
    if (/^print\s*\(/.test(trimmed)) return true;
    if (/^[A-Za-z_]\w*\s*=\s*hub\.port\.[AB]\.motor\b/i.test(trimmed)) return true;
    if (/^[A-Za-z_]\w*\s*=\s*hub\.port\.[AB]\.device\b/i.test(trimmed)) return true;
    if (/^[A-Z_][A-Z0-9_]*\s*=/.test(trimmed)) return true;

    let m = trimmed.match(/^hub\.led\(([^)]+)\)/);
    if (m) {
      await hubBle.sendLwp3Led(Math.max(0, Math.min(10, Math.round(numberValue(m[1], 0)))));
      return true;
    }

    if (/^hub\.sound\.beep\(\)/.test(trimmed)) {
      await hubBle.sendLwp3Led(6);
      await delay(150);
      await hubBle.sendLwp3Led(0);
      return true;
    }

    m = trimmed.match(/^time\.sleep\(([^)]+)\)/);
    if (m) {
      await delay(Math.round(clampSeconds(numberValue(m[1], 0)) * 1000));
      return true;
    }

    m = trimmed.match(/^([A-Za-z_]\w*)\.run_for_seconds\(([^)]*)\)/);
    if (m) {
      const port = motorVars.get(m[1]);
      if (!port) throw new Error(`Unknown WeDo motor variable: ${m[1]}`);
      const parsed = parseArgs(m[2]);
      const speedExpr = parsed.args.speed ?? parsed.positional[0] ?? "35";
      const secondsExpr = parsed.args.seconds ?? parsed.positional[1] ?? "1";
      const speed = clampSpeed(numberValue(speedExpr, 35));
      const seconds = clampSeconds(numberValue(secondsExpr, 1));
      await hubBle.sendLwp3Motor(portNum(port), speed);
      await delay(Math.round(seconds * 1000));
      await hubBle.sendLwp3Motor(portNum(port), 0);
      return true;
    }

    m = trimmed.match(/^([A-Za-z_]\w*)\.start\(([^)]*)\)/);
    if (m) {
      const port = motorVars.get(m[1]);
      if (!port) throw new Error(`Unknown WeDo motor variable: ${m[1]}`);
      const parsed = parseArgs(m[2]);
      const speed = clampSpeed(numberValue(parsed.args.speed ?? parsed.positional[0] ?? "35", 35));
      await hubBle.sendLwp3Motor(portNum(port), speed);
      return true;
    }

    m = trimmed.match(/^([A-Za-z_]\w*)\.stop\(\)/);
    if (m) {
      const port = motorVars.get(m[1]);
      if (!port) throw new Error(`Unknown WeDo motor variable: ${m[1]}`);
      await hubBle.sendLwp3Motor(portNum(port), 0);
      return true;
    }

    return false;
  }

  async function runBlock(lines, start = 0, baseIndent = 0) {
    for (let i = start; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();
      if (!line) continue;
      const indent = indentation(raw);
      if (indent < baseIndent) return i - 1;
      const loop = line.match(/^for\s+.+\s+in\s+range\((\d+)\):/);
      if (loop) {
        const body = [];
        for (i = i + 1; i < lines.length; i++) {
          if (lines[i].trim() && indentation(lines[i]) <= indent) { i--; break; }
          body.push(lines[i]);
        }
        const count = Math.max(0, Math.min(5, parseInt(loop[1], 10)));
        for (let n = 0; n < count; n++) await runBlock(body, 0, indent + 1);
        continue;
      }
      const ok = await runLine(raw);
      if (!ok) throw new Error(`Unsupported WeDo direct command: ${line}`);
    }
    return lines.length - 1;
  }

  try {
    appendTerminal("[BLE] Running edited WeDo code as direct BLE commands.\n");
    await runBlock(source.split(/\r?\n/));
    await stopAll();
    appendTerminal("[BLE] Edited WeDo code complete.\n");
  } catch (err) {
    try { await stopAll(); } catch (_) {}
    appendTerminal(`[BLE] WeDo direct run stopped: ${err.message}\n`);
    appendTerminal("[BLE] Supported on stock WeDo BLE: hub.led(...), time.sleep(...), motor.start(...), motor.stop(), motor.run_for_seconds(...), and simple for range loops. Full Python upload requires Pybricks.\n");
  }
}

async function executeWeDo2IntentViaBle(profile, intent) {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const motorPorts = Object.entries(profile.ports || {})
    .filter(([, p]) => p.kind === "motor")
    .map(([port]) => port);
  const firstMotor = motorPorts[0] || "A";
  const portNum = p => p === "B" ? 0x01 : 0x00;

  async function stopAll() {
    for (const port of motorPorts.length ? motorPorts : ["A", "B"]) {
      await hubBle.sendLwp3Motor(portNum(port), 0);
    }
  }

  try {
    appendTerminal(`[BLE] Running WeDo 2.0 ${intent} with direct BLE commands.\n`);
    await hubBle.sendLwp3Led(6);

    if (intent === "beep_hello") {
      appendTerminal("[BLE] WeDo hub has no speaker; flashing hub light instead.\n");
      for (const color of [6, 3, 9, 0]) {
        await hubBle.sendLwp3Led(color);
        await delay(250);
      }
    } else if (intent === "drive_forward") {
      for (const port of motorPorts.length ? motorPorts : [firstMotor]) {
        await hubBle.sendLwp3Motor(portNum(port), 40);
      }
      await delay(1000);
      await stopAll();
    } else if (intent === "wave") {
      await hubBle.sendLwp3Motor(portNum(firstMotor), 45);
      await delay(450);
      await hubBle.sendLwp3Motor(portNum(firstMotor), -45);
      await delay(450);
      await hubBle.sendLwp3Motor(portNum(firstMotor), 0);
    } else {
      await hubBle.sendLwp3Motor(portNum(firstMotor), 35);
      await delay(500);
      await hubBle.sendLwp3Motor(portNum(firstMotor), -35);
      await delay(500);
      await hubBle.sendLwp3Motor(portNum(firstMotor), 0);
    }

    await hubBle.sendLwp3Led(0);
    appendTerminal("[BLE] WeDo 2.0 direct run complete.\n");
  } catch (err) {
    try { await stopAll(); } catch (_) {}
    appendTerminal(`[BLE] WeDo 2.0 direct run failed: ${err.message}\n`);
  }
}

/*
 * executeWeDo2BlocklyViaBle — walk the WeDo 2.0 Blockly workspace and execute
 * each block as a direct LWP3 command over BLE. Works with stock hub firmware.
 */
async function executeWeDo2BlocklyViaBle(profile) {
  if (!blocklyWorkspace || !window.Blockly) {
    appendTerminal("[BLE] Open Blockly editor first.\n"); return;
  }
  const portNum = p => p === "B" ? 0x01 : 0x00;
  const delay = ms => new Promise(r => setTimeout(r, ms));

  // Collect top-level statement blocks in order
  const topBlocks = blocklyWorkspace.getTopBlocks(true)
    .filter(b => b.previousConnection === null);

  if (!topBlocks.length) {
    appendTerminal("[BLE] No blocks to run.\n"); return;
  }

  appendTerminal("[BLE] Running WeDo 2.0 Blockly program over LWP3...\n");

  // Walk the linked list starting from each top block
  async function runChain(block) {
    let b = block;
    while (b) {
      const type = b.type;
      try {
        if (type === "wd_led") {
          const color = parseInt(b.getFieldValue("COLOR") || "0", 10);
          await hubBle.sendLwp3Led(color);
          appendTerminal(`[BLE] LED → color ${color}\n`);

        } else if (type === "wd_motor_run") {
          const port  = b.getFieldValue("PORT") || "A";
          const speed = parseInt(b.getFieldValue("SPEED") || "50", 10);
          const secs  = parseFloat(b.getFieldValue("SECS") || "1");
          await hubBle.sendLwp3Motor(portNum(port), speed);
          appendTerminal(`[BLE] Motor ${port} run ${speed}% for ${secs}s\n`);
          await delay(Math.round(secs * 1000));
          await hubBle.sendLwp3Motor(portNum(port), 0);

        } else if (type === "wd_motor_start") {
          const port  = b.getFieldValue("PORT") || "A";
          const speed = parseInt(b.getFieldValue("SPEED") || "50", 10);
          await hubBle.sendLwp3Motor(portNum(port), speed);
          appendTerminal(`[BLE] Motor ${port} start ${speed}%\n`);

        } else if (type === "wd_motor_stop") {
          const port = b.getFieldValue("PORT") || "A";
          await hubBle.sendLwp3Motor(portNum(port), 0);
          appendTerminal(`[BLE] Motor ${port} stop\n`);

        } else if (type === "wd_wait") {
          const secs = parseFloat(b.getFieldValue("SECS") || "1");
          appendTerminal(`[BLE] Wait ${secs}s\n`);
          await delay(Math.round(secs * 1000));

        } else if (type === "wd_print") {
          const text = b.getFieldValue("TEXT") || "";
          appendTerminal(`[BLE] Print: ${text}\n`);

        } else if (type === "wd_wait_motion") {
          // Can't poll sensor from browser over LWP3 without notification setup — just wait 2s
          appendTerminal("[BLE] wait_motion — waiting 2s (sensor polling not available on stock firmware)\n");
          await delay(2000);
        }
        // sensor output blocks (wd_motion_distance, wd_motion_detected, wd_tilt_angle)
        // are value blocks — they appear as inputs, not statement chains, so skip here
      } catch (err) {
        appendTerminal(`[BLE] Block error (${type}): ${err.message}\n`);
      }
      b = b.getNextBlock ? b.getNextBlock() : null;
    }
  }

  try {
    for (const top of topBlocks) { await runChain(top); }
    appendTerminal("[BLE] Done.\n");
  } catch (err) {
    appendTerminal(`[BLE] Program error: ${err.message}\n`);
  }
}

async function doBleSendRepl() {
  const line = el("terminalInput")?.value?.trim();
  if (!line) return;
  appendTerminal(`> ${line}\n`);
  try {
    if (hubBle.connected && hubBle.mode === "pybricks") {
      await hubBle.sendRepl(line);
    } else if (hubSerial.connected) {
      const out = await hubSerial.sendRepl(line);
      appendTerminal(out);
    } else {
      appendTerminal("[BLE] Not connected.\n");
    }
  } catch (err) {
    appendTerminal(`Error: ${err.message}\n`);
  }
}

async function doBleMotorTest() {
  if (!hubBle.connected || (hubBle.mode !== "lwp3" && hubBle.mode !== "wedo2")) {
    appendTerminal("[BLE] Stock firmware (LWP3 or WeDo 2.0 native) required for motor test.\n"); return;
  }
  appendTerminal("[BLE] Motor test: Port A forward 1s...\n");
  try {
    await hubBle.sendLwp3Led(6);           // green
    await hubBle.sendLwp3Motor(0x00,  60); // Port A forward
    await new Promise(r => setTimeout(r, 1000));
    await hubBle.sendLwp3Motor(0x00,   0); // stop
    await hubBle.sendLwp3Led(0);           // off
    appendTerminal("[BLE] Motor test done.\n");
  } catch (err) {
    appendTerminal(`[BLE] Motor test failed: ${err.message}\n`);
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
    if (hubBle.connected && hubBle.mode === "pybricks") {
      await hubBle.sendRepl(line);
    } else {
      const out = await hubSerial.sendRepl(line);
      appendTerminal(out);
    }
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

// ─── RCX IR Transport ────────────────────────────────────────────────────────

class RcxTransport {
  constructor() { this.port = null; this.writer = null; this.readBuf = []; this._reading = false; }

  async connect() {
    this.port = await navigator.serial.requestPort({ filters: [] });
    await this.port.open({ baudRate: 2400, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
    this.writer = this.port.writable.getWriter();
    this._reading = true;
    this._readLoop();
  }

  async _readLoop() {
    const reader = this.port.readable.getReader();
    try {
      while (this._reading) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const b of value) this.readBuf.push(b);
      }
    } catch {} finally { reader.releaseLock(); }
  }

  async _readByte(ms = 200) {
    const t = Date.now() + ms;
    while (Date.now() < t) {
      if (this.readBuf.length) return this.readBuf.shift();
      await new Promise(r => setTimeout(r, 5));
    }
    return null;
  }

  // Frames cmdBytes with RCX preamble + complement-encoded bytes, drains echo, returns reply.
  async sendMessage(cmdBytes) {
    this.readBuf = [];
    let sum = 0;
    for (const b of cmdBytes) sum = (sum + b) & 0xFF;
    const msg = [0x55, 0xFF, 0x00];
    for (const b of cmdBytes) { msg.push(b, (~b) & 0xFF); }
    msg.push(sum, (~sum) & 0xFF);
    await this.writer.write(new Uint8Array(msg));
    // Drain echoed bytes (half-duplex: tower reflects every sent byte)
    for (let i = 0; i < msg.length; i++) await this._readByte(30);
    return this._readReply();
  }

  async _readReply() {
    let state = 0; const data = [];
    const deadline = Date.now() + 600;
    while (Date.now() < deadline) {
      const b = await this._readByte(30);
      if (b === null) continue;
      if (state === 0 && b === 0x55) { state = 1; continue; }
      if (state === 1 && b === 0xFF) { state = 2; continue; }
      if (state === 2 && b === 0x00) { state = 3; continue; }
      if (state === 3) {
        const c = await this._readByte(30);
        if (c !== null && (b ^ c) === 0xFF) { data.push(b); } else break;
      }
    }
    return data;
  }

  async ping()  { try { const r = await this.sendMessage([0x10]); return r[0] === 0x10; } catch { return false; } }
  async beep(id = 1) { await this.sendMessage([0x51, id & 7]); }
  async stopAll() { await this.sendMessage([0x21, 0x07, 0x00]); }

  // port: 'A'|'B'|'C'  dir: 'forward'|'backward'|'stop'  pwr100: 0-100
  async setMotor(port, dir, pwr100) {
    const mask = port === "A" ? 1 : port === "B" ? 2 : 4;
    const p    = Math.max(0, Math.min(7, Math.round(pwr100 / 100 * 7)));
    if (dir === "stop") {
      await this.sendMessage([0x21, mask, 0x00]);
    } else {
      const d = dir === "forward" ? 0x02 : 0x00;
      await this.sendMessage([0xE1, mask, d]);       // SetOutputDirection
      await this.sendMessage([0xD1, mask, 0x02, p]); // SetOutputPower (src=const)
      await this.sendMessage([0x21, mask, 0x01]);    // SetOutputMode = on
    }
  }

  async disconnect() {
    this._reading = false;
    try { await this.writer?.close(); } catch {}
    try { await this.port?.close(); } catch {}
    this.port = null; this.writer = null;
  }
  get connected() { return !!this.port; }
}

const rcxTransport = new RcxTransport();

function updateRcxUi() {
  const ok = rcxTransport.connected;
  el("rcxConnectBtn").disabled = ok;
  el("rcxDisconnectBtn").disabled = !ok;
  el("rcxPingBtn").disabled = !ok;
  el("rcxBeepBtn").disabled = !ok;
  el("rcxStopAllBtn").disabled = !ok;
  el("rcxControls").style.display = ok ? "grid" : "none";
}

async function doRcxConnect() {
  if (!navigator.serial) { el("rcxStatus").textContent = "Web Serial not supported — use Chrome or Edge"; return; }
  try {
    el("rcxStatus").textContent = "Selecting COM port…";
    await rcxTransport.connect();
    updateRcxUi();
    el("rcxStatus").textContent = "Port open — pinging RCX…";
    const alive = await rcxTransport.ping();
    el("rcxStatus").textContent = alive
      ? "RCX alive ✓ — ready to control"
      : "Port open but no ping reply. Check: RCX on, batteries OK, tower aimed at IR window.";
  } catch (e) { el("rcxStatus").textContent = `Connect failed: ${e.message}`; updateRcxUi(); }
}

async function doRcxDisconnect() {
  await rcxTransport.disconnect();
  updateRcxUi();
  el("rcxStatus").textContent = "";
}

async function doRcxPing() {
  el("rcxStatus").textContent = "Pinging…";
  const ok = await rcxTransport.ping();
  el("rcxStatus").textContent = ok ? "Ping OK — RCX alive ✓" : "No reply — aim tower at RCX IR window";
}

async function doRcxBeep()    { try { await rcxTransport.beep(1); } catch (e) { el("rcxStatus").textContent = e.message; } }
async function doRcxStopAll() {
  try { await rcxTransport.stopAll(); el("rcxStatus").textContent = "All motors stopped"; }
  catch (e) { el("rcxStatus").textContent = e.message; }
}
async function doRcxMotor(port, dir, power) {
  try { await rcxTransport.setMotor(port, dir, power); el("rcxStatus").textContent = `Motor ${port}: ${dir} @ ${power}%`; }
  catch (e) { el("rcxStatus").textContent = e.message; }
}

// ─── Tab switching ────────────────────────────────────────────────────────────

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.toggle("hidden", p.id !== `tab-${name}`);
  });
  if (name === "code") {
    if (isBlocklyTarget() && blocklyWorkspace) requestAnimationFrame(() => Blockly.svgResize(blocklyWorkspace));
    else if (editor) editor.refresh();
  }
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

  // Settings drawer
  const settingsBtn   = el("settingsBtn");
  const settingsDrawer = el("settingsDrawer");
  const settingsBackdrop = el("settingsBackdrop");
  function openSettings() {
    settingsDrawer.classList.remove("hidden");
    settingsBackdrop.classList.remove("hidden");
  }
  function closeSettings() {
    settingsDrawer.classList.add("hidden");
    settingsBackdrop.classList.add("hidden");
  }
  settingsBtn?.addEventListener("click", openSettings);
  el("aiSettingsShortcut")?.addEventListener("click", openSettings);
  el("settingsCloseBtn")?.addEventListener("click", closeSettings);
  settingsBackdrop?.addEventListener("click", closeSettings);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !settingsDrawer.classList.contains("hidden")) closeSettings();
  });

  // Sidebar collapse toggle
  const fleetSidebar = el("fleetSidebar");
  el("sidebarToggle")?.addEventListener("click", () => {
    fleetSidebar.classList.toggle("collapsed");
    const isCollapsed = fleetSidebar.classList.contains("collapsed");
    el("sidebarToggle").title = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
    // Trigger Blockly resize if needed
    if (isBlocklyTarget() && blocklyWorkspace)
      setTimeout(() => Blockly.svgResize(blocklyWorkspace), 250);
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
  el("targetSel").addEventListener("change", async () => {
    el("intentSel").disabled = false;
    if (isBlocklyTarget()) {
      await showBlocklyEditor();
    } else {
      showTextEditor();
      const family = selectedProfile()?.family || "robot-inventor";
      const meta = GEN_META[family] || GEN_META["robot-inventor"];
      el("downloadLmsBtn").textContent = `\u2193 ${meta.extLabel}`;
    }
    updateMissionStrip();
    updateHubPill();
  });

  // When intent changes while in Blockly mode, auto-reload blocks
  el("intentSel").addEventListener("change", () => {
    if (!isBlocklyTarget() || !blocklyWorkspace) return;
    const profile = selectedProfile();
    const intent  = el("intentSel").value;
    if (profile && intent !== "custom") {
      loadBlocklyIntent(profile, intent);
      setCodeStatus(`Loaded "${intent}" blocks for ${profile.name}`);
    }
  });

  // Builder tab
  el("startBuilderBtn").addEventListener("click", doStartBuilder);
  el("observeBtn").addEventListener("click", doObserve);
  el("handoffBtn").addEventListener("click", doHandoff);
  el("summaryBtn").addEventListener("click", doSummarize);

  // Connect tab — BLE
  el("bleConnectBtn")?.addEventListener("click", doBleConnect);
  el("bleDisconnectBtn")?.addEventListener("click", doBleDisconnect);
  el("bleRunBtn")?.addEventListener("click", doRunViaBle);
  el("runBleInlineBtn")?.addEventListener("click", doRunViaBle);
  el("bleSendReplBtn")?.addEventListener("click", doBleSendRepl);
  el("bleMotorTestBtn")?.addEventListener("click", doBleMotorTest);

  // Connect tab — USB
  el("connectBtn").addEventListener("click", doConnect);
  el("disconnectBtn").addEventListener("click", doDisconnect);
  el("sendReplBtn").addEventListener("click", doSendRepl);
  el("clearTermBtn").addEventListener("click", () => { el("terminalOutput").textContent = ""; });
  el("lmsFileInput").addEventListener("change", e => {
    if (e.target.files[0]) doReadLmsFile(e.target.files[0]);
  });

  // Fleet sidebar
  el("loadServerBtn").addEventListener("click", doLoadServerProfiles);

  // RCX IR Tower
  el("rcxConnectBtn").addEventListener("click", doRcxConnect);
  el("rcxDisconnectBtn").addEventListener("click", doRcxDisconnect);
  el("rcxPingBtn").addEventListener("click", doRcxPing);
  el("rcxBeepBtn").addEventListener("click", doRcxBeep);
  el("rcxStopAllBtn").addEventListener("click", doRcxStopAll);
  document.querySelectorAll(".rcx-dir-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const panel = e.target.closest(".rcx-motor-panel");
      if (!panel) return;
      const power = parseInt(panel.querySelector(".rcx-power-slider").value, 10);
      doRcxMotor(panel.dataset.motor, btn.dataset.dir, power);
    });
  });

  // AI completions
  el("aiDetectBtn")?.addEventListener("click", detectLlm);

  // Custom Blockly blocks modal
  el("customBlockBtn").addEventListener("click", openCustomBlockModal);
  el("cbCloseBtn").addEventListener("click", closeCustomBlockModal);
  el("cbSaveBtn").addEventListener("click", saveCbBlock);
  el("cbAddInputBtn").addEventListener("click", addCbInputRow);
  el("customBlockModal").addEventListener("click", e => {
    if (e.target === el("customBlockModal")) closeCustomBlockModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && el("customBlockModal").style.display !== "none") closeCustomBlockModal();
  });

  // Blockly resize on window resize
  window.addEventListener("resize", () => {
    if (blocklyWorkspace && el("blocklyDiv").style.display !== "none")
      requestAnimationFrame(() => Blockly.svgResize(blocklyWorkspace));
  });

  updateHubPill();
});
