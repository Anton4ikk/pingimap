import { e as error, j as json } from './index-d7f43214.js';

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const GET = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/config`);
    if (!response.ok) {
      throw error(response.status, "Failed to fetch config");
    }
    const config = await response.json();
    return json(config);
  } catch (err) {
    console.error("Failed to fetch config:", err);
    throw error(500, "Failed to fetch config");
  }
};

export { GET };
//# sourceMappingURL=_server.ts-67a9f288.js.map
