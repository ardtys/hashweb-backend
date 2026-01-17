<script lang="ts">
	import { API } from 'hashweb/shared'
	import { notify } from '$lib/toast'
	import Button from '$lib/ui/Button.svelte'
	import type { StoredNote } from '$lib/services/noteStorage'

	interface Props {
		note: StoredNote
		onClose: () => void
		onSuccess: (noteId: string) => void
	}

	let { note, onClose, onSuccess }: Props = $props()

	let loading = $state(false)
	let deleteFromServer = $state(true)

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	async function handleDelete() {
		loading = true

		try {
			// Delete from server if note is still available
			if (deleteFromServer && !note.unavailable) {
				try {
					await API.deleteNote(note.id)
				} catch (e) {
					// If server delete fails, just warn but continue with local delete
					console.warn('Failed to delete from server:', e)
					notify.error('Note removed locally, but server delete failed')
				}
			}

			// Always remove from localStorage
			onSuccess(note.id)
			notify.success('Note deleted successfully')
			onClose()
		} catch (e) {
			notify.error('Failed to delete note')
		} finally {
			loading = false
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}
</script>

<div class="modal-overlay" onclick={handleOverlayClick} role="dialog" aria-modal="true">
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>🗑️ Delete Note</h2>
			<button class="close-btn" onclick={onClose} aria-label="Close modal">✕</button>
		</div>

		<div class="modal-body">
			<div class="warning-box">
				<div class="warning-icon">⚠️</div>
				<p class="warning-text">This action cannot be undone!</p>
			</div>

			<div class="note-details">
				<div class="detail-row">
					<span class="detail-label">Note ID:</span>
					<code class="detail-value">{note.id.slice(0, 16)}...</code>
				</div>
				<div class="detail-row">
					<span class="detail-label">Type:</span>
					<span class="detail-value">{note.type === 'text' ? '📄 Text' : '📎 File'}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Created:</span>
					<span class="detail-value">{formatDate(note.createdAt)}</span>
				</div>
				{#if note.expiresAt}
					<div class="detail-row">
						<span class="detail-label">Expires:</span>
						<span class="detail-value">{formatDate(note.expiresAt)}</span>
					</div>
				{/if}
				{#if note.viewsRemaining !== undefined}
					<div class="detail-row">
						<span class="detail-label">Views left:</span>
						<span class="detail-value">{note.viewsRemaining}</span>
					</div>
				{/if}
			</div>

			{#if !note.unavailable}
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={deleteFromServer} />
					<span>Also delete from server</span>
				</label>
			{:else}
				<div class="info-box">
					<p>This note is unavailable on the server. Only local data will be removed.</p>
				</div>
			{/if}
		</div>

		<div class="modal-footer">
			<button class="btn-secondary" onclick={onClose} disabled={loading}>Cancel</button>
			<button class="btn-danger" onclick={handleDelete} disabled={loading}>
				{loading ? 'Deleting...' : 'Delete Note'}
			</button>
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
		max-width: 500px;
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

	.modal-header h2 {
		font-size: 1.5rem;
		font-weight: var(--font-bold);
		color: var(--text-primary);
		margin: 0;
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
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.warning-box {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--error-bg);
		border: 1px solid var(--error);
		border-radius: var(--radius-md);
	}

	.warning-icon {
		font-size: 2rem;
	}

	.warning-text {
		color: var(--error);
		font-weight: var(--font-medium);
		margin: 0;
	}

	.note-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.detail-label {
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.detail-value {
		color: var(--text-primary);
		font-weight: var(--font-medium);
		font-size: 0.875rem;
	}

	code.detail-value {
		font-family: 'JetBrains Mono', monospace;
		background: var(--bg-tertiary);
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-sm);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.info-box {
		padding: 1rem;
		background: var(--info-bg);
		border: 1px solid var(--info);
		border-radius: var(--radius-md);
	}

	.info-box p {
		color: var(--info);
		margin: 0;
		font-size: 0.875rem;
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

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-tertiary);
		border-color: var(--purple-primary);
	}

	.btn-danger {
		padding: 0.75rem 2rem;
		background: var(--error-bg);
		border: 1px solid var(--error);
		border-radius: var(--radius-md);
		color: var(--error);
		font-family: 'JetBrains Mono', monospace;
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--error);
		color: var(--bg-primary);
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
	}

	.btn-secondary:disabled,
	.btn-danger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
