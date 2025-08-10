import { c as create_ssr_component, a as subscribe, e as escape, d as each, b as add_attribute } from './ssr-24bd32bc.js';
import { u as usePollingServices } from './usePollingServices-21732ed4.js';
import { i as isAuthenticated } from './auth-162a86eb.js';
import './index2-67843571.js';

const css = {
  code: ".dashboard-header.svelte-1qvq1kb.svelte-1qvq1kb{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-8)}.dashboard-header.svelte-1qvq1kb h2.svelte-1qvq1kb{color:var(--gray-900);margin:0;font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold)}.legend.svelte-1qvq1kb.svelte-1qvq1kb{display:flex;flex-wrap:wrap;gap:var(--space-6);margin-bottom:var(--space-6);padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-lg);border:1px solid var(--gray-200)}.legend-item.svelte-1qvq1kb.svelte-1qvq1kb{display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-sm);color:var(--gray-600);font-weight:var(--font-weight-medium)}.legend-color.svelte-1qvq1kb.svelte-1qvq1kb{width:16px;height:16px;border-radius:var(--radius-sm);border:1px solid var(--gray-300)}.services-grid.svelte-1qvq1kb.svelte-1qvq1kb{display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:var(--space-4)}.service-tile.svelte-1qvq1kb.svelte-1qvq1kb{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-lg);border:1px solid var(--gray-200);transition:all var(--transition-base);cursor:pointer;outline:none;position:relative;overflow:hidden}.service-tile.svelte-1qvq1kb.svelte-1qvq1kb::before{content:'';position:absolute;inset:0;background:rgba(0, 0, 0, 0.1);opacity:0;transition:opacity var(--transition-base)}.service-tile.svelte-1qvq1kb.svelte-1qvq1kb:hover::before{opacity:1}.service-tile.svelte-1qvq1kb.svelte-1qvq1kb:hover,.service-tile.svelte-1qvq1kb.svelte-1qvq1kb:focus{transform:translateY(-2px);box-shadow:var(--shadow-lg)}.service-tile.svelte-1qvq1kb.svelte-1qvq1kb:focus{box-shadow:var(--shadow-lg), 0 0 0 3px rgb(59 130 246 / 0.15)}.service-name.svelte-1qvq1kb.svelte-1qvq1kb{color:white;font-weight:var(--font-weight-semibold);text-align:center;padding:var(--space-4);text-shadow:0 2px 4px rgba(0, 0, 0, 0.4);word-break:break-word;position:relative;z-index:1}.loading.svelte-1qvq1kb.svelte-1qvq1kb{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:var(--space-4);height:200px;background:var(--gray-50);color:var(--gray-600);font-size:var(--font-size-lg);border-radius:var(--radius-lg);border:1px solid var(--gray-200)}.loading-spinner.svelte-1qvq1kb.svelte-1qvq1kb{width:24px;height:24px;border:3px solid var(--gray-200);border-top:3px solid var(--primary-500);border-radius:50%;animation:svelte-1qvq1kb-spin 1s linear infinite}@keyframes svelte-1qvq1kb-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.empty-state.svelte-1qvq1kb.svelte-1qvq1kb{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:var(--space-8);background:white;border-radius:var(--radius-lg);border:1px solid var(--gray-300);min-height:300px}.empty-state__icon.svelte-1qvq1kb.svelte-1qvq1kb{font-size:var(--space-12);margin-bottom:var(--space-4);opacity:0.6}.empty-state__title.svelte-1qvq1kb.svelte-1qvq1kb{margin:0 0 var(--space-2) 0;font-size:var(--font-size-xl);font-weight:var(--font-weight-semibold);color:var(--gray-900)}.empty-state__description.svelte-1qvq1kb.svelte-1qvq1kb{margin:0 0 var(--space-6) 0;font-size:var(--font-size-base);color:var(--gray-500);max-width:400px}.empty-state__action.svelte-1qvq1kb.svelte-1qvq1kb{margin:0}.service-overlay.svelte-1qvq1kb.svelte-1qvq1kb{position:fixed;z-index:1000;background:white;border-radius:var(--radius-lg);box-shadow:var(--shadow-xl);padding:0;min-width:280px;max-width:400px;transform:translate(-50%, -100%);animation:svelte-1qvq1kb-fadeInUp var(--transition-base) ease-out;border:1px solid var(--gray-200)}.overlay-content.svelte-1qvq1kb.svelte-1qvq1kb{padding:var(--space-4)}.overlay-content.svelte-1qvq1kb h3.svelte-1qvq1kb{margin:0 0 var(--space-3) 0;font-size:var(--font-size-lg);font-weight:var(--font-weight-semibold);color:var(--gray-900);word-break:break-word}.overlay-field.svelte-1qvq1kb.svelte-1qvq1kb{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-2);gap:var(--space-3)}.overlay-field.svelte-1qvq1kb.svelte-1qvq1kb:last-child{margin-bottom:0}.overlay-label.svelte-1qvq1kb.svelte-1qvq1kb{font-weight:var(--font-weight-medium);color:var(--gray-600);font-size:var(--font-size-sm);flex-shrink:0;min-width:80px}.overlay-value.svelte-1qvq1kb.svelte-1qvq1kb{color:var(--gray-900);font-size:var(--font-size-sm);text-align:right;word-break:break-all;flex:1}.overlay-value.status-up.svelte-1qvq1kb.svelte-1qvq1kb{color:var(--success-600);font-weight:var(--font-weight-medium)}.overlay-value.status-slow.svelte-1qvq1kb.svelte-1qvq1kb{color:var(--warning-600);font-weight:var(--font-weight-medium)}.overlay-value.status-down.svelte-1qvq1kb.svelte-1qvq1kb{color:var(--error-600);font-weight:var(--font-weight-medium)}.overlay-value.status-unknown.svelte-1qvq1kb.svelte-1qvq1kb{color:var(--gray-500);font-style:italic}@keyframes svelte-1qvq1kb-fadeInUp{from{opacity:0;transform:translate(-50%, -100%) translateY(10px)}to{opacity:1;transform:translate(-50%, -100%) translateY(0)}}@media(max-width: 768px){.services-grid.svelte-1qvq1kb.svelte-1qvq1kb{grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:var(--space-3)}.dashboard-header.svelte-1qvq1kb.svelte-1qvq1kb{flex-direction:column;gap:var(--space-4);align-items:flex-start}.legend.svelte-1qvq1kb.svelte-1qvq1kb{gap:var(--space-4);padding:var(--space-3)}.legend-item.svelte-1qvq1kb.svelte-1qvq1kb{font-size:var(--font-size-xs)}.service-overlay.svelte-1qvq1kb.svelte-1qvq1kb{min-width:260px;max-width:calc(100vw - var(--space-8));margin:0 var(--space-4)}}@media(max-width: 480px){.services-grid.svelte-1qvq1kb.svelte-1qvq1kb{grid-template-columns:repeat(auto-fill, minmax(120px, 1fr));gap:var(--space-2)}.service-name.svelte-1qvq1kb.svelte-1qvq1kb{font-size:var(--font-size-sm);padding:var(--space-2)}.service-overlay.svelte-1qvq1kb.svelte-1qvq1kb{min-width:240px;transform:translate(-50%, -100%)}.overlay-content.svelte-1qvq1kb.svelte-1qvq1kb{padding:var(--space-3)}.overlay-field.svelte-1qvq1kb.svelte-1qvq1kb{gap:var(--space-2);margin-bottom:var(--space-1)}.overlay-label.svelte-1qvq1kb.svelte-1qvq1kb{min-width:70px;font-size:var(--font-size-xs)}.overlay-value.svelte-1qvq1kb.svelte-1qvq1kb{font-size:var(--font-size-xs)}}",
  map: null
};
function truncateName(name, maxLength = 20) {
  return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
}
function formatRelativeTime(dateString) {
  if (!dateString)
    return "Never checked";
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1e3 * 60));
  if (diffMinutes < 1)
    return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
function getStatusText(status) {
  if (!status)
    return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let services;
  let loading;
  let error;
  let $state, $$unsubscribe_state;
  let $isAuthenticated, $$unsubscribe_isAuthenticated;
  $$unsubscribe_isAuthenticated = subscribe(isAuthenticated, (value) => $isAuthenticated = value);
  const { state, refresh } = usePollingServices();
  $$unsubscribe_state = subscribe(state, (value) => $state = value);
  const statusColors = {
    "UP": "var(--status-up)",
    "SLOW": "var(--status-slow)",
    "DOWN": "var(--status-down)",
    "null": "var(--status-unknown)"
  };
  function getStatusColor(status) {
    const key = status ?? "null";
    return statusColors[key] ?? statusColors["null"];
  }
  $$result.css.add(css);
  ({ services, loading, error } = $state);
  $$unsubscribe_state();
  $$unsubscribe_isAuthenticated();
  return `${$$result.head += `<!-- HEAD_svelte-1yae48b_START -->${$$result.title = `<title>Dashboard - pingiMAP</title>`, ""}<!-- HEAD_svelte-1yae48b_END -->`, ""} <main class="container"><div class="dashboard-header svelte-1qvq1kb"><h2 class="svelte-1qvq1kb" data-svelte-h="svelte-1utspdy">Services Dashboard</h2> <button class="btn btn-primary" title="Refresh services" aria-label="Refresh services" data-svelte-h="svelte-107org">Refresh</button></div> ${loading ? `<div class="loading svelte-1qvq1kb" data-svelte-h="svelte-6r7gsq"><div class="loading-spinner svelte-1qvq1kb" aria-hidden="true"></div>
      Loading services...</div>` : `${error ? `<div class="error"><div class="error-content"><h3 data-svelte-h="svelte-kkj1sw">Failed to load monitoring data</h3> <p>Error: ${escape(error)}</p></div></div>` : `${services.length === 0 ? `<div class="empty-state svelte-1qvq1kb"><div class="empty-state__icon svelte-1qvq1kb" aria-hidden="true" data-svelte-h="svelte-s0v87j">📊</div> <h3 class="empty-state__title svelte-1qvq1kb" data-svelte-h="svelte-1dj9e3v">No services found</h3> <p class="empty-state__description svelte-1qvq1kb">${$isAuthenticated ? `Add your first service to start monitoring` : `Login to start monitoring services`}</p> ${$isAuthenticated ? `<a href="/services" class="empty-state__action btn btn-primary svelte-1qvq1kb" data-svelte-h="svelte-p4tpjs">Add Service</a>` : ``}</div>` : `${``} <div class="services-grid svelte-1qvq1kb">${each(services, (service) => {
    return `<div class="service-tile svelte-1qvq1kb" style="${"background-color: " + escape(getStatusColor(service.lastStatus), true)}" tabindex="0" role="button" aria-label="${"Service " + escape(service.name, true) + ": " + escape(getStatusText(service.lastStatus), true) + ", " + escape(formatRelativeTime(service.lastCheckedAt), true)}"><div class="service-name svelte-1qvq1kb"${add_attribute("title", service.name, 0)}>${escape(truncateName(service.name))}</div> </div>`;
  })}</div>`}`}`}</main> ${``}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-344acd8b.js.map
