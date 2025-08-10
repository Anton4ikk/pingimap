export const manifest = (() => {
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
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
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
				endpoint: __memo(() => import('./entries/endpoints/api/auth/login/_server.ts.js'))
			},
			{
				id: "/api/auth/status",
				pattern: /^\/api\/auth\/status\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/status/_server.ts.js'))
			},
			{
				id: "/api/config",
				pattern: /^\/api\/config\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/config/_server.ts.js'))
			},
			{
				id: "/api/info",
				pattern: /^\/api\/info\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/info/_server.ts.js'))
			},
			{
				id: "/api/services",
				pattern: /^\/api\/services\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/services/_server.ts.js'))
			},
			{
				id: "/api/services/bulk",
				pattern: /^\/api\/services\/bulk\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/services/bulk/_server.ts.js'))
			},
			{
				id: "/api/services/[id]",
				pattern: /^\/api\/services\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/services/_id_/_server.ts.js'))
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
