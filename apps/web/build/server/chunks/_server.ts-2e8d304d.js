import { e as error, j as json } from './index-d7f43214.js';

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    if (!body.services || !Array.isArray(body.services)) {
      throw error(400, "Invalid request: services array is required");
    }
    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers.authorization = authHeader;
    }
    const response = await fetch(`${API_BASE}/api/services/bulk`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw error(response.status, errorData.message || "Failed to import services");
    }
    const result = await response.json();
    return json(result);
  } catch (err) {
    console.error("Failed to import services:", err);
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }
    throw error(500, "Failed to import services");
  }
};

export { POST };
//# sourceMappingURL=_server.ts-2e8d304d.js.map
