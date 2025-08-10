import { j as json } from "../../../../../chunks/index.js";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    return json(result, { status: response.status });
  } catch (error) {
    console.error("Auth login proxy error:", error);
    return json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
export {
  POST
};
