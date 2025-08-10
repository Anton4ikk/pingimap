<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { usePollingServices } from '$lib/usePollingServices';

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
    'UP': '#22c55e',
    'SLOW': '#f59e0b',
    'DOWN': '#ef4444',
    'null': '#9ca3af'
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

<nav class="top-nav">
  <div class="nav-container">
    <div class="nav-brand">
      <img src="/logo.png" alt="pingiMAP Logo" class="nav-logo" />
    </div>
    <div class="nav-links">
      <a href="/" class:active={$page.url.pathname === '/'}>Dashboard</a>
      <a href="/services" class:active={$page.url.pathname.startsWith('/services')}>Services</a>
    </div>
  </div>
</nav>

<main class="dashboard">
  <div class="dashboard-header">
    <h2>Services Dashboard</h2>
    <button
      class="refresh-btn"
      on:click={refresh}
      title="Refresh services"
      aria-label="Refresh services"
    >
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="loading">Loading services...</div>
  {:else if error}
    <div class="error">
      <div class="error-content">
        <h3>Failed to load monitoring data</h3>
        <p>Error: {error}</p>
      </div>
    </div>
  {:else if services.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-message">
        <h3>No services added yet</h3>
        <p>Start monitoring your services by adding them first.</p>
        <a href="/services" class="btn btn-primary empty-action">Add Service</a>
      </div>
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
  .top-nav {
    background: #2c3e50;
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .nav-logo {
    height: 5rem;
    width: auto;
  }

  .app-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-links a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .nav-links a:hover {
    background: rgba(255,255,255,0.1);
  }

  .nav-links a.active {
    background: #3498db;
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .dashboard h2 {
    color: #2c3e50;
    margin: 0;
  }

  .refresh-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .refresh-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  }

  .refresh-btn:active {
    transform: translateY(0);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 500;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .service-tile {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    outline: none;
  }

  .service-tile:hover, .service-tile:focus {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .service-tile:focus {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(52, 152, 219, 0.3);
  }

  .service-name {
    color: white;
    font-weight: 600;
    text-align: center;
    padding: 1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    word-break: break-word;
  }

  .loading, .error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    background: #f8f9fa;
    color: #6c757d;
    font-size: 1.2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .error {
    background: #fee;
    color: #c53030;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 3rem 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    opacity: 0.6;
  }

  .empty-message {
    max-width: 400px;
  }

  .empty-message h3 {
    margin: 0 0 0.75rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .empty-message p {
    margin: 0 0 1.5rem 0;
    color: #64748b;
    font-size: 1rem;
    line-height: 1.5;
  }

  .empty-action {
    margin-top: 0.5rem;
  }

  .service-overlay {
    position: fixed;
    z-index: 1000;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
    padding: 0;
    min-width: 280px;
    max-width: 400px;
    transform: translate(-50%, -100%);
    animation: fadeInUp 0.2s ease-out;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .overlay-content {
    padding: 16px;
  }

  .overlay-content h3 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    word-break: break-word;
  }

  .overlay-field {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 12px;
  }

  .overlay-field:last-child {
    margin-bottom: 0;
  }

  .overlay-label {
    font-weight: 500;
    color: #64748b;
    font-size: 0.875rem;
    flex-shrink: 0;
    min-width: 80px;
  }

  .overlay-value {
    color: #1e293b;
    font-size: 0.875rem;
    text-align: right;
    word-break: break-all;
    flex: 1;
  }

  .overlay-value.status-up {
    color: #16a34a;
    font-weight: 500;
  }

  .overlay-value.status-slow {
    color: #d97706;
    font-weight: 500;
  }

  .overlay-value.status-down {
    color: #dc2626;
    font-weight: 500;
  }

  .overlay-value.status-unknown {
    color: #64748b;
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
      gap: 0.75rem;
    }

    .dashboard {
      padding: 1rem;
    }

    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .refresh-btn {
      font-size: 0.8rem;
      padding: 0.6rem 1rem;
    }

    .legend {
      gap: 1rem;
      padding: 0.75rem;
    }

    .legend-item {
      font-size: 0.8rem;
    }

    .nav-container {
      padding: 0 1rem;
    }

    .nav-links {
      gap: 1rem;
    }

    .service-overlay {
      min-width: 260px;
      max-width: calc(100vw - 2rem);
      margin: 0 1rem;
    }
  }

  @media (max-width: 480px) {
    .services-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.5rem;
    }

    .service-name {
      font-size: 0.9rem;
      padding: 0.5rem;
    }

    .service-overlay {
      min-width: 240px;
      transform: translate(-50%, -100%);
    }

    .overlay-content {
      padding: 12px;
    }

    .overlay-field {
      gap: 8px;
      margin-bottom: 6px;
    }

    .overlay-label {
      min-width: 70px;
      font-size: 0.8rem;
    }

    .overlay-value {
      font-size: 0.8rem;
    }
  }
</style>