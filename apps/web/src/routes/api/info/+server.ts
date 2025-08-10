import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Failed to fetch info from API:', error);
    return json(
      {
        error: 'Failed to fetch system information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};