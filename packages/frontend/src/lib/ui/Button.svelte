<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements'

	interface Props {
		children?: import('svelte').Snippet
	}

	let { children, ...rest }: HTMLButtonAttributes & Props = $props()
</script>

<button {...rest}>{@render children?.()}</button>

<style>
	button {
		width: auto;
		display: inline-block;
		padding: 0.75rem 2rem;
		border: 1px solid var(--purple-primary);
		background-color: var(--purple-primary);
		color: var(--text-primary);
		outline: none;
		cursor: pointer;
		height: auto;
		min-height: 2.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-weight: var(--font-medium);
		border-radius: var(--radius-md);
		transition: all var(--transition-base);
	}

	button:hover {
		background-color: var(--purple-dark);
		box-shadow: var(--shadow-purple-md);
		transform: translateY(-1px);
	}

	button:active {
		transform: scale(0.98);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
</style>
