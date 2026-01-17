<script lang="ts">
	import { onMount } from 'svelte'
	import { API, type AnalyticsSummary } from 'hashweb/shared'
	import Loader from './Loader.svelte'

	interface Props {
		noteId: string
	}

	let { noteId }: Props = $props()

	let analytics = $state<AnalyticsSummary | null>(null)
	let loading = $state(true)
	let error = $state<string | null>(null)

	onMount(async () => {
		try {
			loading = true
			analytics = await API.getAnalytics(noteId)
		} catch (e) {
			error = 'Failed to load analytics'
			console.error(e)
		} finally {
			loading = false
		}
	})

	function formatDate(timestamp: number | null): string {
		if (!timestamp) return 'Never'
		return new Date(timestamp * 1000).toLocaleString()
	}

	function getDevicePercentage(count: number, total: number): number {
		if (total === 0) return 0
		return Math.round((count / total) * 100)
	}
</script>

{#if loading}
	<div class="loading">
		<Loader /> Loading analytics...
	</div>
{:else if error}
	<div class="error">
		<p>{error}</p>
	</div>
{:else if analytics}
	<div class="analytics-container">
		<h3>📊 Link Analytics</h3>

		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon">👁️</div>
				<div class="stat-content">
					<div class="stat-value">{analytics.total_views}</div>
					<div class="stat-label">Total Views</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">⏰</div>
				<div class="stat-content">
					<div class="stat-value-small">{formatDate(analytics.last_viewed)}</div>
					<div class="stat-label">Last Viewed</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">🎯</div>
				<div class="stat-content">
					<div class="stat-value-small">{formatDate(analytics.first_viewed)}</div>
					<div class="stat-label">First Viewed</div>
				</div>
			</div>
		</div>

		{#if analytics.total_views > 0}
			<div class="device-breakdown">
				<h4>Device Breakdown</h4>
				<div class="device-bars">
					{#if analytics.device_breakdown.desktop > 0}
						<div class="device-item">
							<div class="device-label">
								<span class="device-icon">💻</span>
								<span>Desktop</span>
							</div>
							<div class="device-bar-container">
								<div
									class="device-bar desktop"
									style="width: {getDevicePercentage(
										analytics.device_breakdown.desktop,
										analytics.total_views
									)}%"
								></div>
								<span class="device-count"
									>{analytics.device_breakdown.desktop} ({getDevicePercentage(
										analytics.device_breakdown.desktop,
										analytics.total_views
									)}%)</span
								>
							</div>
						</div>
					{/if}

					{#if analytics.device_breakdown.mobile > 0}
						<div class="device-item">
							<div class="device-label">
								<span class="device-icon">📱</span>
								<span>Mobile</span>
							</div>
							<div class="device-bar-container">
								<div
									class="device-bar mobile"
									style="width: {getDevicePercentage(
										analytics.device_breakdown.mobile,
										analytics.total_views
									)}%"
								></div>
								<span class="device-count"
									>{analytics.device_breakdown.mobile} ({getDevicePercentage(
										analytics.device_breakdown.mobile,
										analytics.total_views
									)}%)</span
								>
							</div>
						</div>
					{/if}

					{#if analytics.device_breakdown.tablet > 0}
						<div class="device-item">
							<div class="device-label">
								<span class="device-icon">📲</span>
								<span>Tablet</span>
							</div>
							<div class="device-bar-container">
								<div
									class="device-bar tablet"
									style="width: {getDevicePercentage(
										analytics.device_breakdown.tablet,
										analytics.total_views
									)}%"
								></div>
								<span class="device-count"
									>{analytics.device_breakdown.tablet} ({getDevicePercentage(
										analytics.device_breakdown.tablet,
										analytics.total_views
									)}%)</span
								>
							</div>
						</div>
					{/if}

					{#if analytics.device_breakdown.unknown > 0}
						<div class="device-item">
							<div class="device-label">
								<span class="device-icon">❓</span>
								<span>Unknown</span>
							</div>
							<div class="device-bar-container">
								<div
									class="device-bar unknown"
									style="width: {getDevicePercentage(
										analytics.device_breakdown.unknown,
										analytics.total_views
									)}%"
								></div>
								<span class="device-count"
									>{analytics.device_breakdown.unknown} ({getDevicePercentage(
										analytics.device_breakdown.unknown,
										analytics.total_views
									)}%)</span
								>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if analytics.unique_countries.length > 0}
			<div class="countries">
				<h4>🌍 Countries</h4>
				<div class="country-tags">
					{#each analytics.unique_countries as country}
						<span class="country-tag">{country}</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.analytics-container {
		margin-top: var(--space-6);
		padding: var(--space-6);
		border: 1px solid var(--border-tertiary);
		border-radius: var(--radius-lg);
		background: var(--bg-secondary);
	}

	h3 {
		margin: 0 0 var(--space-6) 0;
		color: var(--purple-primary);
		font-size: var(--text-xl);
	}

	h4 {
		margin: 0 0 var(--space-4) 0;
		color: var(--text-secondary);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
	}

	.loading,
	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-8);
		color: var(--text-secondary);
	}

	.error {
		color: var(--error);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-tertiary);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.stat-card:hover {
		border-color: var(--border-secondary);
		box-shadow: var(--shadow-purple-sm);
	}

	.stat-icon {
		font-size: var(--text-3xl);
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: var(--text-3xl);
		font-weight: var(--font-bold);
		color: var(--purple-primary);
		line-height: 1;
	}

	.stat-value-small {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		line-height: 1.2;
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin-top: var(--space-2);
	}

	.device-breakdown {
		margin-top: var(--space-6);
		padding: var(--space-4);
		background: var(--bg-tertiary);
		border-radius: var(--radius-lg);
	}

	.device-bars {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.device-item {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.device-label {
		min-width: 100px;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.device-icon {
		font-size: var(--text-lg);
	}

	.device-bar-container {
		flex: 1;
		position: relative;
		height: 28px;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.device-bar {
		height: 100%;
		border-radius: var(--radius-md);
		transition: width var(--transition-slow);
		background: linear-gradient(90deg, var(--purple-dark), var(--purple-primary));
	}

	.device-bar.desktop {
		background: linear-gradient(90deg, #3b82f6, #60a5fa);
	}

	.device-bar.mobile {
		background: linear-gradient(90deg, #8b5cf6, #a78bfa);
	}

	.device-bar.tablet {
		background: linear-gradient(90deg, #ec4899, #f472b6);
	}

	.device-bar.unknown {
		background: linear-gradient(90deg, #6b7280, #9ca3af);
	}

	.device-count {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.countries {
		margin-top: var(--space-6);
		padding: var(--space-4);
		background: var(--bg-tertiary);
		border-radius: var(--radius-lg);
	}

	.country-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.country-tag {
		padding: var(--space-2) var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-tertiary);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
</style>
