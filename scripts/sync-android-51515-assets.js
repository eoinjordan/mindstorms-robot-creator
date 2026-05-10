#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PROFILE_DIR = path.join(ROOT, "examples", "profiles", "51515");
const OUT = path.join(
  ROOT,
  "android",
  "robot-inventor-app",
  "app",
  "src",
  "main",
  "assets",
  "robot_profiles_51515.json"
);
const ANDROID_STUDIO_PROJECT =
  process.env.MINDSTORMS_ANDROID_PROJECT ||
  process.env.MINDSTORMS_ANDROID_APP_DIR ||
  "";
const ANDROID_STUDIO_OUT = path.join(
  ANDROID_STUDIO_PROJECT,
  "app",
  "src",
  "main",
  "assets",
  "robot_profiles_51515.json"
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function portList(profile) {
  return Object.entries(profile.ports || {}).map(([port, value]) => ({
    port,
    type: value.kind,
    role: value.role
  }));
}

function confidence(profile) {
  if (profile.needsConfirmation) return "needs-confirmation";
  return profile.source?.portMap || "unknown";
}

const profiles = fs.readdirSync(PROFILE_DIR)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => readJson(path.join(PROFILE_DIR, name)))
  .map((profile) => ({
    id: profile.id,
    name: profile.name,
    kind: profile.robotKind,
    source: [
      profile.source?.portMap,
      profile.source?.manual
    ].filter(Boolean).join(" + "),
    confidence: confidence(profile),
    ports: portList(profile)
  }));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(profiles, null, 2)}\n`);
console.log(path.relative(ROOT, OUT));

if (ANDROID_STUDIO_PROJECT && fs.existsSync(ANDROID_STUDIO_PROJECT)) {
  fs.mkdirSync(path.dirname(ANDROID_STUDIO_OUT), { recursive: true });
  fs.writeFileSync(ANDROID_STUDIO_OUT, `${JSON.stringify(profiles, null, 2)}\n`);
  console.log(ANDROID_STUDIO_OUT);
}
