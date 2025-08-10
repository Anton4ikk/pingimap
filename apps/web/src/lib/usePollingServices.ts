import { onDestroy, onMount } from 'svelte';
import { writable, type Writable } from 'svelte/store';

interface Service {
  id: string;
  name: string;
  url: string;
  lastLatencyMs: number | null;
  lastStatus: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PollingState {
  services: Service[];
  loading: boolean;
  error: string;
  isPolling: boolean;
}

export function usePollingServices() {
  const state: Writable<PollingState> = writable({
    services: [],
    loading: true,
    error: '',
    isPolling: false
  });

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let currentController: AbortController | null = null;

  const fetchServices = async (silent = false) => {
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();

    if (!silent) {
      state.update(s => ({ ...s, loading: true, error: '' }));
    }

    try {
      const response = await fetch('/api/services', {
        signal: currentController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const services = await response.json();

      state.update(s => ({
        ...s,
        services,
        loading: false,
        error: ''
      }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      state.update(s => ({
        ...s,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const startPolling = () => {
    if (intervalId) return;

    state.update(s => ({ ...s, isPolling: true }));

    intervalId = setInterval(() => {
      fetchServices(true);
    }, 5000);
  };

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (currentController) {
      currentController.abort();
      currentController = null;
    }

    state.update(s => ({ ...s, isPolling: false }));
  };

  const refresh = () => {
    fetchServices(false);
  };

  onMount(() => {
    fetchServices();
    startPolling();
  });

  onDestroy(() => {
    stopPolling();
  });

  return {
    state,
    refresh,
    startPolling,
    stopPolling
  };
}