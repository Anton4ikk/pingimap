import { c as create_ssr_component, a as subscribe, e as escape, d as each, b as add_attribute } from './ssr-24bd32bc.js';
import { p as page } from './stores-57b8f08b.js';
import { u as usePollingServices } from './usePollingServices-21732ed4.js';
import './index2-67843571.js';

const css = {
  code: ".top-nav.svelte-mkrsgl.svelte-mkrsgl{background:#2c3e50;color:white;padding:1rem 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.nav-container.svelte-mkrsgl.svelte-mkrsgl{max-width:1200px;margin:0 auto;padding:0 2rem;display:flex;justify-content:space-between;align-items:center}.nav-brand.svelte-mkrsgl.svelte-mkrsgl{display:flex;align-items:center;gap:0.75rem}.nav-logo.svelte-mkrsgl.svelte-mkrsgl{height:5rem;width:auto}.app-title.svelte-mkrsgl.svelte-mkrsgl{margin:0;font-size:1.5rem;font-weight:bold}.nav-links.svelte-mkrsgl.svelte-mkrsgl{display:flex;gap:2rem}.nav-links.svelte-mkrsgl a.svelte-mkrsgl{color:white;text-decoration:none;padding:0.5rem 1rem;border-radius:4px;transition:background-color 0.2s}.nav-links.svelte-mkrsgl a.svelte-mkrsgl:hover{background:rgba(255,255,255,0.1)}.nav-links.svelte-mkrsgl a.active.svelte-mkrsgl{background:#3498db}.dashboard.svelte-mkrsgl.svelte-mkrsgl{max-width:1200px;margin:0 auto;padding:2rem}.dashboard-header.svelte-mkrsgl.svelte-mkrsgl{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem}.dashboard.svelte-mkrsgl h2.svelte-mkrsgl{color:#2c3e50;margin:0}.refresh-btn.svelte-mkrsgl.svelte-mkrsgl{background:#3498db;color:white;border:none;padding:0.75rem 1.25rem;border-radius:6px;cursor:pointer;font-size:0.9rem;font-weight:500;transition:all 0.2s ease;display:flex;align-items:center;gap:0.5rem}.refresh-btn.svelte-mkrsgl.svelte-mkrsgl:hover{background:#2980b9;transform:translateY(-1px);box-shadow:0 2px 8px rgba(52, 152, 219, 0.3)}.refresh-btn.svelte-mkrsgl.svelte-mkrsgl:active{transform:translateY(0)}.legend.svelte-mkrsgl.svelte-mkrsgl{display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:1.5rem;padding:1rem;background:#f8f9fa;border-radius:8px;border:1px solid rgba(0, 0, 0, 0.1)}.legend-item.svelte-mkrsgl.svelte-mkrsgl{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:#4a5568;font-weight:500}.legend-color.svelte-mkrsgl.svelte-mkrsgl{width:16px;height:16px;border-radius:4px;border:1px solid rgba(0, 0, 0, 0.2)}.services-grid.svelte-mkrsgl.svelte-mkrsgl{display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:1rem}.service-tile.svelte-mkrsgl.svelte-mkrsgl{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid rgba(0, 0, 0, 0.1);transition:transform 0.2s, box-shadow 0.2s;cursor:pointer;outline:none}.service-tile.svelte-mkrsgl.svelte-mkrsgl:hover,.service-tile.svelte-mkrsgl.svelte-mkrsgl:focus{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0, 0, 0, 0.15)}.service-tile.svelte-mkrsgl.svelte-mkrsgl:focus{box-shadow:0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(52, 152, 219, 0.3)}.service-name.svelte-mkrsgl.svelte-mkrsgl{color:white;font-weight:600;text-align:center;padding:1rem;text-shadow:0 1px 2px rgba(0, 0, 0, 0.3);word-break:break-word}.loading.svelte-mkrsgl.svelte-mkrsgl,.error.svelte-mkrsgl.svelte-mkrsgl{display:flex;justify-content:center;align-items:center;height:200px;background:#f8f9fa;color:#6c757d;font-size:1.2rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.error.svelte-mkrsgl.svelte-mkrsgl{background:#fee;color:#c53030}.empty-state.svelte-mkrsgl.svelte-mkrsgl{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:3rem 2rem;background:#f8f9fa;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);text-align:center}.empty-icon.svelte-mkrsgl.svelte-mkrsgl{font-size:3rem;margin-bottom:1.5rem;opacity:0.6}.empty-message.svelte-mkrsgl.svelte-mkrsgl{max-width:400px}.empty-message.svelte-mkrsgl h3.svelte-mkrsgl{margin:0 0 0.75rem 0;color:#2c3e50;font-size:1.25rem;font-weight:600}.empty-message.svelte-mkrsgl p.svelte-mkrsgl{margin:0 0 1.5rem 0;color:#64748b;font-size:1rem;line-height:1.5}.empty-action.svelte-mkrsgl.svelte-mkrsgl{margin-top:0.5rem}.service-overlay.svelte-mkrsgl.svelte-mkrsgl{position:fixed;z-index:1000;background:white;border-radius:8px;box-shadow:0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);padding:0;min-width:280px;max-width:400px;transform:translate(-50%, -100%);animation:svelte-mkrsgl-fadeInUp 0.2s ease-out;border:1px solid rgba(0, 0, 0, 0.08)}.overlay-content.svelte-mkrsgl.svelte-mkrsgl{padding:16px}.overlay-content.svelte-mkrsgl h3.svelte-mkrsgl{margin:0 0 12px 0;font-size:1.1rem;font-weight:600;color:#2c3e50;word-break:break-word}.overlay-field.svelte-mkrsgl.svelte-mkrsgl{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:12px}.overlay-field.svelte-mkrsgl.svelte-mkrsgl:last-child{margin-bottom:0}.overlay-label.svelte-mkrsgl.svelte-mkrsgl{font-weight:500;color:#64748b;font-size:0.875rem;flex-shrink:0;min-width:80px}.overlay-value.svelte-mkrsgl.svelte-mkrsgl{color:#1e293b;font-size:0.875rem;text-align:right;word-break:break-all;flex:1}.overlay-value.status-up.svelte-mkrsgl.svelte-mkrsgl{color:#16a34a;font-weight:500}.overlay-value.status-slow.svelte-mkrsgl.svelte-mkrsgl{color:#d97706;font-weight:500}.overlay-value.status-down.svelte-mkrsgl.svelte-mkrsgl{color:#dc2626;font-weight:500}.overlay-value.status-unknown.svelte-mkrsgl.svelte-mkrsgl{color:#64748b;font-style:italic}@keyframes svelte-mkrsgl-fadeInUp{from{opacity:0;transform:translate(-50%, -100%) translateY(10px)}to{opacity:1;transform:translate(-50%, -100%) translateY(0)}}@media(max-width: 768px){.services-grid.svelte-mkrsgl.svelte-mkrsgl{grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:0.75rem}.dashboard.svelte-mkrsgl.svelte-mkrsgl{padding:1rem}.dashboard-header.svelte-mkrsgl.svelte-mkrsgl{flex-direction:column;gap:1rem;align-items:flex-start}.refresh-btn.svelte-mkrsgl.svelte-mkrsgl{font-size:0.8rem;padding:0.6rem 1rem}.legend.svelte-mkrsgl.svelte-mkrsgl{gap:1rem;padding:0.75rem}.legend-item.svelte-mkrsgl.svelte-mkrsgl{font-size:0.8rem}.nav-container.svelte-mkrsgl.svelte-mkrsgl{padding:0 1rem}.nav-links.svelte-mkrsgl.svelte-mkrsgl{gap:1rem}.service-overlay.svelte-mkrsgl.svelte-mkrsgl{min-width:260px;max-width:calc(100vw - 2rem);margin:0 1rem}}@media(max-width: 480px){.services-grid.svelte-mkrsgl.svelte-mkrsgl{grid-template-columns:repeat(auto-fill, minmax(120px, 1fr));gap:0.5rem}.service-name.svelte-mkrsgl.svelte-mkrsgl{font-size:0.9rem;padding:0.5rem}.service-overlay.svelte-mkrsgl.svelte-mkrsgl{min-width:240px;transform:translate(-50%, -100%)}.overlay-content.svelte-mkrsgl.svelte-mkrsgl{padding:12px}.overlay-field.svelte-mkrsgl.svelte-mkrsgl{gap:8px;margin-bottom:6px}.overlay-label.svelte-mkrsgl.svelte-mkrsgl{min-width:70px;font-size:0.8rem}.overlay-value.svelte-mkrsgl.svelte-mkrsgl{font-size:0.8rem}}",
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
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const { state, refresh } = usePollingServices();
  $$unsubscribe_state = subscribe(state, (value) => $state = value);
  const statusColors = {
    "UP": "#22c55e",
    "SLOW": "#f59e0b",
    "DOWN": "#ef4444",
    "null": "#9ca3af"
  };
  function getStatusColor(status) {
    const key = status ?? "null";
    return statusColors[key] ?? statusColors["null"];
  }
  $$result.css.add(css);
  ({ services, loading, error } = $state);
  $$unsubscribe_state();
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-1yae48b_START -->${$$result.title = `<title>Dashboard - pingiMAP</title>`, ""}<!-- HEAD_svelte-1yae48b_END -->`, ""} <nav class="top-nav svelte-mkrsgl"><div class="nav-container svelte-mkrsgl"><div class="nav-brand svelte-mkrsgl" data-svelte-h="svelte-tklqds"><img src="/logo.png" alt="pingiMAP Logo" class="nav-logo svelte-mkrsgl"></div> <div class="nav-links svelte-mkrsgl"><a href="/" class="${["svelte-mkrsgl", $page.url.pathname === "/" ? "active" : ""].join(" ").trim()}" data-svelte-h="svelte-1cb9f5c">Dashboard</a> <a href="/services" class="${[
    "svelte-mkrsgl",
    $page.url.pathname.startsWith("/services") ? "active" : ""
  ].join(" ").trim()}" data-svelte-h="svelte-1lo2dff">Services</a></div></div></nav> <main class="dashboard svelte-mkrsgl"><div class="dashboard-header svelte-mkrsgl"><h2 class="svelte-mkrsgl" data-svelte-h="svelte-1utspdy">Services Dashboard</h2> <button class="refresh-btn svelte-mkrsgl" title="Refresh services" aria-label="Refresh services" data-svelte-h="svelte-1w43g05">Refresh</button></div> ${loading ? `<div class="loading svelte-mkrsgl" data-svelte-h="svelte-19m8021">Loading services...</div>` : `${error ? `<div class="error svelte-mkrsgl"><div class="error-content"><h3 data-svelte-h="svelte-kkj1sw">Failed to load monitoring data</h3> <p>Error: ${escape(error)}</p></div></div>` : `${services.length === 0 ? `<div class="empty-state svelte-mkrsgl" data-svelte-h="svelte-g3dhjl"><div class="empty-icon svelte-mkrsgl">📊</div> <div class="empty-message svelte-mkrsgl"><h3 class="svelte-mkrsgl">No services added yet</h3> <p class="svelte-mkrsgl">Start monitoring your services by adding them first.</p> <a href="/services" class="btn btn-primary empty-action svelte-mkrsgl">Add Service</a></div></div>` : `${``} <div class="services-grid svelte-mkrsgl">${each(services, (service) => {
    return `<div class="service-tile svelte-mkrsgl" style="${"background-color: " + escape(getStatusColor(service.lastStatus), true)}" tabindex="0" role="button" aria-label="${"Service " + escape(service.name, true) + ": " + escape(getStatusText(service.lastStatus), true) + ", " + escape(formatRelativeTime(service.lastCheckedAt), true)}"><div class="service-name svelte-mkrsgl"${add_attribute("title", service.name, 0)}>${escape(truncateName(service.name))}</div> </div>`;
  })}</div>`}`}`}</main> ${``}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-28b7f19e.js.map
