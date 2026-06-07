#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const { ACTIONS, createServer, handleAction } = require("./server");

const HELP = `lego-mindstorms-mcp CLI

Usage:
  node cli.js <command> [args] [flags]

Core:
  actions
  run <action> --set profileId=51515-blast
  scan
  describe <profileId>

Probe and data:
  probe-plan <profileId> [--duty 20] [--sample-rate 50]
  probe-run <profileId> [--label label]
  classify --session-path <file>
  export --session-path <file> [--format jsonl|json|csv|edge-impulse-json] [--save]

Official LEGO client:
  client-status
  handoff <profileId> [--goal "run a first safe movement test"] [--client robot-inventor-51515]

Human-in-the-loop builder:
  builder start <profileId> --goal "make Blast wave safely" [--audience kid] [--session-id id]
  builder append <sessionId> --type observation --text "The right motor did not move."
  builder observe <sessionId> "The right motor did not move."
  builder summary <sessionId>

Server:
  server [--host 127.0.0.1] [--port 3095]

Flags:
  --params <json>        Merge JSON params into the selected action.
  --params-file <file>   Merge JSON params from a file.
  --set key=value        Merge one top-level or dotted param. Can be repeated.
  --stdin                Merge JSON params from stdin.
  --plain                Print a compact human-readable summary.
  --human                Alias for --plain.
  --compact              Print compact JSON instead of pretty JSON.
  --help                 Show this help.
`;

function parseArgv(argv) {
  const args = [];
  const flags = {};
  const booleanFlags = new Set(["compact", "help", "human", "plain", "save", "stdin"]);

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--") {
      args.push(...argv.slice(index + 1));
      break;
    }
    if (!token.startsWith("--")) {
      args.push(token);
      continue;
    }

    const raw = token.slice(2);
    const eqIndex = raw.indexOf("=");
    let key;
    let value;
    if (eqIndex >= 0) {
      key = raw.slice(0, eqIndex);
      value = raw.slice(eqIndex + 1);
    } else {
      key = raw;
      if (booleanFlags.has(key)) {
        value = true;
      } else if (index + 1 < argv.length && !argv[index + 1].startsWith("--")) {
        value = argv[index + 1];
        index += 1;
      } else {
        value = true;
      }
    }

    if (flags[key] === undefined) {
      flags[key] = value;
    } else if (Array.isArray(flags[key])) {
      flags[key].push(value);
    } else {
      flags[key] = [flags[key], value];
    }
  }

  return { args, flags };
}

function flag(flags, ...names) {
  for (const name of names) {
    if (flags[name] !== undefined) return flags[name];
  }
  return undefined;
}

function boolFlag(flags, ...names) {
  const value = flag(flags, ...names);
  return value === true || value === "true" || value === "1";
}

function numberFlag(flags, fallback, ...names) {
  const value = flag(flags, ...names);
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`expected number for --${names[0]}`);
  return number;
}

function requireValue(value, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${label} is required`);
  }
  return String(value);
}

function parseJsonText(text, label) {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`invalid JSON in ${label}: ${err.message}`);
  }
}

function readJsonFile(filePath) {
  const absolute = path.resolve(filePath);
  return parseJsonText(fs.readFileSync(absolute, "utf8"), absolute);
}

function parseSetValue(raw) {
  const text = String(raw);
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (/^[{["]/.test(text)) {
    try {
      return JSON.parse(text);
    } catch (_err) {
      return text;
    }
  }
  return text;
}

function setParam(target, key, value) {
  const parts = String(key).split(".").filter(Boolean);
  if (parts.length === 0) throw new Error("invalid --set key");
  let cursor = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}

function mergeSetParams(params, setValues) {
  const merged = { ...params };
  const values = Array.isArray(setValues) ? setValues : setValues === undefined ? [] : [setValues];
  for (const item of values) {
    const text = String(item);
    const eqIndex = text.indexOf("=");
    if (eqIndex <= 0) throw new Error(`invalid --set value: ${text}`);
    const key = text.slice(0, eqIndex);
    const value = parseSetValue(text.slice(eqIndex + 1));
    setParam(merged, key, value);
  }
  return merged;
}

function mergeExtraParams(params, flags) {
  let merged = { ...params };
  merged = mergeSetParams(merged, flag(flags, "set"));

  const paramsFile = flag(flags, "params-file");
  if (paramsFile) merged = { ...merged, ...readJsonFile(paramsFile) };

  const paramsText = flag(flags, "params");
  if (paramsText) merged = { ...merged, ...parseJsonText(String(paramsText), "--params") };

  if (boolFlag(flags, "stdin")) {
    const stdin = fs.readFileSync(0, "utf8").trim();
    if (stdin) merged = { ...merged, ...parseJsonText(stdin, "stdin") };
  }

  return merged;
}

function commandToAction(args, flags) {
  const command = args[0];
  if (!command || command === "help" || boolFlag(flags, "help")) {
    return { help: true };
  }

  if (command === "actions") {
    return { payload: { ok: true, actions: ACTIONS } };
  }

  if (command === "run") {
    const action = requireValue(args[1], "action");
    return { action, params: mergeExtraParams({}, flags) };
  }

  if (command === "scan") {
    return { action: "robot_scan", params: mergeExtraParams({}, flags) };
  }

  if (command === "describe") {
    return {
      action: "robot_describe",
      params: mergeExtraParams({ profileId: requireValue(args[1] || flag(flags, "profile-id"), "profileId") }, flags)
    };
  }

  if (command === "probe-plan") {
    return {
      action: "probe_plan_create",
      params: mergeExtraParams({
        profileId: requireValue(args[1] || flag(flags, "profile-id"), "profileId"),
        duty: numberFlag(flags, undefined, "duty"),
        sampleRateHz: numberFlag(flags, undefined, "sample-rate", "sampleRateHz")
      }, flags)
    };
  }

  if (command === "probe-run") {
    const planFile = flag(flags, "plan-file");
    return {
      action: "probe_run",
      params: mergeExtraParams({
        profileId: requireValue(args[1] || flag(flags, "profile-id"), "profileId"),
        label: flag(flags, "label"),
        plan: planFile ? readJsonFile(planFile) : undefined
      }, flags)
    };
  }

  if (command === "classify") {
    return {
      action: "robot_classify",
      params: mergeExtraParams({
        sessionPath: requireValue(flag(flags, "session-path", "sessionPath"), "session path")
      }, flags)
    };
  }

  if (command === "export") {
    return {
      action: "dataset_export",
      params: mergeExtraParams({
        sessionPath: requireValue(flag(flags, "session-path", "sessionPath"), "session path"),
        format: String(flag(flags, "format") || "jsonl"),
        save: boolFlag(flags, "save")
      }, flags)
    };
  }

  if (command === "client-status") {
    return { action: "official_client_status", params: mergeExtraParams({}, flags) };
  }

  if (command === "handoff") {
    return {
      action: "official_client_handoff",
      params: mergeExtraParams({
        profileId: requireValue(args[1] || flag(flags, "profile-id"), "profileId"),
        goal: flag(flags, "goal"),
        clientId: flag(flags, "client", "client-id", "clientId")
      }, flags)
    };
  }

  if (command === "builder") {
    const subcommand = requireValue(args[1], "builder subcommand");
    if (subcommand === "start") {
      return {
        action: "builder_session_start",
        params: mergeExtraParams({
          profileId: requireValue(args[2] || flag(flags, "profile-id"), "profileId"),
          goal: flag(flags, "goal"),
          audience: flag(flags, "audience"),
          sessionId: flag(flags, "session-id", "sessionId"),
          title: flag(flags, "title"),
          clientId: flag(flags, "client", "client-id", "clientId"),
          mode: flag(flags, "mode")
        }, flags)
      };
    }
    if (subcommand === "append") {
      const dataText = flag(flags, "data");
      return {
        action: "builder_session_append",
        params: mergeExtraParams({
          sessionId: requireValue(args[2] || flag(flags, "session-id", "sessionId"), "sessionId"),
          type: flag(flags, "type") || "observation",
          text: requireValue(flag(flags, "text") || args.slice(3).join(" "), "text"),
          author: flag(flags, "author"),
          data: dataText ? parseJsonText(String(dataText), "--data") : undefined
        }, flags)
      };
    }
    if (subcommand === "observe") {
      return {
        action: "builder_session_append",
        params: mergeExtraParams({
          sessionId: requireValue(args[2] || flag(flags, "session-id", "sessionId"), "sessionId"),
          type: "observation",
          text: requireValue(args.slice(3).join(" ") || flag(flags, "text"), "text")
        }, flags)
      };
    }
    if (subcommand === "summary") {
      return {
        action: "builder_session_summary",
        params: mergeExtraParams({
          sessionId: requireValue(args[2] || flag(flags, "session-id", "sessionId"), "sessionId")
        }, flags)
      };
    }
    throw new Error(`unknown builder subcommand: ${subcommand}`);
  }

  if (command === "server") {
    return { server: true };
  }

  throw new Error(`unknown command: ${command}`);
}

function printJson(payload, flags) {
  console.log(JSON.stringify(payload, null, boolFlag(flags, "compact") ? 0 : 2));
}

function printList(title, rows) {
  console.log(title);
  for (const row of rows) console.log(`- ${row}`);
}

function printText(action, payload) {
  if (action === "robot_scan") {
    printList("Robots:", payload.devices.map((device) => `${device.id} (${device.family}${device.robotKind ? `, ${device.robotKind}` : ""})`));
    return;
  }

  if (action === "robot_describe") {
    const profile = payload.profile;
    console.log(`${profile.name} (${profile.id})`);
    console.log(`family: ${profile.family}`);
    console.log(`ports: ${Object.keys(profile.ports || {}).join(", ") || "none"}`);
    return;
  }

  if (action === "robot_classify") {
    const result = payload.classification;
    console.log(`${result.label} confidence=${result.confidence}`);
    console.log(`activePorts=${(result.features.activePorts || []).join(",") || "none"}`);
    return;
  }

  if (action === "official_client_handoff") {
    const handoff = payload.handoff;
    console.log(`${handoff.profileName} via ${handoff.clientId}`);
    printList("Safety:", handoff.safety);
    printList("Steps:", handoff.steps);
    return;
  }

  if (action === "builder_session_start" || action === "builder_session_append" || action === "builder_session_summary") {
    const session = payload.session;
    console.log(`${session.title} (${session.id})`);
    if (payload.filePath) console.log(`file: ${payload.filePath}`);
    if (payload.step) console.log(`added: ${payload.step.type} - ${payload.step.text}`);
    if (payload.summary) {
      if (payload.summary.latestObservation) console.log(`latest: ${payload.summary.latestObservation}`);
      if (payload.summary.likelyIssues?.length) printList("Likely issues:", payload.summary.likelyIssues);
      if (payload.summary.nextActions?.length) printList("Next actions:", payload.summary.nextActions);
      if (payload.summary.questions?.length) printList("Questions:", payload.summary.questions);
      console.log(`safety: ${payload.summary.safetyReminder}`);
    }
    return;
  }

  printJson(payload, { compact: false });
}

async function main() {
  const parsed = parseArgv(process.argv.slice(2));
  const { args, flags } = parsed;
  const selected = commandToAction(args, flags);

  if (selected.help) {
    console.log(HELP);
    return;
  }

  if (selected.server) {
    const host = String(flag(flags, "host") || process.env.HOST || "127.0.0.1");
    const port = Number(flag(flags, "port") || process.env.PORT || 3095);
    createServer().listen(port, host, () => {
      console.log(`lego-mindstorms-mcp listening on http://${host}:${port}`);
    });
    return;
  }

  const payload = selected.payload || await handleAction(selected.action, selected.params || {});
  if (boolFlag(flags, "plain", "human")) {
    printText(selected.action, payload);
  } else {
    printJson(payload, flags);
  }
}

main().catch((err) => {
  const parsed = parseArgv(process.argv.slice(2));
  if (boolFlag(parsed.flags, "plain", "human")) {
    console.error(`error: ${err.message || String(err)}`);
  } else {
    console.error(JSON.stringify({ ok: false, error: err.message || String(err) }, null, 2));
  }
  process.exitCode = 1;
});
