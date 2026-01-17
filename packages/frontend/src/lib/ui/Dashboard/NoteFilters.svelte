<script lang="ts">
	import type { DashboardFilters } from '$lib/stores/dashboard'
	import TextInput from '$lib/ui/TextInput.svelte'

	interface Props {
		filters: DashboardFilters
		onUpdate: (filters: Partial<DashboardFilters>) => void
	}

	let { filters, onUpdate }: Props = $props()

	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement
		onUpdate({ search: target.value })
	}

	function handleTypeChange(e: Event) {
		const target = e.target as HTMLSelectElement
		onUpdate({ type: target.value as DashboardFilters['type'] })
	}

	function handleStatusChange(e: Event) {
		const target = e.target as HTMLSelectElement
		onUpdate({ status: target.value as DashboardFilters['status'] })
	}

	function handleSortByChange(e: Event) {
		const target = e.target as HTMLSelectElement
		onUpdate({ sortBy: target.value as DashboardFilters['sortBy'] })
	}

	function handleSortOrderChange(e: Event) {
		const target = e.target as HTMLSelectElement
		onUpdate({ sortOrder: target.value as DashboardFilters['sortOrder'] })
	}

	function clearFilters() {
		onUpdate({
			search: '',
			type: 'all',
			status: 'all',
			sortBy: 'createdAt',
			sortOrder: 'desc',
		})
	}

	const hasActiveFilters =
		filters.search !== '' || filters.type !== 'all' || filters.status !== 'all'
</script>

<div class="filters-container">
	<div class="filters-row">
		<div class="search-filter">
			<input
				type="text"
				placeholder="🔍 Search by ID or label..."
				value={filters.search}
				oninput={handleSearchInput}
				class="search-input"
			/>
		</div>

		<div class="select-filters">
			<select value={filters.type} onchange={handleTypeChange} class="filter-select">
				<option value="all">All Types</option>
				<option value="text">📄 Text</option>
				<option value="file">📎 Files</option>
			</select>

			<select value={filters.status} onchange={handleStatusChange} class="filter-select">
				<option value="all">All Status</option>
				<option value="active">✅ Active</option>
				<option value="expired">⏱️ Expired</option>
			</select>

			<select value={filters.sortBy} onchange={handleSortByChange} class="filter-select">
				<option value="createdAt">Sort by Created</option>
				<option value="expiresAt">Sort by Expires</option>
				<option value="type">Sort by Type</option>
			</select>

			<select value={filters.sortOrder} onchange={handleSortOrderChange} class="filter-select sort-order">
				<option value="desc">↓ Desc</option>
				<option value="asc">↑ Asc</option>
			</select>

			{#if hasActiveFilters}
				<button class="clear-btn" onclick={clearFilters} title="Clear all filters">✕ Clear</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.filters-container {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.filters-row {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.search-filter {
		flex: 1;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.95rem;
		transition: all var(--transition-base);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
	}

	.search-input::placeholder {
		color: var(--text-tertiary);
	}

	.select-filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.filter-select {
		padding: 0.75rem 1rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-base);
		min-width: 140px;
	}

	.filter-select.sort-order {
		min-width: 100px;
	}

	.filter-select:hover {
		border-color: var(--purple-primary);
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
	}

	.clear-btn {
		padding: 0.75rem 1.25rem;
		background: var(--error-bg);
		border: 1px solid var(--error);
		border-radius: var(--radius-md);
		color: var(--error);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.clear-btn:hover {
		background: var(--error);
		color: var(--bg-primary);
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
	}

	.clear-btn:active {
		transform: scale(0.98);
	}

	@media (max-width: 768px) {
		.select-filters {
			flex-direction: column;
		}

		.filter-select {
			width: 100%;
		}
	}
</style>
