const state = {
  baseUrl: "http://127.0.0.1:3095",
  devices: [],
  selectedProfileId: null,
  sessionId: null,
  lastProbeSession: null
};

const els = {
  serverUrl: document.querySelector("#serverUrl"),
  serverStatus: document.querySelector("#serverStatus"),
  refreshBtn: document.querySelector("#refreshBtn"),
  scanBtn: document.querySelector("#scanBtn"),
  fleetList: document.querySelector("#fleetList"),
  selectedRobot: document.querySelector("#selectedRobot"),
  goalInput: document.querySelector("#goalInput"),
  audienceInput: document.querySelector("#audienceInput"),
  sessionIdInput: document.querySelector("#sessionIdInput"),
  startBuilderBtn: document.querySelector("#startBuilderBtn"),
  handoffBtn: document.querySelector("#handoffBtn"),
  summaryBtn: document.querySelector("#summaryBtn"),
  observationInput: document.querySelector("#observationInput"),
  observeBtn: document.querySelector("#observeBtn"),
  builderResult: document.querySelector("#builderResult"),
  dutyInput: document.querySelector("#dutyInput"),
  sampleRateInput: document.querySelector("#sampleRateInput"),
  planBtn: document.querySelector("#planBtn"),
  probeBtn: document.querySelector("#probeBtn"),
  classifyBtn: document.querySelector("#classifyBtn"),
  clearLogBtn: document.querySelector("#clearLogBtn"),
  logOutput: document.querySelector("#logOutput")
};

function setBusy(isBusy) {
  for (const button of document.querySelectorAll("button")) {
    button.disabled = isBusy;
  }
}

function setLog(payload) {
  els.logOutput.textContent = JSON.stringify(payload, null, 2);
}

function setStatus(text, isError = false) {
  els.serverStatus.textContent = text;
  els.serverStatus.className = isError ? "error-text" : "";
}

function selectedDevice() {
  return state.devices.find((device) => device.id === state.selectedProfileId) || null;
}

function setSelectedProfile(profileId) {
  state.selectedProfileId = profileId;
  const device = selectedDevice();
  els.selectedRobot.textContent = device ? `${device.name} (${device.id})` : "No robot selected";
  renderFleet();
}

async function api(action, params = {}) {
  const response = await fetch(`${state.baseUrl}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, params })
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

async function checkServer() {
  state.baseUrl = els.serverUrl.value.trim().replace(/\/$/, "");
  try {
    const response = await fetch(`${state.baseUrl}/health`);
    const payload = await response.json();
    setStatus(`${payload.service || "server"} ready, ${payload.profiles || 0} profiles`);
    return { ok: true, health: payload };
  } catch (err) {
    setStatus(`Server unavailable: ${err.message}`, true);
    return { ok: false, error: err.message };
  }
}

function renderFleet() {
  els.fleetList.innerHTML = "";
  for (const device of state.devices) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `robot-row${device.id === state.selectedProfileId ? " selected" : ""}`;
    row.innerHTML = `
      <strong>${device.name}</strong>
      <span>${device.id}</span>
      <span>${device.family}${device.robotKind ? ` / ${device.robotKind}` : ""}</span>
    `;
    row.addEventListener("click", () => setSelectedProfile(device.id));
    els.fleetList.append(row);
  }
}

function renderSummary(summary) {
  if (!summary) {
    els.builderResult.innerHTML = "";
    return;
  }
  const blocks = [
    ["Likely issues", summary.likelyIssues || [], "warning"],
    ["Next actions", summary.nextActions || [], ""],
    ["Questions", summary.questions || [], ""]
  ];
  els.builderResult.innerHTML = blocks.map(([title, rows, kind]) => `
    <div class="result-block ${kind}">
      <strong>${title}</strong>
      ${rows.length ? `<ul>${rows.map((item) => `<li>${item}</li>`).join("")}</ul>` : "<span>none</span>"}
    </div>
  `).join("");
}

async function runAction(label, work) {
  setBusy(true);
  try {
    const payload = await work();
    setLog({ label, ...payload });
    if (payload.summary) renderSummary(payload.summary);
    return payload;
  } catch (err) {
    const payload = { ok: false, label, error: err.message };
    setLog(payload);
    return payload;
  } finally {
    setBusy(false);
  }
}

async function scan() {
  await checkServer();
  const payload = await runAction("scan", () => api("robot_scan"));
  if (payload.ok) {
    state.devices = payload.devices;
    if (!state.selectedProfileId && state.devices.length > 0) {
      const first51515 = state.devices.find((device) => device.id.startsWith("51515-"));
      setSelectedProfile(first51515 ? first51515.id : state.devices[0].id);
    } else {
      renderFleet();
    }
  }
}

async function startBuilder() {
  if (!state.selectedProfileId) throw new Error("Select a robot first.");
  const payload = await api("builder_session_start", {
    profileId: state.selectedProfileId,
    goal: els.goalInput.value,
    audience: els.audienceInput.value,
    sessionId: els.sessionIdInput.value || undefined
  });
  state.sessionId = payload.session.id;
  els.sessionIdInput.value = payload.session.id;
  return payload;
}

async function handoff() {
  if (!state.selectedProfileId) throw new Error("Select a robot first.");
  return api("official_client_handoff", {
    profileId: state.selectedProfileId,
    goal: els.goalInput.value
  });
}

async function observe() {
  const sessionId = state.sessionId || els.sessionIdInput.value;
  if (!sessionId) throw new Error("Start or enter a session first.");
  return api("builder_session_append", {
    sessionId,
    type: "observation",
    text: els.observationInput.value
  });
}

async function summary() {
  const sessionId = state.sessionId || els.sessionIdInput.value;
  if (!sessionId) throw new Error("Start or enter a session first.");
  return api("builder_session_summary", { sessionId });
}

function probeParams() {
  if (!state.selectedProfileId) throw new Error("Select a robot first.");
  return {
    profileId: state.selectedProfileId,
    duty: Number(els.dutyInput.value),
    sampleRateHz: Number(els.sampleRateInput.value)
  };
}

async function createPlan() {
  return api("probe_plan_create", probeParams());
}

async function runProbe() {
  const payload = await api("probe_run", probeParams());
  state.lastProbeSession = payload.session;
  return payload;
}

async function classifyProbe() {
  if (!state.lastProbeSession) throw new Error("Run a simulated probe first.");
  return api("robot_classify", { session: state.lastProbeSession });
}

els.refreshBtn.addEventListener("click", () => runAction("health", checkServer));
els.scanBtn.addEventListener("click", scan);
els.startBuilderBtn.addEventListener("click", () => runAction("builder start", startBuilder));
els.handoffBtn.addEventListener("click", () => runAction("handoff", handoff));
els.summaryBtn.addEventListener("click", () => runAction("builder summary", summary));
els.observeBtn.addEventListener("click", () => runAction("builder observe", observe));
els.planBtn.addEventListener("click", () => runAction("probe plan", createPlan));
els.probeBtn.addEventListener("click", () => runAction("probe run", runProbe));
els.classifyBtn.addEventListener("click", () => runAction("classify", classifyProbe));
els.clearLogBtn.addEventListener("click", () => setLog({}));

scan();
