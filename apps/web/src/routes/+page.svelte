<script lang="ts">
  import { onMount } from 'svelte';
  import { usePollingServices } from '$lib/usePollingServices';
  import { isAuthenticated } from '$lib/auth';

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

  interface Config {
    thresholds: {
      fast: number;
      slow: number;
      timeout: number;
    };
    labels: {
      up: string;
      slow: string;
      down: string;
      notChecked: string;
    };
  }

  const { state, refresh } = usePollingServices();
  let config: Config | null = null;

  let overlayService: Service | null = null;
  let overlayPosition = { x: 0, y: 0 };
  let isTouch = false;

  $: ({ services, loading, error } = $state);

  const statusColors: Record<string, string> = {
    'UP': 'var(--status-up)',
    'SLOW': 'var(--status-slow)',
    'DOWN': 'var(--status-down)',
    'null': 'var(--status-unknown)'
  };

  function getStatusColor(status: string | null): string {
    const key: string = status ?? 'null';
    return statusColors[key] ?? statusColors['null'];
  }

  async function loadConfig() {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        config = await response.json();
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  onMount(() => {
    loadConfig();

    function handleClickOutside(event: MouseEvent) {
      if (overlayService && event.target instanceof Element) {
        const overlay = document.querySelector('.service-overlay');
        const tile = (event.target as Element).closest('.service-tile');

        if (!overlay?.contains(event.target) && !tile) {
          overlayService = null;
        }
      }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  function truncateName(name: string, maxLength: number = 20): string {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  }

  function formatRelativeTime(dateString: string | null): string {
    if (!dateString) return 'Never checked';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function getStatusText(status: string | null): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  function showOverlay(service: Service, event: MouseEvent | TouchEvent) {
    overlayService = service;

    if (event instanceof TouchEvent) {
      isTouch = true;
      const touch = event.touches[0] || event.changedTouches[0];
      if (touch) {
        overlayPosition = { x: touch.clientX, y: touch.clientY };
      }
    } else {
      isTouch = false;
      overlayPosition = { x: event.clientX, y: event.clientY };
    }
  }

  function hideOverlay() {
    if (!isTouch) {
      overlayService = null;
    }
  }

  function handleTileClick(service: Service, event: MouseEvent) {
    if (isTouch) {
      if (overlayService?.id === service.id) {
        overlayService = null;
      } else {
        showOverlay(service, event);
      }
    }
  }

  function handleKeydown(service: Service, event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (overlayService?.id === service.id) {
        overlayService = null;
      } else {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        overlayService = service;
        overlayPosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    } else if (event.key === 'Escape') {
      overlayService = null;
    }
  }
</script>

<svelte:head>
  <title>Dashboard - pingiMAP</title>
</svelte:head>


<main class="container">
  <div class="dashboard-header">
    <h2>Services Dashboard</h2>
    <button
      class="btn btn-primary"
      on:click={refresh}
      title="Refresh services"
      aria-label="Refresh services"
    >
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="loading-spinner" aria-hidden="true"></div>
      Loading services...
    </div>
  {:else if error}
    <div class="error">
      <div class="error-content">
        <h3>Failed to load monitoring data</h3>
        <p>Error: {error}</p>
      </div>
    </div>
  {:else if services.length === 0}
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">📊</div>
      <h3 class="empty-state__title">No services found</h3>
      <p class="empty-state__description">
        {#if $isAuthenticated}
          Add your first service to start monitoring
        {:else}
          Login to start monitoring services
        {/if}
      </p>
      {#if $isAuthenticated}
        <a href="/services" class="empty-state__action btn btn-primary">Add Service</a>
      {/if}
    </div>
  {:else}
    {#if config}
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: {statusColors['UP']}"></div>
          <span>Up ({config.labels.up})</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: {statusColors['SLOW']}"></div>
          <span>Slow ({config.labels.slow})</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: {statusColors['DOWN']}"></div>
          <span>Down ({config.labels.down})</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: {statusColors['null']}"></div>
          <span>Not checked</span>
        </div>
      </div>
    {/if}

    <div class="services-grid">
      {#each services as service}
        <div
          class="service-tile"
          style="background-color: {getStatusColor(service.lastStatus)}"
          tabindex="0"
          role="button"
          aria-label="Service {service.name}: {getStatusText(service.lastStatus)}, {formatRelativeTime(service.lastCheckedAt)}"
          on:mouseenter={(e) => showOverlay(service, e)}
          on:mouseleave={hideOverlay}
          on:click={(e) => handleTileClick(service, e)}
          on:touchstart={(e) => showOverlay(service, e)}
          on:keydown={(e) => handleKeydown(service, e)}
        >
          <div class="service-name" title={service.name}>
            {truncateName(service.name)}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

{#if overlayService}
  <div
    class="service-overlay"
    style="left: {overlayPosition.x}px; top: {overlayPosition.y}px;"
    role="tooltip"
    aria-labelledby="overlay-title"
  >
    <div class="overlay-content">
      <h3 id="overlay-title">{overlayService.name}</h3>
      <div class="overlay-field">
        <span class="overlay-label">URL:</span>
        <span class="overlay-value">{overlayService.url}</span>
      </div>
      <div class="overlay-field">
        <span class="overlay-label">Status:</span>
        <span class="overlay-value status-{overlayService.lastStatus?.toLowerCase() || 'unknown'}">
          {getStatusText(overlayService.lastStatus)}
        </span>
      </div>
      <div class="overlay-field">
        <span class="overlay-label">Latency:</span>
        <span class="overlay-value">
          {overlayService.lastLatencyMs !== null ? `${overlayService.lastLatencyMs}ms` : 'N/A'}
        </span>
      </div>
      <div class="overlay-field">
        <span class="overlay-label">Last checked:</span>
        <span class="overlay-value">{formatRelativeTime(overlayService.lastCheckedAt)}</span>
      </div>
    </div>
  </div>
{/if}

<style>


  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
  }

  .dashboard-header h2 {
    color: var(--gray-900);
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
  }


  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    font-weight: var(--font-weight-medium);
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-300);
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .service-tile {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
    transition: all var(--transition-base);
    cursor: pointer;
    outline: none;
    position: relative;
    overflow: hidden;
  }

  .service-tile::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  .service-tile:hover::before {
    opacity: 1;
  }

  .service-tile:hover, .service-tile:focus {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .service-tile:focus {
    box-shadow: var(--shadow-lg), 0 0 0 3px rgb(59 130 246 / 0.15);
  }

  .service-name {
    color: white;
    font-weight: var(--font-weight-semibold);
    text-align: center;
    padding: var(--space-4);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    word-break: break-word;
    position: relative;
    z-index: 1;
  }

  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--space-4);
    height: 200px;
    background: var(--gray-50);
    color: var(--gray-600);
    font-size: var(--font-size-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--gray-200);
    border-top: 3px solid var(--primary-500);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-8);
    background: white;
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-300);
    min-height: 300px;
  }

  .empty-state__icon {
    font-size: var(--space-12);
    margin-bottom: var(--space-4);
    opacity: 0.6;
  }

  .empty-state__title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--gray-900);
  }

  .empty-state__description {
    margin: 0 0 var(--space-6) 0;
    font-size: var(--font-size-base);
    color: var(--gray-500);
    max-width: 400px;
  }

  .empty-state__action {
    margin: 0;
  }

  .service-overlay {
    position: fixed;
    z-index: 1000;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    padding: 0;
    min-width: 280px;
    max-width: 400px;
    transform: translate(-50%, -100%);
    animation: fadeInUp var(--transition-base) ease-out;
    border: 1px solid var(--gray-200);
  }

  .overlay-content {
    padding: var(--space-4);
  }

  .overlay-content h3 {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--gray-900);
    word-break: break-word;
  }

  .overlay-field {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-2);
    gap: var(--space-3);
  }

  .overlay-field:last-child {
    margin-bottom: 0;
  }

  .overlay-label {
    font-weight: var(--font-weight-medium);
    color: var(--gray-600);
    font-size: var(--font-size-sm);
    flex-shrink: 0;
    min-width: 80px;
  }

  .overlay-value {
    color: var(--gray-900);
    font-size: var(--font-size-sm);
    text-align: right;
    word-break: break-all;
    flex: 1;
  }

  .overlay-value.status-up {
    color: var(--success-600);
    font-weight: var(--font-weight-medium);
  }

  .overlay-value.status-slow {
    color: var(--warning-600);
    font-weight: var(--font-weight-medium);
  }

  .overlay-value.status-down {
    color: var(--error-600);
    font-weight: var(--font-weight-medium);
  }

  .overlay-value.status-unknown {
    color: var(--gray-500);
    font-style: italic;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, -100%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%) translateY(0);
    }
  }

  @media (max-width: 768px) {
    .services-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--space-3);
    }

    .dashboard-header {
      flex-direction: column;
      gap: var(--space-4);
      align-items: flex-start;
    }

    .legend {
      gap: var(--space-4);
      padding: var(--space-3);
    }

    .legend-item {
      font-size: var(--font-size-xs);
    }

    .service-overlay {
      min-width: 260px;
      max-width: calc(100vw - var(--space-8));
      margin: 0 var(--space-4);
    }
  }

  @media (max-width: 480px) {
    .services-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--space-2);
    }

    .service-name {
      font-size: var(--font-size-sm);
      padding: var(--space-2);
    }

    .service-overlay {
      min-width: 240px;
      transform: translate(-50%, -100%);
    }

    .overlay-content {
      padding: var(--space-3);
    }

    .overlay-field {
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .overlay-label {
      min-width: 70px;
      font-size: var(--font-size-xs);
    }

    .overlay-value {
      font-size: var(--font-size-xs);
    }
  }
</style>