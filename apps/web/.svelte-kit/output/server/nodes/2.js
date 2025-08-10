

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.3c584d12.js","_app/immutable/chunks/scheduler.b5ecf4e6.js","_app/immutable/chunks/index.7d6cf7e9.js","_app/immutable/chunks/each.0775bae0.js","_app/immutable/chunks/usePollingServices.2f315274.js","_app/immutable/chunks/index.f4f048e8.js","_app/immutable/chunks/auth.34428d7b.js"];
export const stylesheets = ["_app/immutable/assets/2.e1b8b3bc.css"];
export const fonts = [];
