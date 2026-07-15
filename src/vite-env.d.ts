/// <reference types="vite/client" />

// Build identifier injected by vite.config.ts (git sha + build time),
// compared against /version.json by src/utils/versionCheck.ts.
declare const __APP_VERSION__: string;
