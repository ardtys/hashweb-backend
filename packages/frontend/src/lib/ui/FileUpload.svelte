<script lang="ts">
	import { t } from 'svelte-intl-precompile'
	import prettyBytes from 'pretty-bytes'

	import Button from '$lib/ui/Button.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'
	import type { FileDTO } from 'hashweb/shared'

	interface Props {
		label?: string
		files?: FileDTO[]
		[key: string]: any
	}

	let { label = '', files = $bindable([]), ...rest }: Props = $props()

	let isDragging = $state(false)
	let dragCounter = $state(0)
	let previewUrls = $state<Map<string, string>>(new Map())

	async function fileToDTO(file: File): Promise<FileDTO> {
		return {
			name: file.name,
			size: file.size,
			type: file.type,
			contents: new Uint8Array(await file.arrayBuffer()),
		}
	}

	async function processFiles(fileList: FileList | File[]) {
		const fileArray = Array.from(fileList)
		const toAdd = await Promise.all(fileArray.map(fileToDTO))
		files = [...files, ...toAdd]

		// Create preview URLs for images
		fileArray.forEach((file) => {
			if (file.type.startsWith('image/')) {
				const url = URL.createObjectURL(file)
				previewUrls.set(file.name, url)
			}
		})
	}

	async function onInput(e: Event) {
		const input = e.target as HTMLInputElement
		if (input?.files?.length) {
			await processFiles(input.files)
		}
	}

	function onDragEnter(e: DragEvent) {
		e.preventDefault()
		dragCounter++
		isDragging = true
	}

	function onDragLeave(e: DragEvent) {
		e.preventDefault()
		dragCounter--
		if (dragCounter === 0) {
			isDragging = false
		}
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault()
	}

	async function onDrop(e: DragEvent) {
		e.preventDefault()
		isDragging = false
		dragCounter = 0

		if (e.dataTransfer?.files?.length) {
			await processFiles(e.dataTransfer.files)
		}
	}

	function clear(e: Event) {
		e.preventDefault()
		// Revoke all preview URLs
		previewUrls.forEach((url) => URL.revokeObjectURL(url))
		previewUrls.clear()
		files = []
	}

	function removeFile(fileName: string) {
		files = files.filter((f) => f.name !== fileName)
		const url = previewUrls.get(fileName)
		if (url) {
			URL.revokeObjectURL(url)
			previewUrls.delete(fileName)
		}
	}

	function getFileIcon(type: string): string {
		if (type.startsWith('image/')) return '🖼️'
		if (type.startsWith('video/')) return '🎥'
		if (type.startsWith('audio/')) return '🎵'
		if (type.includes('pdf')) return '📄'
		if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
		if (type.includes('text')) return '📝'
		if (
			type.includes('word') ||
			type.includes('document') ||
			type.includes('msword') ||
			type.includes('officedocument.wordprocessing')
		)
			return '📘'
		if (
			type.includes('sheet') ||
			type.includes('excel') ||
			type.includes('officedocument.spreadsheet')
		)
			return '📊'
		if (
			type.includes('presentation') ||
			type.includes('powerpoint') ||
			type.includes('officedocument.presentation')
		)
			return '📽️'
		return '📎'
	}
</script>

<label>
	<small>
		{label}
	</small>
	<input {...rest} type="file" onchange={onInput} multiple />
	<div
		class="dropzone"
		class:dragging={isDragging}
		ondragenter={onDragEnter}
		ondragleave={onDragLeave}
		ondragover={onDragOver}
		ondrop={onDrop}
		role="button"
		tabindex="0"
	>
		{#if files.length}
			<div class="files-container">
				<div class="files-header">
					<b>{$t('file_upload.selected_files')}</b>
					<Button onclick={clear}>{$t('file_upload.clear')}</Button>
				</div>
				<div class="files-grid">
					{#each files as file}
						{@const previewUrl = previewUrls.get(file.name)}
						<div class="file-card">
							<button class="remove-btn" onclick={() => removeFile(file.name)} title="Remove">
								×
							</button>
							{#if previewUrl}
								<div class="file-preview">
									<img src={previewUrl} alt={file.name} />
								</div>
							{:else}
								<div class="file-icon">{getFileIcon(file.type)}</div>
							{/if}
							<div class="file-info">
								<div class="file-name" title={file.name}>{file.name}</div>
								<div class="file-meta">
									<span class="file-size">{prettyBytes(file.size)}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-state">
				<div class="upload-icon">📤</div>
				<b>{isDragging ? 'Drop files here' : 'Drag & drop files here'}</b>
				<span class="or-text">or click to browse</span>
				<small>
					{$t('common.max')}: <MaxSize />
				</small>
			</div>
		{/if}
	</div>
</label>

<style>
	input {
		display: none;
	}

	.dropzone {
		border: 2px dashed var(--border-secondary);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		min-height: 200px;
		cursor: pointer;
		transition: all var(--transition-base);
		background: var(--bg-secondary);
	}

	.dropzone:hover {
		border-color: var(--border-primary);
		background: var(--bg-tertiary);
		box-shadow: var(--shadow-purple-sm);
	}

	.dropzone.dragging {
		border-color: var(--purple-primary);
		background: rgba(139, 92, 246, 0.1);
		box-shadow: var(--shadow-purple-md);
		transform: scale(1.02);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-8);
		text-align: center;
	}

	.upload-icon {
		font-size: var(--text-5xl);
		opacity: 0.5;
		margin-bottom: var(--space-2);
	}

	.or-text {
		color: var(--text-tertiary);
		font-size: var(--text-sm);
	}

	.files-container {
		width: 100%;
	}

	.files-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--border-tertiary);
	}

	.files-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-4);
		max-height: 400px;
		overflow-y: auto;
	}

	.file-card {
		position: relative;
		border: 1px solid var(--border-tertiary);
		border-radius: var(--radius-lg);
		padding: var(--space-3);
		background: var(--bg-tertiary);
		transition: all var(--transition-fast);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.file-card:hover {
		border-color: var(--border-secondary);
		box-shadow: var(--shadow-purple-sm);
		transform: translateY(-2px);
	}

	.remove-btn {
		position: absolute;
		top: var(--space-1);
		right: var(--space-1);
		width: 24px;
		height: 24px;
		border: none;
		border-radius: var(--radius-full);
		background: var(--error);
		color: white;
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all var(--transition-fast);
		line-height: 1;
		padding: 0;
	}

	.file-card:hover .remove-btn {
		opacity: 1;
	}

	.remove-btn:hover {
		background: #dc2626;
		transform: scale(1.1);
	}

	.file-preview {
		width: 100%;
		height: 120px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.file-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.file-icon {
		width: 100%;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-5xl);
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
	}

	.file-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.file-name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-primary);
	}

	.file-meta {
		display: flex;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.file-size {
		color: var(--purple-light);
	}

	/* Scrollbar styling */
	.files-grid::-webkit-scrollbar {
		width: 8px;
	}

	.files-grid::-webkit-scrollbar-track {
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
	}

	.files-grid::-webkit-scrollbar-thumb {
		background: var(--border-secondary);
		border-radius: var(--radius-md);
	}

	.files-grid::-webkit-scrollbar-thumb:hover {
		background: var(--border-primary);
	}
</style>
