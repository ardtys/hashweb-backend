<script lang="ts">
	import { API } from 'hashweb/shared'
	import { status } from '$lib/stores/status'
	import { notify } from '$lib/toast'
	import Button from '$lib/ui/Button.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Switch from '$lib/ui/Switch.svelte'

	interface Props {
		noteId: string
		onClose: () => void
		onSuccess: (noteId: string, views?: number, expiration?: number) => void
	}

	let { noteId, onClose, onSuccess }: Props = $props()

	let useTimeExpiration = $state(false)
	let additionalViews = $state(1)
	let additionalMinutes = $state(60)
	let loading = $state(false)
	let error = $state<string | null>(null)

	const maxViews = $status?.max_views || 100
	const maxExpiration = $status?.max_expiration || 360

	async function handleExtend() {
		error = null
		loading = true

		try {
			const data: { views?: number; expiration?: number } = {}

			if (useTimeExpiration) {
				if (additionalMinutes < 1 || additionalMinutes > maxExpiration) {
					throw new Error(`Expiration must be between 1 and ${maxExpiration} minutes`)
				}
				data.expiration = additionalMinutes
			} else {
				if (additionalViews < 1 || additionalViews > maxViews) {
					throw new Error(`Views must be between 1 and ${maxViews}`)
				}
				data.views = additionalViews
			}

			const result = await API.extendNote(noteId, data)

			notify.success('Note expiry extended successfully!')
			onSuccess(noteId, result.views || undefined, result.expiration || undefined)
			onClose()
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Failed to extend note'
			error = errorMessage
			notify.error(errorMessage)
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
			<h2>⏰ Extend Note Expiry</h2>
			<button class="close-btn" onclick={onClose} aria-label="Close modal">✕</button>
		</div>

		<div class="modal-body">
			<p class="modal-description">Add more time or views to keep your note active longer.</p>

			<div class="expiry-toggle">
				<Switch
					label="Use time-based expiration"
					value={useTimeExpiration}
					onchange={(checked: boolean) => (useTimeExpiration = checked)}
				/>
			</div>

			{#if useTimeExpiration}
				<div class="input-group">
					<label for="additional-minutes">Additional Minutes</label>
					<input
						id="additional-minutes"
						type="number"
						min="1"
						max={maxExpiration}
						bind:value={additionalMinutes}
						class="number-input"
					/>
					<small class="input-hint">Max: {maxExpiration} minutes (6 hours)</small>
				</div>
			{:else}
				<div class="input-group">
					<label for="additional-views">Additional Views</label>
					<input
						id="additional-views"
						type="number"
						min="1"
						max={maxViews}
						bind:value={additionalViews}
						class="number-input"
					/>
					<small class="input-hint">Max: {maxViews} views</small>
				</div>
			{/if}

			{#if error}
				<div class="error-message">
					⚠️ {error}
				</div>
			{/if}
		</div>

		<div class="modal-footer">
			<button class="btn-secondary" onclick={onClose} disabled={loading}>Cancel</button>
			<Button onclick={handleExtend} disabled={loading}>
				{loading ? 'Extending...' : 'Extend'}
			</Button>
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

	.modal-description {
		color: var(--text-secondary);
		margin: 0;
	}

	.expiry-toggle {
		padding: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-group label {
		font-weight: var(--font-medium);
		color: var(--text-primary);
		font-size: 0.95rem;
	}

	.number-input {
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
		font-size: 1rem;
		transition: all var(--transition-base);
	}

	.number-input:focus {
		outline: none;
		border-color: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
	}

	.input-hint {
		color: var(--text-tertiary);
		font-size: 0.875rem;
	}

	.error-message {
		padding: 0.75rem 1rem;
		background: var(--error-bg);
		border: 1px solid var(--error);
		border-radius: var(--radius-md);
		color: var(--error);
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

	.btn-secondary:disabled {
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
