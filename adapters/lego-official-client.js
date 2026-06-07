const { spawn } = require("node:child_process");
const fs = require("node:fs");

const KNOWN_CLIENTS = [
  {
    id: "ev3-classroom",
    name: "EV3 Classroom",
    family: "ev3",
    installPath: "C:\\Program Files\\EV3 Classroom",
    executable: "C:\\Program Files\\EV3 Classroom\\EV3 Classroom-win-1.5.3.4056.exe",
    processPatterns: ["EV3 Classroom"],
    role: "official EV3 classroom programming client"
  },
  {
    id: "robot-inventor-51515",
    name: "LEGO MINDSTORMS Robot Inventor",
    family: "robot-inventor",
    installPath: "Microsoft Store app package",
    executable: null,
    processPatterns: ["MINDSTORMS", "LEGOMINDSTORMSInventor", "Robot Inventor"],
    role: "official Robot Inventor 51515 programming client"
  },
  {
    id: "wedo2-app",
    name: "LEGO Education WeDo 2.0",
    family: "wedo2",
    installPath: "C:\\Program Files\\LEGO Education WeDo 2.0",
    executable: null,
    processPatterns: ["WeDo", "LEGO WeDo", "WeDo2", "LEGOEducationWeDo"],
    role: "official WeDo 2.0 programming client (available until July 31 2026)",
    eolDate: "2026-07-31"
  }
];

function runPowerShell(script, timeoutMs = 10000) {
  return new Promise((resolve) => {
    let child;
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    try {
      child = spawn(
        "powershell.exe",
        ["-NoProfile", "-Command", script],
        { windowsHide: true }
      );
    } catch (err) {
      resolve({
        ok: false,
        timedOut: false,
        stdout,
        stderr: err.message || String(err),
        errorCode: err.code
      });
      return;
    }

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString("utf8");
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, timedOut: false, stdout, stderr: String(err) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        ok: code === 0 && !timedOut,
        code,
        timedOut,
        stdout,
        stderr
      });
    });
  });
}

async function officialClientStatus() {
  if (process.platform !== "win32") {
    return {
      ok: true,
      supported: false,
      running: false,
      platform: process.platform,
      processes: [],
      notes: ["Official LEGO client status detection is currently implemented for Windows."]
    };
  }

  const processScript = `
$patterns = @(${KNOWN_CLIENTS.flatMap((client) => client.processPatterns).map((pattern) => `'${pattern.replace(/'/g, "''")}'`).join(",")})
$items = Get-Process | Where-Object {
  $name = $_.ProcessName
  $title = $_.MainWindowTitle
  foreach ($pattern in $patterns) {
    if ($name -match $pattern -or $title -match $pattern) { return $true }
  }
  return $false
} | Select-Object ProcessName,Id,Path,MainWindowTitle
$items | ConvertTo-Json -Compress
`;

  const result = await runPowerShell(processScript);
  let processes = [];
  if (result.ok && result.stdout.trim()) {
    const parsed = JSON.parse(result.stdout);
    processes = Array.isArray(parsed) ? parsed : [parsed];
  }

  const clients = KNOWN_CLIENTS.map((client) => {
    const matchingProcesses = processes.filter((item) => {
      const text = [
        item.ProcessName,
        item.Path,
        item.MainWindowTitle
      ].filter(Boolean).join(" ").toLowerCase();
      return client.processPatterns.some((pattern) => text.includes(pattern.toLowerCase()));
    });
    const installed = client.executable
      ? fs.existsSync(client.executable)
      : matchingProcesses.length > 0;
    return {
      ...client,
      installed,
      running: matchingProcesses.length > 0,
      processes: matchingProcesses
    };
  });

  return {
    ok: result.ok,
    supported: true,
    statusAvailable: result.ok,
    running: processes.length > 0,
    mindstormsRunning: clients.some((client) => client.id === "robot-inventor-51515" && client.running),
    ev3ClassroomRunning: clients.some((client) => client.id === "ev3-classroom" && client.running),
    wedo2Running: clients.some((client) => client.id === "wedo2-app" && client.running),
    platform: process.platform,
    clients,
    processes,
    errorCode: result.errorCode,
    stderr: result.stderr.trim() || undefined,
    notes: [
      "Use the official LEGO client for manual firmware/install/app workflows.",
      "Use this MCP/action server for status, profile data, generated code, datasets, and safe handoffs.",
      "WeDo 2.0 App: available until July 31 2026. Migrate to Pybricks CityHub target for ongoing use."
    ]
  };
}

module.exports = {
  officialClientStatus
};
