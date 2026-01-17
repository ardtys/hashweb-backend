<script lang="ts">
	import ThemeToggle from '$lib/ui/ThemeToggle.svelte'
</script>

<footer>
	<ThemeToggle />
</footer>

<style>
	footer {
		display: flex;
		justify-content: flex-start;
		padding: 1rem;
		position: fixed;
		bottom: 0;
		left: 0;
		background-color: var(--ui-bg-0-85);
		backdrop-filter: blur(2px);
	}
</style>
