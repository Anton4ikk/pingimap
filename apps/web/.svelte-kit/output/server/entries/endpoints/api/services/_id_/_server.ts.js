import { e as error, j as json } from "../../../../../chunks/index.js";
const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const DELETE = async ({ params, request }) => {
  try {
    const { id } = params;
    const authHeader = request.headers.get("authorization");
    const headers = {};
    if (authHeader) {
      headers.authorization = authHeader;
    }
    const response = await fetch(`${API_BASE}/api/services/${id}`, {
      method: "DELETE",
      headers
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw error(response.status, errorData.message || "Failed to delete service");
    }
    const result = await response.json();
    return json(result);
  } catch (err) {
    console.error("Failed to delete service:", err);
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }
    throw error(500, "Failed to delete service");
  }
};
const PUT = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const headers = {
      "Content-Type": "application/json"
    };
    if (authHeader) {
      headers.authorization = authHeader;
    }
    const response = await fetch(`${API_BASE}/api/services/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw error(response.status, errorData.message || "Failed to update service");
    }
    const service = await response.json();
    return json(service);
  } catch (err) {
    console.error("Failed to update service:", err);
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }
    throw error(500, "Failed to update service");
  }
};
export {
  DELETE,
  PUT
};
