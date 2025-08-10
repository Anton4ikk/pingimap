

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.9d32472b.js","_app/immutable/chunks/scheduler.b5ecf4e6.js","_app/immutable/chunks/index.7d6cf7e9.js","_app/immutable/chunks/each.0775bae0.js","_app/immutable/chunks/stores.21af20b6.js","_app/immutable/chunks/singletons.3e15eff3.js","_app/immutable/chunks/index.f4f048e8.js","_app/immutable/chunks/usePollingServices.2f315274.js"];
export const stylesheets = ["_app/immutable/assets/3.64be43bf.css"];
export const fonts = [];
