<script lang="ts">
	import type { StoredNote } from '$lib/services/noteStorage'
	import NoteCard from './NoteCard.svelte'
	import Button from '$lib/ui/Button.svelte'

	interface Props {
		notes: StoredNote[]
		loading?: boolean
		onDelete?: (id: string) => void
		onExtend?: (id: string) => void
		onViewAnalytics?: (id: string) => void
	}

	let { notes, loading = false, onDelete, onExtend, onViewAnalytics }: Props = $props()
</script>

{#if loading}
	<div class="loading-state">
		<div class="skeleton-grid">
			{#each Array(6) as _}
				<div class="skeleton-card"></div>
			{/each}
		</div>
	</div>
{:else if notes.length === 0}
	<div class="empty-state">
		<div class="empty-icon">📭</div>
		<h3>No notes yet</h3>
		<p>Create your first note to see it here</p>
		<Button onclick={() => (window.location.href = '/')}>Create Note</Button>
	</div>
{:else}
	<div class="notes-grid">
		{#each notes as note (note.id)}
			<NoteCard {note} {onDelete} {onExtend} {onViewAnalytics} />
		{/each}
	</div>
{/if}

<style>
	.loading-state {
		width: 100%;
	}

	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.skeleton-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		height: 200px;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		background: var(--bg-secondary);
		border: 2px dashed var(--border-secondary);
		border-radius: var(--radius-lg);
		min-height: 400px;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: var(--font-bold);
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		font-size: 1rem;
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.notes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.notes-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.skeleton-grid {
			grid-template-columns: 1fr;
		}

		.empty-state {
			padding: 3rem 1.5rem;
			min-height: 300px;
		}
	}
</style>
