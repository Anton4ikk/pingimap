<script lang="ts">
  import { page } from '$app/stores';
  import { isAuthenticated, logout } from '$lib/auth';
  import LoginModal from './LoginModal.svelte';

  let showLoginModal = false;

  function handleLogin() {
    showLoginModal = true;
  }

  function handleLogout() {
    logout();
    // Redirect to home if on admin page
    if ($page.url.pathname.startsWith('/services')) {
      window.location.href = '/';
    } else {
      // Refresh to hide admin UI
      window.location.reload();
    }
  }
</script>

<nav class="nav">
  <div class="nav-container">
    <div class="nav-brand">
      <img src="/logo.png" alt="pingiMAP Logo" class="nav-logo" />
    </div>
    <div class="nav-links">
      <a
        href="/"
        class="nav-link"
        class:active={$page.url.pathname === '/'}
        aria-current={$page.url.pathname === '/' ? 'page' : undefined}
      >
        Dashboard
      </a>
      {#if $isAuthenticated}
        <a
          href="/services"
          class="nav-link"
          class:active={$page.url.pathname.startsWith('/services')}
          aria-current={$page.url.pathname.startsWith('/services') ? 'page' : undefined}
        >
          Services
        </a>
      {/if}
      <a
        href="/info"
        class="nav-link"
        class:active={$page.url.pathname.startsWith('/info')}
        aria-current={$page.url.pathname.startsWith('/info') ? 'page' : undefined}
      >
        Info
      </a>
      {#if $isAuthenticated}
        <button class="nav-link nav-button" on:click={handleLogout}>
          Logout
        </button>
      {:else}
        <button class="nav-link nav-button" on:click={handleLogin}>
          Login
        </button>
      {/if}
    </div>
  </div>
</nav>

<LoginModal bind:showModal={showLoginModal} />

<style>
  /* Navigation styles are now in the global CSS */

  .nav-button {
    border: none;
    font-family: inherit;
    font-size: inherit;
    background: transparent !important;
  }

  .nav-button:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }

</style>