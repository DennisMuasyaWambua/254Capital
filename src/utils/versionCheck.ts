/**
 * Stale-bundle guard.
 *
 * The portal is a long-lived SPA: HR users keep a tab open for days, so after
 * a deploy they keep running the old JavaScript bundle (old placeholders,
 * fixed bugs still present) until they manually refresh. This module compares
 * the version baked into the running bundle (__APP_VERSION__) against
 * /version.json emitted by the same build, and reloads the page when the
 * server has a newer build. Checks run when the tab regains focus and on a
 * slow interval.
 */

const CHECK_INTERVAL_MS = 15 * 60 * 1000;
const RELOAD_GUARD_KEY = 'app_version_reload_at';
const RELOAD_GUARD_MS = 60 * 1000;

async function fetchServerVersion(): Promise<string | null> {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data?.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
}

async function checkAndReload(): Promise<void> {
  const serverVersion = await fetchServerVersion();
  if (!serverVersion || serverVersion === __APP_VERSION__) return;

  // Avoid a reload loop if version.json is out of sync with the bundle
  // (e.g. CDN still propagating the new deploy).
  const lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0);
  if (Date.now() - lastReload < RELOAD_GUARD_MS) return;
  sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));

  window.location.reload();
}

export function initStaleBundleReload(): void {
  // NOTE: do not gate this on import.meta.env.DEV — a committed
  // NODE_ENV=development in .env once flipped DEV to true in production
  // builds and silently dead-code-eliminated this whole module. In the vite
  // dev server /version.json doesn't exist, so checkAndReload no-ops anyway.

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void checkAndReload();
    }
  });

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      void checkAndReload();
    }
  }, CHECK_INTERVAL_MS);
}
