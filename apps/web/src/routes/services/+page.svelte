<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { isAuthenticated, authenticatedFetch } from '$lib/auth';

  interface Service {
    id: string;
    name: string;
    url: string;
    lastLatencyMs: number | null;
    lastStatus: string | null;
    lastHttpCode: number | null;
    lastCheckedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }

  let services: Service[] = [];
  let name = '';
  let url = '';
  let loading = false;
  let toast = { show: false, message: '', type: 'success' as 'success' | 'error' };
  let confirmDialog = { show: false, serviceId: '', serviceName: '' };
  let importDialog = { show: false };
  let importFile: File | null = null;
  let editDialog = { show: false, service: null as Service | null };
  let editName = '';
  let editUrl = '';

  function isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    toast = { show: true, message, type };
    setTimeout(() => {
      toast.show = false;
    }, 3000);
  }

  async function loadServices() {
    try {
      const response = await authenticatedFetch('/api/services');
      if (response.ok) {
        services = await response.json();
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  }

  async function addService() {
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    if (!url.trim()) {
      showToast('URL is required', 'error');
      return;
    }

    if (!isValidUrl(url)) {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    loading = true;
    try {
      const response = await authenticatedFetch('/api/services', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), url: url.trim() })
      });

      if (response.ok) {
        showToast('Service added successfully', 'success');
        name = '';
        url = '';
        await loadServices();
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to add service', 'error');
      }
    } catch (error) {
      showToast('Failed to add service', 'error');
    } finally {
      loading = false;
    }
  }

  function showDeleteConfirm(id: string, serviceName: string) {
    confirmDialog = { show: true, serviceId: id, serviceName };
  }

  function hideDeleteConfirm() {
    confirmDialog = { show: false, serviceId: '', serviceName: '' };
  }

  function showImportDialog() {
    importDialog = { show: true };
    importFile = null;
  }

  function hideImportDialog() {
    importDialog = { show: false };
    importFile = null;
  }

  function showEditDialog(service: Service) {
    editDialog = { show: true, service };
    editName = service.name;
    editUrl = service.url;
  }

  function hideEditDialog() {
    editDialog = { show: false, service: null };
    editName = '';
    editUrl = '';
  }

  function exportServices() {
    const exportData = services.map(service => ({
      name: service.name,
      url: service.url
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Services exported successfully', 'success');
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      importFile = target.files[0];
    }
  }

  async function editService() {
    if (!editDialog.service) return;

    if (!editName.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    if (!editUrl.trim()) {
      showToast('URL is required', 'error');
      return;
    }

    if (!isValidUrl(editUrl)) {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    loading = true;
    try {
      const response = await authenticatedFetch(`/api/services/${editDialog.service.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName.trim(), url: editUrl.trim() })
      });

      if (response.ok) {
        showToast('Service updated successfully', 'success');
        hideEditDialog();
        await loadServices();
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to update service', 'error');
      }
    } catch (error) {
      showToast('Failed to update service', 'error');
    } finally {
      loading = false;
    }
  }

  async function importServices() {
    if (!importFile) {
      showToast('Please select a file to import', 'error');
      return;
    }

    if (!importFile.name.endsWith('.json')) {
      showToast('Please select a JSON file', 'error');
      return;
    }

    try {
      const text = await importFile.text();
      const importData = JSON.parse(text);

      if (!Array.isArray(importData)) {
        showToast('Invalid file format. Expected an array of services.', 'error');
        return;
      }

      for (const service of importData) {
        if (!service.name || !service.url) {
          showToast('Invalid service data. Each service must have name and url.', 'error');
          return;
        }

        if (!isValidUrl(service.url)) {
          showToast(`Invalid URL: ${service.url}`, 'error');
          return;
        }
      }

      loading = true;

      const response = await authenticatedFetch('/api/services/bulk', {
        method: 'POST',
        body: JSON.stringify({ services: importData })
      });

      if (response.ok) {
        const result = await response.json();
        hideImportDialog();
        await loadServices();
        showToast(`Successfully imported ${result.imported} services (${result.skipped} skipped)`, 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to import services', 'error');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        showToast('Invalid JSON file format', 'error');
      } else {
        showToast('Failed to import services', 'error');
      }
    } finally {
      loading = false;
    }
  }

  async function deleteService(id: string) {
    const originalServices = [...services];

    services = services.filter(service => service.id !== id);
    hideDeleteConfirm();

    try {
      const response = await authenticatedFetch(`/api/services/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Service deleted successfully', 'success');
      } else {
        services = originalServices;
        showToast('Failed to delete service', 'error');
      }
    } catch (error) {
      services = originalServices;
      showToast('Failed to delete service', 'error');
    }
  }

  onMount(() => {
    // Check authentication first
    if (browser && !$isAuthenticated) {
      goto('/');
      return;
    }
    loadServices();
  });
</script>

<svelte:head>
  <title>Services - pingiMAP</title>
</svelte:head>

{#if $isAuthenticated}
<main class="container">
  <h1>Services</h1>

  <!-- Add Service Card -->
  <div class="card">
    <h2>Add Service</h2>
    <form on:submit|preventDefault={addService}>
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input
          type="text"
          id="name"
          class="form-input"
          bind:value={name}
          placeholder="Enter service name"
          required
        />
      </div>

      <div class="form-group">
        <label for="url" class="form-label">URL</label>
        <input
          type="url"
          id="url"
          class="form-input"
          bind:value={url}
          placeholder="https://example.com"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Service'}
      </button>
    </form>
  </div>

  <!-- Services List -->
  <div class="card">
    <div class="services-header">
      <h2>Services ({services.length})</h2>
      <div class="services-actions">
        <button
          class="btn btn-secondary btn-sm"
          on:click={exportServices}
          disabled={services.length === 0}
          title="Export services to JSON file"
        >
          Export
        </button>
        <button
          class="btn btn-secondary btn-sm"
          on:click={showImportDialog}
          title="Import services from JSON file"
        >
          Import
        </button>
      </div>
    </div>
    {#if services.length === 0}
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">📋</div>
        <p>No services added yet.</p>
        <p class="text-sm text-gray-500">Add your first service above to get started monitoring.</p>
      </div>
    {:else}
      <div class="services-list">
        {#each services as service (service.id)}
          <div class="service-item">
            <div class="service-info">
              <h3>{service.name}</h3>
              <a href={service.url} target="_blank" rel="noopener noreferrer" class="service-url">
                {service.url}
              </a>
            </div>
            <div class="service-actions">
              <button
                class="btn-icon btn-edit-ghost"
                on:click={() => showEditDialog(service)}
                aria-label="Edit {service.name}"
                title="Edit {service.name}"
              >
                <span aria-hidden="true">✏️</span>
              </button>
              <button
                class="btn-icon btn-danger-ghost"
                on:click={() => showDeleteConfirm(service.id, service.name)}
                aria-label="Delete {service.name}"
                title="Delete {service.name}"
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Confirmation Dialog -->
  {#if confirmDialog.show}
    <button
      class="dialog-backdrop"
      on:click={(e) => e.target === e.currentTarget && hideDeleteConfirm()}
      on:keydown={(e) => e.key === 'Escape' && hideDeleteConfirm()}
      aria-label="Close dialog"
    >
      <div class="dialog" role="alertdialog">
        <div class="dialog-header">
          <h3 id="dialog-title">Delete Service</h3>
        </div>
        <div class="dialog-body">
          <p>Are you sure you want to delete <strong>{confirmDialog.serviceName}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="dialog-actions">
          <button
            class="btn btn-secondary"
            on:click={hideDeleteConfirm}
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger"
            on:click={() => deleteService(confirmDialog.serviceId)}
            aria-label="Confirm deletion of {confirmDialog.serviceName}"
          >
            Delete
          </button>
        </div>
      </div>
    </button>
  {/if}

  <!-- Edit Dialog -->
  {#if editDialog.show}
    <button
      class="dialog-backdrop"
      on:click={(e) => e.target === e.currentTarget && hideEditDialog()}
      on:keydown={(e) => e.key === 'Escape' && hideEditDialog()}
      aria-label="Close dialog"
    >
      <div class="dialog" role="dialog">
        <div class="dialog-header">
          <h3 id="edit-dialog-title">Edit Service</h3>
        </div>
        <div class="dialog-body">
          <form on:submit|preventDefault={editService}>
            <div class="form-group">
              <label for="edit-name" class="form-label">Name</label>
              <input
                type="text"
                id="edit-name"
                class="form-input"
                bind:value={editName}
                placeholder="Enter service name"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-url" class="form-label">URL</label>
              <input
                type="url"
                id="edit-url"
                class="form-input"
                bind:value={editUrl}
                placeholder="https://example.com"
                required
              />
            </div>
          </form>
        </div>
        <div class="dialog-actions">
          <button
            class="btn btn-secondary"
            on:click={hideEditDialog}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            on:click={editService}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </button>
  {/if}

  <!-- Import Dialog -->
  {#if importDialog.show}
    <button
      class="dialog-backdrop"
      on:click={(e) => e.target === e.currentTarget && hideImportDialog()}
      on:keydown={(e) => e.key === 'Escape' && hideImportDialog()}
      aria-label="Close dialog"
    >
      <div class="dialog" role="dialog">
        <div class="dialog-header">
          <h3 id="import-dialog-title">Import Services</h3>
        </div>
        <div class="dialog-body">
          <p>Select a JSON file containing your services to import.</p>
          <p class="text-sm text-gray-500 mb-4">Services with duplicate URLs will be skipped.</p>

          <div class="file-input-wrapper">
            <input
              type="file"
              id="import-file"
              accept=".json,application/json"
              on:change={handleFileSelect}
              class="file-input"
            />
            <label for="import-file" class="file-input-label">
              {importFile ? importFile.name : 'Choose JSON file...'}
            </label>
          </div>

          <div class="mt-4">
            <details class="text-sm">
              <summary class="cursor-pointer text-gray-600 hover:text-gray-800">Expected format</summary>
              <pre class="bg-gray-100 p-3 mt-2 rounded text-xs overflow-x-auto"><code>{`[
  {
    "name": "Example Service",
    "url": "https://example.com"
  },
  {
    "name": "Another Service",
    "url": "https://another.com"
  }
]`}</code></pre>
            </details>
          </div>
        </div>
        <div class="dialog-actions">
          <button
            class="btn btn-secondary"
            on:click={hideImportDialog}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            on:click={importServices}
            disabled={!importFile || loading}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </button>
  {/if}

  <!-- Toast Notification -->
  {#if toast.show}
    <div class="toast toast-{toast.type}">
      {toast.message}
    </div>
  {/if}
</main>
{:else}
<main class="container">
  <div class="auth-required">
    <h1>🔐 Authentication Required</h1>
    <p>This page is restricted to administrators only.</p>
    <p>Please log in to access the services management.</p>
    <button class="btn btn-primary" on:click={() => goto('/')}>
      Back to Dashboard
    </button>
  </div>
</main>
{/if}

<style>
  h1 {
    color: var(--gray-900);
    margin-bottom: var(--space-8);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
  }

  .card h2 {
    margin: 0 0 var(--space-6) 0;
    color: var(--gray-900);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .card:not(:last-child) {
    margin-bottom: var(--space-8);
  }

  .services-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .services-header h2 {
    margin: 0;
  }

  .services-actions {
    display: flex;
    gap: var(--space-2);
  }

  .btn-sm {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
  }

  .services-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .empty-state {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    color: var(--gray-600);
  }

  .empty-icon {
    font-size: var(--space-12);
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  .empty-state p {
    margin-bottom: var(--space-2);
    font-size: var(--font-size-base);
  }

  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-base);
    background: var(--gray-50);
    transition: all var(--transition-base);
  }

  .service-item:hover {
    border-color: var(--gray-300);
    background: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .service-info h3 {
    margin: 0 0 var(--space-1) 0;
    color: var(--gray-900);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
  }

  .service-url {
    color: var(--primary-600);
    text-decoration: none;
    font-size: var(--font-size-sm);
    transition: color var(--transition-base);
  }

  .service-url:hover {
    color: var(--primary-700);
    text-decoration: underline;
  }

  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: var(--radius-base);
    cursor: pointer;
    transition: all var(--transition-base);
    font-size: var(--font-size-base);
  }

  .service-actions {
    display: flex;
    gap: var(--space-2);
  }

  .btn-edit-ghost {
    background: transparent;
    color: var(--primary-600);
    border: 1px solid transparent;
  }

  .btn-edit-ghost:hover {
    background: var(--primary-50);
    border-color: var(--primary-200);
    color: var(--primary-700);
  }

  .btn-danger-ghost {
    background: transparent;
    color: var(--error-600);
    border: 1px solid transparent;
  }

  .btn-danger-ghost:hover {
    background: var(--error-50);
    border-color: var(--error-200);
    color: var(--error-700);
  }

  .toast {
    position: fixed;
    top: var(--space-8);
    right: var(--space-8);
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-base);
    color: white;
    font-weight: var(--font-weight-medium);
    z-index: 1000;
    animation: slideIn var(--transition-slow) ease-out;
    box-shadow: var(--shadow-lg);
    font-size: var(--font-size-sm);
  }

  .toast-success {
    background: var(--success-600);
  }

  .toast-error {
    background: var(--error-600);
  }

  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border: none;
    padding: 0;
    cursor: pointer;
    animation: fadeIn var(--transition-base) ease-out;
    backdrop-filter: blur(4px);
  }

  .dialog {
    background: white;
    border-radius: var(--radius-lg);
    max-width: 400px;
    width: 90%;
    box-shadow: var(--shadow-xl);
    animation: scaleIn var(--transition-base) ease-out;
    border: 1px solid var(--gray-200);
    pointer-events: auto;
  }

  .dialog-header {
    padding: var(--space-6) var(--space-6) 0;
  }

  .dialog-body {
    padding: var(--space-4) var(--space-6);
  }

  .dialog h3 {
    margin: 0;
    color: var(--gray-900);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .dialog p {
    margin: var(--space-2) 0;
    color: var(--gray-700);
    line-height: var(--line-height-relaxed);
    font-size: var(--font-size-sm);
  }

  .warning-text {
    color: var(--error-600) !important;
    font-size: var(--font-size-sm);
    font-style: italic;
    font-weight: var(--font-weight-medium);
  }

  .dialog-actions {
    display: flex;
    gap: var(--space-3);
    padding: 0 var(--space-6) var(--space-6);
    justify-content: flex-end;
    border-top: 1px solid var(--gray-200);
    margin-top: var(--space-4);
    padding-top: var(--space-4);
  }

  .file-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .file-input-wrapper {
    margin: var(--space-4) 0;
  }

  .file-input-label {
    display: inline-block;
    padding: var(--space-3) var(--space-4);
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-base);
    cursor: pointer;
    transition: all var(--transition-base);
    color: var(--gray-700);
    font-size: var(--font-size-sm);
    width: 100%;
    text-align: center;
  }

  .bg-gray-100 code {
    text-align: left;
  }

  .file-input-label:hover {
    background: var(--gray-100);
    border-color: var(--gray-300);
  }

  .text-sm {
    font-size: var(--font-size-sm);
  }

  .text-gray-500 {
    color: var(--gray-500);
  }

  .text-gray-600 {
    color: var(--gray-600);
  }

  .text-gray-800 {
    color: var(--gray-800);
  }

  .mb-4 {
    margin-bottom: var(--space-4);
  }

  .mt-4 {
    margin-top: var(--space-4);
  }

  .mt-2 {
    margin-top: var(--space-2);
  }

  .p-3 {
    padding: var(--space-3);
  }

  .bg-gray-100 {
    background: var(--gray-100);
  }

  .rounded {
    border-radius: var(--radius-base);
  }

  .text-xs {
    font-size: var(--font-size-xs);
  }

  .overflow-x-auto {
    overflow-x: auto;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  details summary {
    list-style: none;
  }

  details summary::-webkit-details-marker {
    display: none;
  }

  details summary::before {
    content: '▶';
    margin-right: var(--space-2);
    transition: transform var(--transition-base);
  }

  details[open] summary::before {
    transform: rotate(90deg);
  }

  .auth-required {
    text-align: center;
    padding: var(--space-12) var(--space-4);
    color: var(--gray-700);
  }

  .auth-required h1 {
    color: var(--gray-900);
    margin-bottom: var(--space-6);
  }

  .auth-required p {
    margin-bottom: var(--space-4);
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .dialog {
      margin: var(--space-4);
      width: calc(100% - var(--space-8));
    }

    .dialog-actions {
      flex-direction: column-reverse;
    }

    .toast {
      top: var(--space-4);
      right: var(--space-4);
      left: var(--space-4);
      text-align: center;
    }
  }
</style>