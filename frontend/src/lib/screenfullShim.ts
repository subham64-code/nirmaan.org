// Lightweight shim to ensure `screenfull` API is available on window
// Provides minimal methods used by the app to avoid 'screenfull is not defined' runtime errors
if (typeof window !== 'undefined') {
  try {
    const w = window as any;
    if (!w.screenfull) {
      w.screenfull = {
        isEnabled: Boolean(document && document.documentElement && document.documentElement.requestFullscreen),
        isFullscreen: Boolean(document && document.fullscreenElement),
        async request() {
          if (document.documentElement.requestFullscreen) {
            try { await document.documentElement.requestFullscreen(); } catch (e) { console.warn('screenfull.request() failed', e); }
          }
        },
        on(event: string, handler: any) {
          if (event === 'change') document.addEventListener('fullscreenchange', handler);
        },
        off(event: string, handler: any) {
          if (event === 'change') document.removeEventListener('fullscreenchange', handler);
        }
      };
    }
  } catch (e) {
    // ignore
  }
}

export {};
