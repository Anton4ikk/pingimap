

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/services/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.0d436e2c.js","_app/immutable/chunks/scheduler.b5ecf4e6.js","_app/immutable/chunks/index.7d6cf7e9.js","_app/immutable/chunks/each.0775bae0.js","_app/immutable/chunks/singletons.3e15eff3.js","_app/immutable/chunks/index.f4f048e8.js","_app/immutable/chunks/auth.34428d7b.js"];
export const stylesheets = ["_app/immutable/assets/5.98353b58.css"];
export const fonts = [];
