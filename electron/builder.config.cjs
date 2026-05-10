/**
 * electron-builder configuration for Mindstorms Robot Studio.
 * Produces: Windows NSIS installer (.exe), Windows portable (.exe),
 *           macOS DMG, Linux AppImage.
 *
 * Run: npm run electron:build:win
 */

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: "com.eoinedge.mindstorms-robot-creator",
  productName: "Mindstorms Robot Creator",

  // Override "main" in the packaged app (root package.json "main" stays as server.js
  // for module-export compatibility; electron-builder uses this instead at build time).
  extraMetadata: {
    main: "electron/main.js"
  },

  // Files to include in the app bundle (no node_modules — zero npm runtime deps)
  files: [
    "electron/**",
    "web-app/**",
    "server.js",
    "mcp-server.js",
    "cli.js",
    "adapters/**",
    "examples/**",
    "schemas/**",
    "package.json"
  ],

  // Folders that should be present but excluded from asar (writable at runtime)
  asar: true,
  asarUnpack: [
    "out/**"
  ],

  directories: {
    output: "dist-electron"
  },

  // ── Windows ──────────────────────────────────────────────────────────────────
  win: {
    target: [
      { target: "nsis",     arch: ["x64"] },
      { target: "portable", arch: ["x64"] }
    ]
    // icon: "build/icon.ico"  — add a 256x256 ICO file here for branding
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerHeader: undefined,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Mindstorms Robot Creator",
    artifactName: "${name}-setup.${ext}"
  },

  // ── macOS ─────────────────────────────────────────────────────────────────────
  mac: {
    target: [{ target: "dmg", arch: ["x64", "arm64"] }],
    category: "public.app-category.education"
  },
  dmg: {
    title: "Mindstorms Robot Creator"
  },

  // ── Linux ─────────────────────────────────────────────────────────────────────
  linux: {
    target: [{ target: "AppImage", arch: ["x64"] }],
    category: "Education"
  },

  // ── Publish (GitHub Releases) ─────────────────────────────────────────────────
  // Set GH_TOKEN env var and uncomment to auto-publish to GitHub Releases.
  // publish: { provider: "github", releaseType: "release" }
  publish: null
};
