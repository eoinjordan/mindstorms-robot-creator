#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-chromium");

const ROOT = path.resolve(__dirname, "..");
const SVG_PATH = path.join(ROOT, "web-app", "icon-512.svg");
const OUT_DIR = path.join(ROOT, "build");

const PNG_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];
const ICO_SIZES = [16, 32, 48, 64, 128, 256];
const ICNS_TYPES = new Map([
  [16, "icp4"],
  [32, "icp5"],
  [64, "icp6"],
  [128, "ic07"],
  [256, "ic08"],
  [512, "ic09"],
  [1024, "ic10"]
]);

function writeIco(pngs) {
  const entries = ICO_SIZES.map((size) => ({ size, data: pngs.get(size) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let offset = header.length + directory.length;

  entries.forEach((entry, index) => {
    const dirOffset = index * 16;
    directory.writeUInt8(entry.size >= 256 ? 0 : entry.size, dirOffset);
    directory.writeUInt8(entry.size >= 256 ? 0 : entry.size, dirOffset + 1);
    directory.writeUInt8(0, dirOffset + 2);
    directory.writeUInt8(0, dirOffset + 3);
    directory.writeUInt16LE(1, dirOffset + 4);
    directory.writeUInt16LE(32, dirOffset + 6);
    directory.writeUInt32LE(entry.data.length, dirOffset + 8);
    directory.writeUInt32LE(offset, dirOffset + 12);
    offset += entry.data.length;
  });

  fs.writeFileSync(path.join(OUT_DIR, "icon.ico"), Buffer.concat([header, directory, ...entries.map((entry) => entry.data)]));
}

function writeIcns(pngs) {
  const chunks = [];

  for (const [size, type] of ICNS_TYPES) {
    const data = pngs.get(size);
    const chunkHeader = Buffer.alloc(8);
    chunkHeader.write(type, 0, 4, "ascii");
    chunkHeader.writeUInt32BE(data.length + 8, 4);
    chunks.push(Buffer.concat([chunkHeader, data]));
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 8);
  const header = Buffer.alloc(8);
  header.write("icns", 0, 4, "ascii");
  header.writeUInt32BE(totalLength, 4);

  fs.writeFileSync(path.join(OUT_DIR, "icon.icns"), Buffer.concat([header, ...chunks]));
}

async function renderPngs() {
  const svg = fs.readFileSync(SVG_PATH, "utf-8");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pngs = new Map();

  try {
    for (const size of PNG_SIZES) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`
        <!doctype html>
        <html>
          <head>
            <style>
              html, body { margin: 0; background: transparent; overflow: hidden; }
              svg { display: block; width: ${size}px; height: ${size}px; }
            </style>
          </head>
          <body style="margin:0;background:transparent;overflow:hidden">
            ${svg}
          </body>
        </html>
      `);
      await page.waitForSelector("svg");
      const output = path.join(OUT_DIR, `icon-${size}.png`);
      const data = await page.screenshot({ path: output, omitBackground: true });
      pngs.set(size, data);
    }
  } finally {
    await browser.close();
  }

  fs.copyFileSync(path.join(OUT_DIR, "icon-512.png"), path.join(OUT_DIR, "icon.png"));
  return pngs;
}

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`Missing icon source: ${SVG_PATH}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const pngs = await renderPngs();
  writeIco(pngs);
  writeIcns(pngs);

  console.log("[icons] wrote build/icon.ico, build/icon.icns, and build/icon.png");
}

main().catch((error) => {
  console.error("[icons] failed:", error.message);
  process.exit(1);
});
