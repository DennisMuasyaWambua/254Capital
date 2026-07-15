import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";
import { componentTagger } from "lovable-tagger";

// Unique id per build: git sha when available, plus build time so rebuilds of
// the same commit still differ. Baked into the bundle as __APP_VERSION__ and
// emitted as /version.json for the stale-bundle check (src/utils/versionCheck.ts).
function buildVersion(): string {
  let sha = "nogit";
  try {
    sha = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    // not a git checkout (e.g. some CI tarballs) — timestamp alone still works
  }
  return `${sha}-${Date.now()}`;
}

function versionJsonPlugin(version: string): Plugin {
  return {
    name: "emit-version-json",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version }),
      });
    },
  };
}

const APP_VERSION = buildVersion();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [
    react(),
    versionJsonPlugin(APP_VERSION),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 8080,
  },
}));
