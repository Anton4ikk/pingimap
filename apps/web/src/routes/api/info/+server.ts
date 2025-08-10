import type { RequestHandler } from './$types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json(); // Get JSON response
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to fetch info from API:', error);
    return new Response(JSON.stringify({
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};