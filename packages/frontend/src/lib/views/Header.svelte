<script lang="ts">
	import { status } from '$lib/stores/status'

	function reset() {
		window.location.reload()
	}
</script>

<header>
	<a class="logo" onclick={reset} href="/">
		{#if $status?.theme_image}
			<img alt="logo" src={$status.theme_image} />
		{:else}
			<img alt="HashWeb Logo" src="/favicon.png" />
		{/if}
	</a>

	<nav class="nav">
		<a href="/" class="nav-link">
			<span>📝</span>
			<span>New Note</span>
		</a>
		<a href="/dashboard" class="nav-link">
			<span>📊</span>
			<span>Dashboard</span>
		</a>
	</nav>
</header>

<style>
	header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	a.logo {
		border: none;
		text-align: center;
	}

	img {
		object-fit: contain;
	}

	header img {
		max-width: 18rem;
		max-height: 18rem;
		height: auto;
		width: auto;
		/* No filter - show original HashWeb logo colors */
		/* Add glow effect to make logo more visible */
		filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.5))
		        drop-shadow(0 0 40px rgba(14, 165, 233, 0.3))
		        brightness(1.1)
		        contrast(1.1);
		transition: filter var(--transition-base);
	}

	header img:hover {
		filter: drop-shadow(0 0 30px rgba(14, 165, 233, 0.7))
		        drop-shadow(0 0 50px rgba(14, 165, 233, 0.4))
		        brightness(1.2)
		        contrast(1.15);
	}

	nav.nav {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		justify-content: center;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--border-primary);
		background: var(--bg-secondary);
		color: var(--text-primary);
		text-decoration: none;
		border-radius: var(--radius-md);
		font-family: 'JetBrains Mono', monospace;
		font-weight: var(--font-medium);
		font-size: 0.95rem;
		transition: all var(--transition-base);
	}

	.nav-link:hover {
		border-color: var(--purple-primary);
		background: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
		transform: translateY(-2px);
	}

	.nav-link:active {
		transform: scale(0.98);
	}

	.nav-link span:first-child {
		font-size: 1.25rem;
	}

	@media (max-width: 640px) {
		nav.nav {
			flex-direction: column;
			gap: 0.75rem;
			width: 100%;
			padding: 0 1rem;
		}

		.nav-link {
			justify-content: center;
		}
	}
</style>
