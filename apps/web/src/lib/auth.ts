import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Auth state store
export const isAuthenticated = writable<boolean>(false);
export const isLoading = writable<boolean>(false);

// Token management
const TOKEN_KEY = 'pingimap_admin_token';

export function getToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!browser) return;
  localStorage.setItem(TOKEN_KEY, token);
  isAuthenticated.set(true);
}

export function clearToken(): void {
  if (!browser) return;
  localStorage.removeItem(TOKEN_KEY);
  isAuthenticated.set(false);
}

// API helpers with auth
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Login function
export async function login(password: string): Promise<{ success: boolean; message: string }> {
  isLoading.set(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const result = await response.json();

    if (result.success && result.token) {
      setToken(result.token);
      return { success: true, message: 'Login successful' };
    } else {
      return { success: false, message: result.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error' };
  } finally {
    isLoading.set(false);
  }
}

// Logout function
export function logout(): void {
  clearToken();
}

// Check auth status
export async function checkAuthStatus(): Promise<void> {
  const token = getToken();
  if (!token) {
    isAuthenticated.set(false);
    return;
  }

  try {
    const response = await authenticatedFetch('/api/auth/status');
    const result = await response.json();
    isAuthenticated.set(result.authenticated || false);
  } catch (error) {
    console.error('Auth status check failed:', error);
    clearToken();
  }
}

// Initialize auth state on page load
if (browser) {
  checkAuthStatus();
}