<script lang="ts">
	import type { StoredNote } from '$lib/services/noteStorage'
	import Button from '$lib/ui/Button.svelte'
	import { notify } from '$lib/toast'

	interface Props {
		note: StoredNote
		onDelete?: (id: string) => void
		onExtend?: (id: string) => void
		onViewAnalytics?: (id: string) => void
	}

	let { note, onDelete, onExtend, onViewAnalytics }: Props = $props()

	const now = Math.floor(Date.now() / 1000)
	const isExpired =
		(note.expiresAt && note.expiresAt < now) ||
		(note.viewsRemaining !== undefined && note.viewsRemaining <= 0)
	const isExpiringSoon = note.expiresAt
		? note.expiresAt - now < 3600 && note.expiresAt > now // < 1 hour
		: note.viewsRemaining === 1

	function formatRelativeTime(timestamp: number): string {
		const diff = timestamp - now
		if (diff < 0) return 'Expired'
		if (diff < 60) return `${diff}s`
		if (diff < 3600) return `${Math.floor(diff / 60)}m`
		if (diff < 86400) return `${Math.floor(diff / 3600)}h`
		return `${Math.floor(diff / 86400)}d`
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	async function copyUrl() {
		try {
			await navigator.clipboard.writeText(note.url)
			notify.success('Link copied to clipboard!')
		} catch (e) {
			notify.error('Failed to copy link')
		}
	}

	function handleDelete() {
		if (onDelete) onDelete(note.id)
	}

	function handleExtend() {
		if (onExtend) onExtend(note.id)
	}

	function handleViewAnalytics() {
		if (onViewAnalytics) onViewAnalytics(note.id)
	}
</script>

<div class="note-card" class:expired={isExpired} class:expiring-soon={isExpiringSoon} class:unavailable={note.unavailable}>
	<div class="note-header">
		<div class="note-type-id">
			<span class="note-type" title={note.type === 'text' ? 'Text note' : 'File note'}>
				{note.type === 'text' ? '📄' : '📎'}
			</span>
			<code class="note-id" title={note.id}>{note.id.slice(0, 8)}...</code>
		</div>
		<div class="status-badge" class:active={!isExpired && !note.unavailable} class:expired={isExpired || note.unavailable}>
			{note.unavailable ? 'Unavailable' : isExpired ? 'Expired' : 'Active'}
		</div>
	</div>

	{#if note.label}
		<div class="note-label">{note.label}</div>
	{/if}

	<div class="note-info">
		<div class="expiry-info">
			{#if note.unavailable}
				<span class="warning">⚠️ Deleted from server</span>
			{:else if note.viewsRemaining !== undefined}
				<span class:warning={note.viewsRemaining === 1}>
					{note.viewsRemaining} {note.viewsRemaining === 1 ? 'view' : 'views'} remaining
				</span>
			{:else if note.expiresAt}
				<span class:warning={isExpiringSoon}>
					Expires in {formatRelativeTime(note.expiresAt)}
				</span>
			{/if}
		</div>
		<div class="created-at">
			Created {formatDate(note.createdAt)}
		</div>
	</div>

	<div class="note-actions">
		<button class="action-btn secondary" onclick={copyUrl} title="Copy link">
			<span>📋</span>
			<span>Copy</span>
		</button>

		{#if !note.unavailable && !isExpired}
			<button class="action-btn secondary" onclick={handleViewAnalytics} title="View analytics">
				<span>📊</span>
				<span>Analytics</span>
			</button>
			<button class="action-btn secondary" onclick={handleExtend} title="Extend expiry">
				<span>⏰</span>
				<span>Extend</span>
			</button>
		{/if}

		<button class="action-btn danger" onclick={handleDelete} title="Delete note">
			<span>🗑️</span>
			<span>Delete</span>
		</button>
	</div>
</div>

<style>
	.note-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		transition: all var(--transition-base);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.note-card:hover {
		border-color: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
		transform: translateY(-2px);
	}

	.note-card.expired {
		opacity: 0.7;
		border-color: var(--border-secondary);
	}

	.note-card.expired:hover {
		border-color: var(--error);
	}

	.note-card.expiring-soon {
		border-color: var(--warning);
	}

	.note-card.unavailable {
		opacity: 0.6;
		background: var(--bg-tertiary);
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.note-type-id {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.note-type {
		font-size: 1.25rem;
	}

	.note-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		color: var(--text-secondary);
		background: var(--bg-tertiary);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
	}

	.note-label {
		font-weight: var(--font-medium);
		color: var(--text-primary);
		font-size: 0.95rem;
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.active {
		background: var(--success-bg);
		color: var(--success);
		border: 1px solid var(--success);
	}

	.status-badge.expired {
		background: var(--error-bg);
		color: var(--error);
		border: 1px solid var(--error);
	}

	.note-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 0;
		border-top: 1px solid var(--border-secondary);
		border-bottom: 1px solid var(--border-secondary);
	}

	.expiry-info {
		font-size: 0.95rem;
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.expiry-info .warning {
		color: var(--warning);
	}

	.created-at {
		font-size: 0.85rem;
		color: var(--text-tertiary);
	}

	.note-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-family: 'JetBrains Mono', monospace;
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-base);
		border: 1px solid;
	}

	.action-btn span:first-child {
		font-size: 1rem;
	}

	.action-btn.secondary {
		background: var(--bg-tertiary);
		border-color: var(--border-primary);
		color: var(--text-primary);
	}

	.action-btn.secondary:hover {
		background: var(--purple-primary);
		border-color: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
		transform: translateY(-1px);
	}

	.action-btn.danger {
		background: var(--error-bg);
		border-color: var(--error);
		color: var(--error);
	}

	.action-btn.danger:hover {
		background: var(--error);
		color: var(--bg-primary);
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
		transform: translateY(-1px);
	}

	.action-btn:active {
		transform: scale(0.98);
	}

	@media (max-width: 640px) {
		.note-card {
			padding: 1rem;
		}

		.action-btn {
			flex: 1;
			justify-content: center;
		}

		.action-btn span:last-child {
			display: none;
		}
	}
</style>
