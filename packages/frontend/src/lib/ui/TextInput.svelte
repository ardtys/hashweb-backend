<script lang="ts">
	import Icon from '$lib/ui/Icon.svelte'
	import { copy as copyFN } from '$lib/utils'
	import { getRandomBytes, Hex } from 'occulto'
	import type { HTMLInputAttributes } from 'svelte/elements'

	interface Props {
		label?: string
		value: any
		validate?: (value: any) => boolean | string
		copy?: boolean
		random?: boolean
	}

	let {
		label = '',
		value = $bindable(),
		validate = () => true,
		copy = false,
		random = false,
		...rest
	}: HTMLInputAttributes & Props = $props()

	const initialType = $state(rest.type)
	const isPassword = initialType === 'password'
	let hidden = $state(true)

	let valid = $derived(validate(value))
	let type = $derived(isPassword ? (hidden ? 'password' : 'text') : rest.type)

	function toggle() {
		console.debug('toggle')
		hidden = !hidden
	}

	async function randomFN() {
		value = Hex.encode(await getRandomBytes(32))
	}
</script>

<label>
	<small class:disabled={rest.disabled}>
		{label}
		{#if valid !== true}
			<span class="error-text">{valid}</span>
		{/if}
	</small>
	<input bind:value {...rest} {type} autocomplete="off" class:valid={valid === true} />
	<div class="icons">
		{#if isPassword}
			<Icon
				disabled={rest.disabled}
				class="icon"
				icon={hidden ? 'eye' : 'eye-off'}
				onclick={toggle}
			/>
		{/if}
		{#if random}
			<Icon disabled={rest.disabled} class="icon" icon="dice" onclick={randomFN} />
		{/if}
		{#if copy}
			<Icon
				disabled={rest.disabled}
				class="icon"
				icon="copy"
				onclick={() => copyFN(value.toString())}
			/>
		{/if}
	</div>
</label>

<style>
	label {
		position: relative;
		display: block;
		width: 100%;
	}

	label > small {
		display: block;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin-bottom: 0.25rem;
	}

	label > small.disabled {
		opacity: 0.5;
	}

	input {
		width: 100%;
		margin: 0;
		border: 1px solid var(--border-secondary);
		background-color: var(--bg-primary);
		color: var(--text-primary);
		outline: none;
		padding: 0.75rem;
		height: 2.5rem;
		border-radius: var(--radius-md);
		font-family: 'JetBrains Mono', monospace;
		font-size: var(--text-sm);
		transition: all var(--transition-base);
	}

	input:hover {
		border-color: rgba(139, 92, 246, 0.5);
	}

	input:focus {
		border-color: var(--purple-primary);
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
	}

	input:not(.valid) {
		border-color: var(--error);
	}

	input::placeholder {
		color: var(--text-tertiary);
	}

	.icons {
		position: absolute;
		right: 0.5rem;
		bottom: 0.5rem;
		display: flex;
		gap: 0.25rem;
		color: var(--purple-primary);
	}

	.icons > :global(.icon) {
		width: 1.5rem;
		height: 1.5rem;
		background-color: var(--bg-tertiary);
		border: 2px solid var(--text-tertiary);
		border-radius: var(--radius-sm);
		padding: 2px;
		cursor: pointer;
		transition: all var(--transition-base);
		color: var(--text-secondary) !important;
	}

	.icons > :global(.icon:hover) {
		border-color: var(--purple-primary);
		background-color: rgba(139, 92, 246, 0.2);
		color: var(--purple-light) !important;
	}
</style>
