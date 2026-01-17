<script lang="ts">
	import { API, type AnalyticsSummary } from 'hashweb/shared'
	import Analytics from '$lib/ui/Analytics.svelte'

	interface Props {
		noteId: string
		onClose: () => void
	}

	let { noteId, onClose }: Props = $props()

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}
</script>

<div class="modal-overlay" onclick={handleOverlayClick} role="dialog" aria-modal="true">
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<div class="header-content">
				<h2>📊 Note Analytics</h2>
				<code class="note-id">{noteId.slice(0, 16)}...</code>
			</div>
			<button class="close-btn" onclick={onClose} aria-label="Close modal">✕</button>
		</div>

		<div class="modal-body">
			<Analytics {noteId} />
		</div>

		<div class="modal-footer">
			<button class="btn-secondary" onclick={onClose}>Close</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		max-width: 700px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: var(--shadow-lg);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-secondary);
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.header-content h2 {
		font-size: 1.5rem;
		font-weight: var(--font-bold);
		color: var(--text-primary);
		margin: 0;
	}

	.note-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		color: var(--text-secondary);
		background: var(--bg-tertiary);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		width: fit-content;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color var(--transition-base);
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid var(--border-secondary);
		justify-content: flex-end;
	}

	.btn-secondary {
		padding: 0.75rem 2rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.btn-secondary:hover {
		background: var(--bg-tertiary);
		border-color: var(--purple-primary);
	}

	@media (max-width: 640px) {
		.modal-content {
			max-width: 100%;
			margin: 0;
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding: 1rem;
		}
	}
</style>
