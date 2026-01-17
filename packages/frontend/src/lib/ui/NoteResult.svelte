<script lang="ts" module>
	export type NoteResult = {
		id: string
		password?: string
	}
</script>

<script lang="ts">
	import { t } from 'svelte-intl-precompile'
	import { status } from '$lib/stores/status'
	import Analytics from '$lib/ui/Analytics.svelte'
	import Button from '$lib/ui/Button.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Canvas from './Canvas.svelte'

	interface Props {
		result: NoteResult
	}

	let { result }: Props = $props()

	let url = $state(`${window.location.origin}/note/${result.id}`)
	if (result.password) url += `#${result.password}`

	let showAnalytics = $state(false)

	function reset() {
		window.location.reload()
	}

	function toggleAnalytics() {
		showAnalytics = !showAnalytics
	}
</script>

<TextInput
	type="text"
	readonly
	label={$t('common.share_link')}
	value={url}
	copy
	data-testid="share-link"
/>

<div>
	<Canvas value={url} />
</div>

{#if $status?.theme_new_note_notice}
	<p>
		{@html $t('home.new_note_notice')}
	</p>
{/if}
<br />
<div class="button-group">
	<Button onclick={reset}>{$t('home.new_note')}</Button>
	<Button onclick={toggleAnalytics} class="secondary">
		{showAnalytics ? 'Hide Analytics' : 'View Analytics 📊'}
	</Button>
</div>

{#if showAnalytics}
	<Analytics noteId={result.id} />
{/if}

<style>
	div.button-group {
		display: flex;
		gap: var(--space-3);
		width: 100%;
		margin-top: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	div.button-group :global(button) {
		flex: 1;
		min-width: 150px;
	}

	div:not(.button-group) {
		width: min(12rem, 100%);
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
</style>
