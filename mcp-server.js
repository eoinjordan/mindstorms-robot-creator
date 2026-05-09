#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * lego-mindstorms-mcp — MCP stdio adapter
 *
 * Wraps the existing HTTP action server as a proper MCP tool server so it can
 * be used by Claude Desktop, VS Code Copilot (MCP), Cursor, and other clients.
 *
 * Protocol: MCP 2024-11-05 (JSON-RPC 2.0 over stdio, newline-delimited)
 *
 * Usage:
 *   node mcp-server.js
 *
 * Or via VS Code .vscode/mcp.json (auto-registered).
 * Or via Claude Desktop claude_desktop_config.json mcpServers block.
 */

const readline = require("node:readline");
const { handleAction, ACTIONS } = require("./server.js");

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_DEFS = [
  {
    name: "robot_scan",
    description: "List all available LEGO MINDSTORMS robot profiles on this machine.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "robot_describe",
    description: "Get the full port map, motor/sensor assignments, capabilities, and safety notes for a specific robot profile.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Robot profile ID (e.g. '51515-blast', '51515-charlie'). Call robot_scan first to list IDs." }
      },
      required: ["profileId"]
    }
  },
  {
    name: "robot_classify",
    description: "Classify probe session telemetry into a robot morphology label (e.g. two_wheel_drive, humanoid_drive_launcher, quadruped_walker).",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "The builder session ID whose telemetry should be classified." }
      },
      required: ["sessionId"]
    }
  },
  {
    name: "probe_plan_create",
    description: "Create a safe, low-power motor probe plan for a robot profile. The plan lists which motor ports to test and in what order.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Robot profile ID." }
      },
      required: ["profileId"]
    }
  },
  {
    name: "probe_run",
    description: "Run a motor probe session for a robot — either simulated (no hub needed) or live on a connected hub.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Robot profile ID." },
        simulated: { type: "boolean", description: "If true, generates synthetic telemetry without a real hub. Default true." }
      },
      required: ["profileId"]
    }
  },
  {
    name: "dataset_export",
    description: "Export all probe sessions as a CSV or JSON dataset suitable for Edge Impulse ingestion or local ML training.",
    inputSchema: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["csv", "json"], description: "Output format. Default: csv." }
      }
    }
  },
  {
    name: "official_client_status",
    description: "Check whether the official LEGO MINDSTORMS app is installed and its status on this machine.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "official_client_handoff",
    description: "Generate step-by-step handoff instructions for loading and running a program in the official LEGO MINDSTORMS app.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Robot profile ID." },
        programName: { type: "string", description: "Name of the program file to run." }
      }
    }
  },
  {
    name: "builder_session_start",
    description: "Start a new guided human-in-the-loop builder/debug session for a robot and goal. Returns a sessionId to use in subsequent calls.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Robot profile ID." },
        goal: { type: "string", description: "What the user wants to achieve, e.g. 'make Blast wave both arms'." },
        audience: { type: "string", enum: ["kid", "family", "classroom", "maker"], description: "Audience level for instructions. Default: maker." }
      },
      required: ["profileId", "goal"]
    }
  },
  {
    name: "builder_session_append",
    description: "Append a test observation to a running builder session. Returns next recommended actions and safety flags.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "Session ID returned by builder_session_start." },
        observation: { type: "string", description: "What the user observed, e.g. 'The right motor moved backwards but the left did not move at all.'" }
      },
      required: ["sessionId", "observation"]
    }
  },
  {
    name: "builder_session_summary",
    description: "Summarize a completed builder session: what was learned, remaining unknowns, and recommended next actions.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "Session ID to summarize." }
      },
      required: ["sessionId"]
    }
  },
  {
    name: "code_generate",
    description: "Generate Python robot code (LEGO Stock Python or Pybricks) for a robot profile with a specified intent.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Robot profile ID (from robot_scan)." },
        target: {
          type: "string",
          enum: ["lego-stock-python", "pybricks-python"],
          description: "Code target. 'lego-stock-python' works in the official LEGO app. 'pybricks-python' requires Pybricks firmware."
        },
        intent: {
          type: "string",
          enum: ["beep_hello", "safe_probe", "drive_forward", "wave", "custom"],
          description: "What the generated program should do."
        },
        customCode: { type: "string", description: "Custom Python body (only used when intent=custom)." }
      },
      required: ["profileId", "target", "intent"]
    }
  },
  {
    name: "lms_write",
    description: "Save Python source code as a .lms file that can be opened in the LEGO MINDSTORMS Robot Inventor app.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Program name (no extension, e.g. 'blast-wave')." },
        source: { type: "string", description: "Python source code to embed." },
        profileId: { type: "string", description: "Optional robot profile ID for metadata." }
      },
      required: ["name", "source"]
    }
  },
  {
    name: "lms_read",
    description: "Read a .lms file and return its Python source code (or block program metadata).",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Absolute path to the .lms file to read." }
      },
      required: ["filePath"]
    }
  }
];

// ─── JSON-RPC helpers ─────────────────────────────────────────────────────────

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message, data) {
  const err = { code, message };
  if (data !== undefined) err.data = data;
  send({ jsonrpc: "2.0", id, error: err });
}

// ─── Message dispatch ─────────────────────────────────────────────────────────

async function dispatch(msg) {
  const { id, method, params } = msg;

  if (method === "initialize") {
    sendResult(id, {
      protocolVersion: "2024-11-05",
      serverInfo: { name: "lego-mindstorms-mcp", version: "0.1.0" },
      capabilities: { tools: {} }
    });
    return;
  }

  // Notifications — no response
  if (method === "initialized" || method === "notifications/cancelled") return;

  if (method === "tools/list") {
    sendResult(id, { tools: TOOL_DEFS });
    return;
  }

  if (method === "tools/call") {
    const toolName = String(params?.name || "").trim();
    const args = params?.arguments || {};

    if (!ACTIONS.includes(toolName)) {
      // Return isError content so the LLM sees a clear message
      sendResult(id, {
        content: [{ type: "text", text: `Unknown tool: ${toolName}. Available: ${ACTIONS.join(", ")}` }],
        isError: true
      });
      return;
    }

    try {
      const result = await handleAction(toolName, args);
      sendResult(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      });
    } catch (err) {
      sendResult(id, {
        content: [{ type: "text", text: `Error running ${toolName}: ${err.message}` }],
        isError: true
      });
    }
    return;
  }

  // Ping
  if (method === "ping") {
    sendResult(id, {});
    return;
  }

  sendError(id, -32601, `Method not found: ${method}`);
}

// ─── stdin loop ───────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    sendError(null, -32700, "Parse error");
    return;
  }

  await dispatch(msg);
});

rl.on("close", () => {
  // stdin closed — exit cleanly so the MCP host can restart if needed
  process.exit(0);
});

// Suppress unhandled promise rejections from propagating to stderr (MCP hosts
// often treat anything on stderr as a fatal error).
process.on("unhandledRejection", (reason) => {
  process.stderr.write(`[lego-mindstorms-mcp] unhandled rejection: ${reason}\n`);
});
