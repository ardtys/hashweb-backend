<script lang="ts">
	interface Props {
		label?: string
		value: boolean
		color?: boolean
		[key: string]: any
	}

	let { label = '', value = $bindable(), color = true, ...rest }: Props = $props()
</script>

<label {...rest}>
	<small>{label}</small>
	<input type="checkbox" bind:checked={value} />
	<span class:color class="slider"></span>
</label>

<style>
	label {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	label input {
		display: none;
	}

	small {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		white-space: nowrap;
	}

	.slider {
		display: block;
		width: 4rem;
		height: 2.5rem;
		position: relative;
		cursor: pointer;
		border: 2px solid var(--text-tertiary);
		background-color: var(--bg-secondary);
		border-radius: var(--radius-md);
		transition: all var(--transition-base);
	}

	.slider:hover {
		border-color: var(--purple-light);
		background-color: var(--bg-tertiary);
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 2rem;
		width: 1.25rem;
		left: 0.125rem;
		bottom: 0.125rem;
		background-color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: all var(--transition-base);
	}

	input:checked + .slider {
		border-color: var(--purple-primary);
		background-color: rgba(139, 92, 246, 0.1);
	}

	input:checked + .slider.color:before {
		background-color: var(--purple-primary);
		box-shadow: var(--shadow-purple-sm);
	}

	input:checked + .slider:before {
		transform: translateX(calc(2.25rem - 1px));
	}
</style>
