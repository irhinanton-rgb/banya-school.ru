/**
 * Utility to detect if the current running instance is inside the AI Studio Build environment,
 * development server (localhost / 127.0.0.1 / preview frame), or if Developer/Editor Mode is enabled.
 */

const DEV_OVERRIDE_KEY = 'banya_editor_dev_mode_enabled';

export function isStudioEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const host = window.location.hostname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const href = window.location.href.toLowerCase();

  // 1. Explicit editor dev mode toggle in localStorage
  try {
    const override = localStorage.getItem(DEV_OVERRIDE_KEY);
    if (override === 'true') return true;
    if (override === 'false') return false;
  } catch {
    // ignore
  }

  // 2. URL parameter ?edit=true or ?dev=true or ?admin=true
  if (
    search.includes('edit=true') ||
    search.includes('dev=true') ||
    search.includes('editor=true') ||
    search.includes('admin=true')
  ) {
    return true;
  }

  // 3. AI Studio preview environments (*.run.app, *aistudio*, localhost, 127.0.0.1)
  if (
    host.includes('run.app') ||
    host.includes('aistudio') ||
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('googleusercontent.com') ||
    host.includes('webcontainer') ||
    href.includes('ais-dev') ||
    href.includes('ais-pre')
  ) {
    return true;
  }

  return false;
}

export function setEditorDevModeOverride(enabled: boolean | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (enabled === null) {
      localStorage.removeItem(DEV_OVERRIDE_KEY);
    } else {
      localStorage.setItem(DEV_OVERRIDE_KEY, enabled ? 'true' : 'false');
    }
  } catch {
    // ignore
  }
}
