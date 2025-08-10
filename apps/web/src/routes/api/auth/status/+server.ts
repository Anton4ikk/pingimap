import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    return json(result, { status: response.status });
  } catch (error) {
    console.error('Auth status proxy error:', error);
    return json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};