#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const androidProject =
  process.env.MINDSTORMS_ANDROID_PROJECT ||
  process.env.MINDSTORMS_ANDROID_APP_DIR ||
  "";
const targetDocs = path.join(androidProject, "docs");

const designSource = path.join(repoRoot, "docs", "ANDROID_BUILDER_DESIGN.md");
const designTarget = path.join(targetDocs, "BUILDER_SESSION_DESIGN.md");

const markerStart = "<!-- MINDSTORMS_BUILDER_DESIGN_START -->";
const markerEnd = "<!-- MINDSTORMS_BUILDER_DESIGN_END -->";

function upsertSection(filePath, section) {
  if (!fs.existsSync(filePath)) return false;
  const current = fs.readFileSync(filePath, "utf8");
  const start = current.indexOf(markerStart);
  const end = current.indexOf(markerEnd);
  let next;

  if (start >= 0 && end > start) {
    next = `${current.slice(0, start)}${section}${current.slice(end + markerEnd.length)}`;
  } else {
    next = `${current.trimEnd()}\n\n${section}\n`;
  }

  fs.writeFileSync(filePath, next);
  return true;
}

function main() {
  if (!fs.existsSync(androidProject)) {
    throw new Error("Android project not found. Set MINDSTORMS_ANDROID_PROJECT or MINDSTORMS_ANDROID_APP_DIR.");
  }
  fs.mkdirSync(targetDocs, { recursive: true });
  fs.copyFileSync(designSource, designTarget);

  const section = `${markerStart}
## Builder Session Design Update

Use \`docs\\BUILDER_SESSION_DESIGN.md\` as the current Android design target.

Immediate build order:

1. Keep the 51515 fleet/profile browser working.
2. Make Builder Session the primary workflow after profile selection.
3. Add a fake MCP client and tests before BLE.
4. Add Probe Runner as a secondary simulated workflow.
5. Keep official LEGO client handoff available until direct hub control is reliable.

Repo reference:

\`\`\`text
Run this script from the MCP repo root, or set MINDSTORMS_MCP_REPO_DIR in local automation.
\`\`\`
${markerEnd}`;

  const updated = [];
  for (const fileName of ["GEMINI.md", "AGENTS.md", "README.md"]) {
    const filePath = path.join(androidProject, fileName);
    if (upsertSection(filePath, section)) updated.push(filePath);
  }

  console.log(JSON.stringify({
    ok: true,
    androidProject,
    designTarget,
    updated
  }, null, 2));
}

main();
