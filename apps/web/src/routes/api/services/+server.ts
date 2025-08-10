import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async () => {
    try {
        const response = await fetch(`${API_BASE}/api/services`);

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch services');
        }

        const services = await response.json();
        return json(services);
    } catch (err) {
        console.error('Failed to fetch services:', err);
        throw error(500, 'Failed to fetch services');
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers.authorization = authHeader;
        }

        const response = await fetch(`${API_BASE}/api/services`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw error(response.status, errorData.message || 'Failed to create service');
        }

        const service = await response.json();
        return json(service, { status: 201 });
    } catch (err) {
        console.error('Failed to create service:', err);
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        throw error(500, 'Failed to create service');
    }
};