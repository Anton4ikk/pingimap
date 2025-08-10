<script lang="ts">
  import { login, isLoading } from '$lib/auth';

  export let showModal = false;

  let password = '';
  let errorMessage = '';
  let successMessage = '';

  async function handleSubmit() {
    errorMessage = '';
    successMessage = '';

    if (!password.trim()) {
      errorMessage = 'Please enter admin password';
      return;
    }

    const result = await login(password);

    if (result.success) {
      successMessage = result.message;
      setTimeout(() => {
        showModal = false;
        password = '';
        successMessage = '';
        // Refresh page to show admin interface
        window.location.reload();
      }, 1000);
    } else {
      errorMessage = result.message;
    }
  }

  function handleClose() {
    showModal = false;
    password = '';
    errorMessage = '';
    successMessage = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    } else if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

{#if showModal}
  <!-- Modal backdrop -->
  <div
    class="modal-backdrop"
    on:click={handleClose}
    on:keydown={handleKeydown}
    role="button"
    tabindex="-1"
  >
    <!-- Modal content -->
    <div
      class="modal-content"
      on:click|stopPropagation
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title">Admin Login</h2>
        <button class="close-button" on:click={handleClose} aria-label="Close">×</button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="modal-body">
        <div class="form-group">
          <label for="admin-password">Admin Password:</label>
          <input
            id="admin-password"
            type="password"
            bind:value={password}
            placeholder="Enter admin password"
            class="password-input"
            disabled={$isLoading}
            autocomplete="current-password"
          />
        </div>

        {#if errorMessage}
          <div class="error-message" role="alert">
            {errorMessage}
          </div>
        {/if}

        {#if successMessage}
          <div class="success-message" role="alert">
            {successMessage}
          </div>
        {/if}

        <div class="form-actions">
          <button
            type="button"
            class="cancel-button"
            on:click={handleClose}
            disabled={$isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="login-button"
            disabled={$isLoading || !password.trim()}
          >
            {$isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #f0f0f0;
  }

  .modal-body {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  .password-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .password-input:focus {
    outline: none;
    border-color: #007bff;
  }

  .password-input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
  }

  .success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .cancel-button, .login-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    min-width: 100px;
  }

  .cancel-button {
    background-color: #6c757d;
    color: white;
  }

  .cancel-button:hover:not(:disabled) {
    background-color: #545b62;
  }

  .login-button {
    background-color: #007bff;
    color: white;
  }

  .login-button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .login-button:disabled, .cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>