// View-transition-aware page-init helper.
//
// Module scripts run ONCE per browser session under the <ClientRouter />:
// after a client-side navigation the new page's DOM is swapped in but module
// scripts do NOT re-execute, so any init that queries the DOM at module scope
// silently does nothing for the new page. Every per-page init on a surface
// that can be reached via client routing must register through this helper.
//
// Semantics: `fn` runs exactly once per PAGEVIEW (initial load, every
// client-side navigation, MPA pages without the router). Two subtleties this
// guards against, both found empirically:
// - A module first fetched DURING a swap can finish evaluating after that
//   navigation's `astro:page-load` already fired — listening alone would miss
//   the very pageview that loaded it. So we also run immediately at register.
// - The immediate run and the `astro:page-load` run must not both execute on
//   the same pageview (double listeners → double telemetry). A shared
//   navigation counter (bumped on `astro:after-swap`) dedupes them.
//
// Re-run discipline: anything `fn` attaches to window/document (scroll
// listeners, rAF loops) must be wired once behind a module-level flag, with
// per-page state re-collected inside `fn`.
let navId = 0;
document.addEventListener('astro:after-swap', () => { navId++; });

export function onPageReady(fn: () => void): void {
  let ranFor = -1;
  const run = () => {
    if (ranFor === navId) return;
    ranFor = navId;
    fn();
  };
  document.addEventListener('astro:page-load', run);
  run();
}
