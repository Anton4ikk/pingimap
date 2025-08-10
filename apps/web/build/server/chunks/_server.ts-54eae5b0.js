import { j as json } from './index-d7f43214.js';

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const GET = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");
    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers.authorization = authHeader;
    }
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: "GET",
      headers
    });
    const result = await response.json();
    return json(result, { status: response.status });
  } catch (error) {
    console.error("Auth status proxy error:", error);
    return json(
      { authenticated: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};

export { GET };
//# sourceMappingURL=_server.ts-54eae5b0.js.map
