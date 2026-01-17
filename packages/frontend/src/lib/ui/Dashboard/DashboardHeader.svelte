<script lang="ts">
	interface Stats {
		total: number
		active: number
		expired: number
		unavailable: number
		totalViewsRemaining: number
		oldestNote: number | null
		textNotes: number
		fileNotes: number
	}

	interface Props {
		stats: Stats
	}

	let { stats }: Props = $props()

	function formatDate(timestamp: number | null): string {
		if (!timestamp) return 'N/A'
		return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		})
	}
</script>

<div class="dashboard-header">
	<div class="header-title">
		<h1>📊 Dashboard</h1>
		<p>Manage your secure notes</p>
	</div>

	<div class="stats-grid">
		<div class="stat-card primary">
			<div class="stat-icon">📝</div>
			<div class="stat-content">
				<div class="stat-value">{stats.total}</div>
				<div class="stat-label">Total Notes</div>
			</div>
		</div>

		<div class="stat-card success">
			<div class="stat-icon">✅</div>
			<div class="stat-content">
				<div class="stat-value">{stats.active}</div>
				<div class="stat-label">Active</div>
			</div>
		</div>

		<div class="stat-card warning">
			<div class="stat-icon">⏱️</div>
			<div class="stat-content">
				<div class="stat-value">{stats.expired}</div>
				<div class="stat-label">Expired</div>
			</div>
		</div>

		<div class="stat-card info">
			<div class="stat-icon">👁️</div>
			<div class="stat-content">
				<div class="stat-value">{stats.totalViewsRemaining}</div>
				<div class="stat-label">Views Left</div>
			</div>
		</div>
	</div>

	<div class="secondary-stats">
		<div class="secondary-stat">
			<span class="secondary-label">Text notes:</span>
			<span class="secondary-value">{stats.textNotes}</span>
		</div>
		<div class="secondary-stat">
			<span class="secondary-label">File notes:</span>
			<span class="secondary-value">{stats.fileNotes}</span>
		</div>
		<div class="secondary-stat">
			<span class="secondary-label">Oldest:</span>
			<span class="secondary-value">{formatDate(stats.oldestNote)}</span>
		</div>
		{#if stats.unavailable > 0}
			<div class="secondary-stat unavailable">
				<span class="secondary-label">⚠️ Unavailable:</span>
				<span class="secondary-value">{stats.unavailable}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.dashboard-header {
		margin-bottom: 2rem;
	}

	.header-title {
		margin-bottom: 1.5rem;
	}

	.header-title h1 {
		font-size: 2rem;
		font-weight: var(--font-bold);
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.header-title p {
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: all var(--transition-base);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.stat-card.primary {
		border-color: var(--purple-primary);
		box-shadow: 0 0 0 1px var(--purple-primary) inset;
	}

	.stat-card.success {
		border-color: var(--success);
	}

	.stat-card.warning {
		border-color: var(--warning);
	}

	.stat-card.info {
		border-color: var(--info);
	}

	.stat-icon {
		font-size: 2rem;
		opacity: 0.8;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: var(--font-bold);
		color: var(--text-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.secondary-stats {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		padding: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: var(--radius-md);
	}

	.secondary-stat {
		display: flex;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
	}

	.secondary-stat.unavailable {
		color: var(--warning);
	}

	.secondary-label {
		color: var(--text-tertiary);
	}

	.secondary-value {
		color: var(--text-primary);
		font-weight: var(--font-medium);
	}

	@media (max-width: 768px) {
		.header-title h1 {
			font-size: 1.5rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.secondary-stats {
			flex-direction: column;
			gap: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
