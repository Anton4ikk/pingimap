import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async () => {
    try {
        const response = await fetch(`${API_BASE}/api/config`);

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch config');
        }

        const config = await response.json();
        return json(config);
    } catch (err) {
        console.error('Failed to fetch config:', err);
        throw error(500, 'Failed to fetch config');
    }
};