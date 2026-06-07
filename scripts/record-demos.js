#!/usr/bin/env node
/**
 * record-demos.js
 *
 * Records animated WebM demos of each app feature using Playwright's built-in
 * video recording. Videos are saved to screencaps/demos/ and can be converted
 * to GIF with: ffmpeg -i file.webm -vf fps=10,scale=960:-1 file.gif
 *
 * Usage:
 *   node scripts/record-demos.js
 *   node scripts/record-demos.js --out screencaps/demos --fps 15
 *
 * GitHub Actions usage (screenshots only, no video — set env CI=1):
 *   CI=1 node scripts/record-demos.js
 *
 * After running, upload the .webm files as GitHub release assets and embed
 * converted .gif files in the README.
 */

/* eslint-disable no-console */
const path  = require("node:path");
const fs    = require("node:fs");
const http  = require("node:http");
const { chromium } = require("playwright-chromium");

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT        = 7412;
const WEB_APP_DIR = path.join(__dirname, "..", "web-app");
const DEFAULT_OUT = path.join(__dirname, "..", "screencaps", "demos");
const isCI        = process.env.CI === "1" || process.env.CI === "true";

const argv    = process.argv.slice(2);
const outIdx  = argv.indexOf("--out");
const OUT_DIR = outIdx !== -1 ? path.resolve(argv[outIdx + 1]) : DEFAULT_OUT;

const VIEWPORT = { width: 1280, height: 800 };

// ─── Static file server ───────────────────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split("?")[0].split("#")[0];
      if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
      const filePath = path.join(WEB_APP_DIR, urlPath);
      const ext = path.extname(filePath).toLowerCase();
      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(PORT, "127.0.0.1", () => {
      console.log(`[demo] serving web-app on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
    server.on("error", reject);
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simulate human typing — types one char at a time with a small delay. */
async function slowType(page, selector, text, clearFirst = true) {
  const el = await page.locator(selector);
  if (clearFirst) {
    await el.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
  }
  for (const ch of text) {
    await el.pressSequentially(ch, { delay: 40 });
    await page.waitForTimeout(20);
  }
}

/** Click a tab and wait for the CSS transition. */
async function openTab(page, tabId) {
  await page.click(`[data-tab="${tabId}"]`);
  await page.waitForTimeout(400);
}

/** Save a timestamp screenshot alongside the video for preview thumbnails. */
async function snap(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`[demo] snapshot → ${file}`);
}

// ─── Demo sequences ───────────────────────────────────────────────────────────

/**
 * Demo 1: Code Generator
 * Shows selecting a robot, changing the target/intent, generating code.
 */
async function demoCodeGenerator(page) {
  console.log("[demo] starting: code-generator");

  // We start on the Code tab by default — fleet list populates synchronously.
  await page.waitForSelector(".fleet-robot", { timeout: 5000 });
  await page.waitForTimeout(700);

  // Select "Blast" from fleet
  const blastRobot = page.locator(".fleet-robot", { hasText: "Blast" }).first();
  await blastRobot.click();
  await page.waitForTimeout(500);

  // Switch to Pybricks target
  await page.selectOption("#targetSel", "pybricks-python");
  await page.waitForTimeout(300);

  // Generate with default "Beep Hello" intent
  await page.click("#generateBtn");
  await page.waitForTimeout(800);
  await snap(page, "code-beep-hello");

  // Change intent to Safe Motor Probe
  await page.selectOption("#intentSel", "safe_probe");
  await page.waitForTimeout(300);
  await page.click("#generateBtn");
  await page.waitForTimeout(1000);
  await snap(page, "code-safe-probe");

  // Change intent to Drive Forward
  await page.selectOption("#intentSel", "drive_forward");
  await page.waitForTimeout(300);
  await page.click("#generateBtn");
  await page.waitForTimeout(1000);
  await snap(page, "code-drive-forward");

  // Switch to Gelo robot
  const geloRobot = page.locator(".fleet-robot", { hasText: "Gelo" }).first();
  await geloRobot.click();
  await page.waitForTimeout(500);

  // Wave intent for Gelo
  await page.selectOption("#intentSel", "wave");
  await page.click("#generateBtn");
  await page.waitForTimeout(1000);
  await snap(page, "code-gelo-wave");

  // Highlight the Download .lms button (hover)
  await page.hover("#downloadLmsBtn");
  await page.waitForTimeout(600);

  console.log("[demo] done: code-generator");
}

/**
 * Demo 2: Builder Session
 * Shows starting a session, entering a goal, recording observations.
 * Falls back gracefully if the local server is not running at 3095.
 */
async function demoBuilderSession(page) {
  console.log("[demo] starting: builder-session");

  await openTab(page, "builder");
  await page.waitForTimeout(500);
  await snap(page, "builder-empty");

  // Type a goal
  await slowType(page, "#goalInput", "make Blast wave and drive forward safely");
  await page.waitForTimeout(400);

  // Change audience to classroom
  await page.selectOption("#audienceInput", "classroom");
  await page.waitForTimeout(300);

  // Try to start session (server may be offline — that is OK for demo)
  await page.click("#startBuilderBtn");
  await page.waitForTimeout(1500);
  await snap(page, "builder-started");

  // Enter an observation
  await page.locator("#observationInput").click();
  await page.waitForTimeout(200);
  await slowType(
    page,
    "#observationInput",
    "The right drive motor turned but the left did not. Hub light was green. No error on screen."
  );
  await page.waitForTimeout(400);
  await snap(page, "builder-observation");

  // Submit observation
  await page.click("#observeBtn");
  await page.waitForTimeout(1200);
  await snap(page, "builder-after-observe");

  console.log("[demo] done: builder-session");
}

/**
 * Demo 3: Connect Tab
 * Walks through the Bluetooth and USB connection sections.
 */
async function demoConnectTab(page) {
  console.log("[demo] starting: connect-tab");

  await openTab(page, "connect");
  await page.waitForTimeout(700);
  await snap(page, "connect-overview");

  // Scroll to BLE section and highlight connect button
  const bleBtn = page.locator("#bleConnectBtn");
  await bleBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await bleBtn.hover();
  await page.waitForTimeout(800);
  await snap(page, "connect-ble-section");

  // Scroll to USB section
  const usbBtn = page.locator("#connectBtn");
  await usbBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await usbBtn.hover();
  await page.waitForTimeout(800);
  await snap(page, "connect-usb-section");

  // Scroll to terminal section
  const terminal = page.locator("#terminalInput");
  await terminal.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await terminal.click();
  await slowType(page, "#terminalInput", "hub.speaker.beep()");
  await page.waitForTimeout(500);
  await snap(page, "connect-terminal");

  console.log("[demo] done: connect-tab");
}

/**
 * Demo 4: Voice KWS Tab
 * Shows the keyword spotting interface.
 */
async function demoVoiceKws(page) {
  console.log("[demo] starting: voice-kws");

  await openTab(page, "voice");
  await page.waitForTimeout(700);
  await snap(page, "voice-overview");

  // Scroll through setup steps (only if visible)
  const allSteps = await page.locator(".setup-step").all();
  for (const step of allSteps) {
    const visible = await step.isVisible().catch(() => false);
    if (visible) {
      await step.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
  await page.waitForTimeout(500);
  await snap(page, "voice-setup-steps");

  // Show the KWS mapping table area
  const mappingSection = page.locator("#kwsMappingTable");
  if (await mappingSection.isVisible().catch(() => false)) {
    await mappingSection.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
    await snap(page, "voice-kws-mapping");
  }

  console.log("[demo] done: voice-kws");
}

// ─── Full-page overview ───────────────────────────────────────────────────────

async function demoFullOverview(page) {
  console.log("[demo] starting: full-overview");

  await openTab(page, "code");
  await page.waitForTimeout(500);

  // Select Blast and generate code for a nice-looking final state
  const blastRobot = page.locator(".fleet-robot", { hasText: "Blast" }).first();
  await blastRobot.click();
  await page.waitForTimeout(300);
  await page.selectOption("#targetSel", "pybricks-python");
  await page.selectOption("#intentSel", "safe_probe");
  await page.click("#generateBtn");
  await page.waitForTimeout(800);

  await snap(page, "overview-code-filled");

  // Pan through all tabs quickly for a "tour" feel
  for (const tabId of ["builder", "connect", "voice", "code"]) {
    await openTab(page, tabId);
    await page.waitForTimeout(600);
  }

  console.log("[demo] done: full-overview");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server  = await startServer();
  const baseUrl = `http://127.0.0.1:${PORT}/index.html`;

  // In CI mode we just do screenshots; locally we also record video.
  const contextOptions = isCI
    ? { viewport: VIEWPORT }
    : {
        viewport: VIEWPORT,
        recordVideo: {
          dir: OUT_DIR,
          size: VIEWPORT,
        },
      };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(contextOptions);

  // ── Each demo gets its own page so video files end up separate ─────────────
  const DEMOS = [
    { name: "code-generator",   fn: demoCodeGenerator },
    { name: "builder-session",  fn: demoBuilderSession },
    { name: "connect-tab",      fn: demoConnectTab     },
    { name: "voice-kws",        fn: demoVoiceKws       },
    { name: "full-overview",    fn: demoFullOverview   },
  ];

  const recorded = [];

  for (const demo of DEMOS) {
    console.log(`\n[demo] ── ${demo.name} ──`);
    const page = await context.newPage();
    page.on("console", () => {});
    page.on("pageerror", () => {});

    await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 });
    await demo.fn(page);

    // Capture the video path before closing the page (Playwright finalises on close)
    const video = page.video();
    await page.close();

    if (video) {
      const webmPath = await video.path();
      // Rename from auto-generated UUID name to a meaningful one
      const destPath = path.join(OUT_DIR, `${demo.name}.webm`);
      if (webmPath && fs.existsSync(webmPath)) {
        fs.renameSync(webmPath, destPath);
        console.log(`[demo] video  → ${destPath}`);
        recorded.push({ name: demo.name, webm: destPath });
      }
    }
  }

  await context.close();
  await browser.close();
  server.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n[demo] ╔══════════════════════════════════════════════╗`);
  console.log(`[demo] ║  Recording complete — ${DEMOS.length} demos                  ║`);
  console.log(`[demo] ║  Output: ${OUT_DIR.padEnd(38)} ║`);
  console.log(`[demo] ╚══════════════════════════════════════════════╝`);

  if (recorded.length) {
    console.log("\n[demo] WebM videos:");
    recorded.forEach(r => console.log(`  • screencaps/demos/${r.name}.webm`));

    console.log("\n[demo] Convert to GIF with ffmpeg:");
    recorded.forEach(r =>
      console.log(
        `  ffmpeg -i screencaps/demos/${r.name}.webm ` +
        `-vf "fps=10,scale=960:-1:flags=lanczos,split[s0][s1];` +
        `[s0]palettegen[p];[s1][p]paletteuse" ` +
        `screencaps/demos/${r.name}.gif`
      )
    );
  }

  const snapCount = fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".png")).length;
  console.log(`\n[demo] ${snapCount} snapshot PNGs saved to ${OUT_DIR}`);
}

run().catch(err => {
  console.error("[demo] failed:", err.message);
  process.exit(1);
});
