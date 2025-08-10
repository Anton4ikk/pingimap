const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","logo.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.9b97cdd3.js","app":"_app/immutable/entry/app.23a292e4.js","imports":["_app/immutable/entry/start.9b97cdd3.js","_app/immutable/chunks/scheduler.b5ecf4e6.js","_app/immutable/chunks/singletons.3e15eff3.js","_app/immutable/chunks/index.f4f048e8.js","_app/immutable/entry/app.23a292e4.js","_app/immutable/chunks/scheduler.b5ecf4e6.js","_app/immutable/chunks/index.7d6cf7e9.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-1c30f7f2.js')),
			__memo(() => import('./chunks/1-af76b787.js')),
			__memo(() => import('./chunks/2-343d7311.js')),
			__memo(() => import('./chunks/3-4308f2d4.js')),
			__memo(() => import('./chunks/4-765819a2.js')),
			__memo(() => import('./chunks/5-039b298f.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-c5e850cf.js'))
			},
			{
				id: "/api/auth/status",
				pattern: /^\/api\/auth\/status\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-54eae5b0.js'))
			},
			{
				id: "/api/config",
				pattern: /^\/api\/config\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-67a9f288.js'))
			},
			{
				id: "/api/info",
				pattern: /^\/api\/info\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-d5a531a3.js'))
			},
			{
				id: "/api/services",
				pattern: /^\/api\/services\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-16135e86.js'))
			},
			{
				id: "/api/services/bulk",
				pattern: /^\/api\/services\/bulk\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-2e8d304d.js'))
			},
			{
				id: "/api/services/[id]",
				pattern: /^\/api\/services\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-c2b1ef8c.js'))
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/info",
				pattern: /^\/info\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/services",
				pattern: /^\/services\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
