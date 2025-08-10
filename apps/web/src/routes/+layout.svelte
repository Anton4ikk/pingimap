<script>
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import { onMount } from 'svelte';
  import { checkAuthStatus } from '$lib/auth';

  onMount(() => {
    // Initialize authentication status
    checkAuthStatus();
  });
</script>

<Navigation />
<main>
  <slot />
</main>