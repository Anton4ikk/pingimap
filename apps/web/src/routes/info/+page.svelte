<script lang="ts">
  import { onMount } from 'svelte';

  interface InfoData {
    status: string;
    timestamp: string;
    database: string;
    nats: string;
    monitor: {
      running: boolean;
      interval: string;
      thresholds: {
        fast: number;
        slow: number;
        timeout: number;
      };
    };
    dbPingTime?: number;
    serviceCount?: number;
  }

  let infoData: InfoData | null = null;
  let loading = true;
  let error: string | null = null;

  async function fetchInfo() {
    try {
      loading = true;
      error = null;
      const response = await fetch('/api/info');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      infoData = await response.json();
    } catch (err) {
      console.error('Failed to load info:', err);
      error = err instanceof Error ? err.message : 'Failed to load info';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchInfo();
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case 'ok': return 'var(--success-500)';
      case 'error': return 'var(--error-500)';
      default: return 'var(--gray-500)';
    }
  }

  function getConnectionColor(connection: string): string {
    switch (connection) {
      case 'connected': return 'var(--success-500)';
      case 'disconnected': return 'var(--error-500)';
      default: return 'var(--gray-500)';
    }
  }

  function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
</script>

<svelte:head>
  <title>System Info - pingiMAP</title>
</svelte:head>


<main class="container">
  <div class="info-header">
    <h2>System Information</h2>
    <button
      class="btn btn-primary"
      on:click={fetchInfo}
      disabled={loading}
      title="Refresh info"
      aria-label="Refresh system information"
    >
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="loading-spinner" aria-hidden="true"></div>
      Loading system info...
    </div>
  {:else if error}
    <div class="error">
      <div class="error-content">
        <h3>Failed to load system information</h3>
        <p>Error: {error}</p>
      </div>
    </div>
  {:else if infoData}
    <div class="info-content">
      <div class="status-section">
        <div class="status-header">
          <h3>Overall Status</h3>
          <div class="status-indicator" style="background-color: {getStatusColor(infoData.status)}">
            {infoData.status.toUpperCase()}
          </div>
        </div>
        <div class="timestamp">
          Last checked: {formatTimestamp(infoData.timestamp)}
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <h4>Database</h4>
            <div class="connection-status" style="color: {getConnectionColor(infoData.database)}">
              {infoData.database}
            </div>
          </div>
          {#if infoData.dbPingTime !== undefined}
            <div class="metric-value">
              <span class="value">{infoData.dbPingTime}</span>
              <span class="unit">ms</span>
              <span class="label">ping time</span>
            </div>
          {/if}
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h4>NATS</h4>
            <div class="connection-status" style="color: {getConnectionColor(infoData.nats)}">
              {infoData.nats}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h4>Monitor</h4>
            <div class="connection-status" style="color: {infoData.monitor.running ? getConnectionColor('connected') : getConnectionColor('disconnected')}">
              {infoData.monitor.running ? 'running' : 'stopped'}
            </div>
          </div>
          <div class="metric-value">
            <span class="value">{infoData.monitor.interval}</span>
            <span class="label">interval</span>
          </div>
        </div>

        {#if infoData.serviceCount !== undefined}
          <div class="metric-card">
            <div class="metric-header">
              <h4>Services</h4>
            </div>
            <div class="metric-value">
              <span class="value">{infoData.serviceCount}</span>
              <span class="label">total services</span>
            </div>
          </div>
        {/if}
      </div>

      {#if infoData.monitor.thresholds}
        <div class="thresholds-section">
          <h3>Monitoring Thresholds</h3>
          <div class="thresholds-grid">
            <div class="threshold-item">
              <span class="threshold-label">Fast</span>
              <span class="threshold-value">≤ {infoData.monitor.thresholds.fast}ms</span>
            </div>
            <div class="threshold-item">
              <span class="threshold-label">Slow</span>
              <span class="threshold-value">{infoData.monitor.thresholds.fast + 1}-{infoData.monitor.thresholds.slow}ms</span>
            </div>
            <div class="threshold-item">
              <span class="threshold-label">Timeout</span>
              <span class="threshold-value">{infoData.monitor.thresholds.timeout}ms</span>
            </div>
          </div>
        </div>
      {/if}

      <div class="source-section">
        <h3>Source Code</h3>
        <div class="source-content">
          <div class="source-item">
            <div class="source-info">
              <h4>GitHub Repository</h4>
              <p class="source-description">
                View source code, report issues, or contribute to PingiMap development
              </p>
            </div>
            <a
              href="https://github.com/Anton4ikk/pingimap"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost source-link"
              aria-label="Open GitHub repository in new tab"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
  }

  .info-header h2 {
    color: var(--gray-900);
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
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


  .info-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .status-section {
    background: white;
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .status-header h3 {
    margin: 0;
    color: var(--gray-900);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .status-indicator {
    padding: var(--space-2) var(--space-4);
    background: var(--success-500);
    color: white;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
  }

  .timestamp {
    color: var(--gray-500);
    font-size: var(--font-size-sm);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .metric-card {
    background: white;
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .metric-header h4 {
    margin: 0;
    color: var(--gray-900);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .connection-status {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-transform: capitalize;
  }

  .metric-value {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .metric-value .value {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--gray-900);
    line-height: 1;
  }

  .metric-value .unit {
    font-size: var(--font-size-lg);
    color: var(--gray-500);
    margin-left: var(--space-1);
  }

  .metric-value .label {
    font-size: var(--font-size-sm);
    color: var(--gray-500);
    font-weight: var(--font-weight-medium);
  }

  .thresholds-section {
    background: white;
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }

  .thresholds-section h3 {
    margin: 0 0 var(--space-4) 0;
    color: var(--gray-900);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .thresholds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .threshold-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--gray-50);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
  }

  .threshold-label {
    font-weight: var(--font-weight-medium);
    color: var(--gray-700);
    font-size: var(--font-size-sm);
  }

  .threshold-value {
    font-weight: var(--font-weight-semibold);
    color: var(--gray-900);
    font-size: var(--font-size-sm);
  }

  .source-section {
    background: white;
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }

  .source-section h3 {
    margin: 0 0 var(--space-4) 0;
    color: var(--gray-900);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .source-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .source-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }

  .source-info {
    flex: 1;
  }

  .source-info h4 {
    margin: 0 0 var(--space-2) 0;
    color: var(--gray-900);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .source-description {
    margin: 0;
    color: var(--gray-600);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
  }

  .source-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .source-link svg {
    transition: transform var(--transition-base);
  }

  .source-link:hover svg {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    .info-header {
      flex-direction: column;
      gap: var(--space-4);
      align-items: flex-start;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .status-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .thresholds-grid {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .source-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .source-link {
      width: 100%;
      justify-content: center;
    }
  }
</style>