<script lang="ts">
	import { onMount } from 'svelte'
	import { NoteStorageService, type StoredNote } from '$lib/services/noteStorage'
	import {
		dashboardStore,
		filteredNotes,
		dashboardStats,
		setNotes,
		updateNote,
		removeNote,
		updateFilters,
		selectNote,
	} from '$lib/stores/dashboard'
	import DashboardHeader from '$lib/ui/Dashboard/DashboardHeader.svelte'
	import NoteFilters from '$lib/ui/Dashboard/NoteFilters.svelte'
	import NoteList from '$lib/ui/Dashboard/NoteList.svelte'
	import ExtendModal from '$lib/ui/Dashboard/ExtendModal.svelte'
	import DeleteConfirmModal from '$lib/ui/Dashboard/DeleteConfirmModal.svelte'
	import NoteAnalyticsModal from '$lib/ui/Dashboard/NoteAnalyticsModal.svelte'
	import { notify } from '$lib/toast'

	let showExtendModal = $state(false)
	let showDeleteModal = $state(false)
	let showAnalyticsModal = $state(false)
	let selectedNote = $state<StoredNote | null>(null)

	onMount(() => {
		// Load notes from localStorage
		loadNotes()

		// Cleanup expired notes
		NoteStorageService.cleanupExpired()

		// Listen for localStorage changes (cross-tab sync)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'ghostfile_notes') {
				loadNotes()
			}
		}

		// Listen for custom event from noteStorage
		const handleNotesChanged = () => {
			loadNotes()
		}

		window.addEventListener('storage', handleStorageChange)
		window.addEventListener('ghostfile-notes-changed', handleNotesChanged)

		// Cleanup
		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('ghostfile-notes-changed', handleNotesChanged)
		}
	})

	function loadNotes() {
		const notes = NoteStorageService.getAllNotes()
		setNotes(notes)
	}

	function handleDelete(noteId: string) {
		const note = NoteStorageService.getNote(noteId)
		if (note) {
			selectedNote = note
			showDeleteModal = true
		}
	}

	function handleExtend(noteId: string) {
		const note = NoteStorageService.getNote(noteId)
		if (note) {
			selectedNote = note
			showExtendModal = true
		}
	}

	function handleViewAnalytics(noteId: string) {
		selectedNote = NoteStorageService.getNote(noteId)
		showAnalyticsModal = true
	}

	function handleDeleteSuccess(noteId: string) {
		NoteStorageService.removeNote(noteId)
		removeNote(noteId)
	}

	function handleExtendSuccess(noteId: string, views?: number, expiration?: number) {
		const updates: Partial<StoredNote> = {}

		if (views !== undefined) {
			// Get current views and add the additional views
			const note = NoteStorageService.getNote(noteId)
			if (note) {
				const currentViews = note.viewsRemaining || 0
				updates.viewsRemaining = currentViews + views
				updates.expiresAt = undefined
			}
		}

		if (expiration !== undefined) {
			updates.expiresAt = expiration
			updates.viewsRemaining = undefined
		}

		NoteStorageService.updateNote(noteId, updates)
		updateNote(noteId, updates)
	}

	function closeModals() {
		showExtendModal = false
		showDeleteModal = false
		showAnalyticsModal = false
		selectedNote = null
	}
</script>

<svelte:head>
	<title>Dashboard - HashWeb</title>
</svelte:head>

<div class="dashboard-container">
	<DashboardHeader stats={$dashboardStats} />

	<NoteFilters filters={$dashboardStore.filters} onUpdate={updateFilters} />

	<NoteList
		notes={$filteredNotes}
		loading={$dashboardStore.loading}
		onDelete={handleDelete}
		onExtend={handleExtend}
		onViewAnalytics={handleViewAnalytics}
	/>
</div>

<!-- Modals -->
{#if showExtendModal && selectedNote}
	<ExtendModal
		noteId={selectedNote.id}
		onClose={closeModals}
		onSuccess={handleExtendSuccess}
	/>
{/if}

{#if showDeleteModal && selectedNote}
	<DeleteConfirmModal note={selectedNote} onClose={closeModals} onSuccess={handleDeleteSuccess} />
{/if}

{#if showAnalyticsModal && selectedNote}
	<NoteAnalyticsModal noteId={selectedNote.id} onClose={closeModals} />
{/if}

<style>
	.dashboard-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (max-width: 768px) {
		.dashboard-container {
			padding: 1rem 0.5rem;
		}
	}
</style>
