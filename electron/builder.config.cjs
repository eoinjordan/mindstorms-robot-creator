/**
 * electron-builder configuration for Mindstorms Robot Creator.
 * Produces Windows installer/portable EXEs, macOS DMGs, and a Linux AppImage.
 */

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: "com.eoinedge.mindstorms-robot-creator",
  productName: "Mindstorms Robot Creator",

  extraMetadata: {
    main: "electron/main.js"
  },

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

  asar: true,
  asarUnpack: [
    "out/**"
  ],

  directories: {
    buildResources: "build",
    output: "dist-electron"
  },

  win: {
    icon: "icon.ico",
    target: [
      { target: "nsis", arch: ["x64"] },
      { target: "portable", arch: ["x64"] }
    ],
    artifactName: "${name}-portable.${ext}"
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Mindstorms Robot Creator",
    uninstallDisplayName: "Mindstorms Robot Creator",
    installerIcon: "icon.ico",
    uninstallerIcon: "icon.ico",
    installerHeaderIcon: "icon.ico",
    artifactName: "${name}-setup.${ext}"
  },

  mac: {
    icon: "icon.icns",
    target: [{ target: "dmg", arch: ["x64", "arm64"] }],
    category: "public.app-category.education",
    artifactName: "${name}-${arch}.${ext}"
  },

  dmg: {
    title: "Mindstorms Robot Creator"
  },

  linux: {
    icon: "icon.png",
    target: [{ target: "AppImage", arch: ["x64"] }],
    category: "Education",
    artifactName: "${name}.${ext}"
  },

  publish: null
};
