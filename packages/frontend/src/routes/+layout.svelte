<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { onMount } from 'svelte'
	import { waitLocale } from 'svelte-intl-precompile'

	import '../app.css'

	import { init as initStores, status } from '$lib/stores/status'
	import Footer from '$lib/views/Footer.svelte'
	import Header from '$lib/views/Header.svelte'
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()

	onMount(() => {
		initStores()
	})
</script>

<svelte:head>
	<title>{$status?.theme_page_title || 'HashWeb'}</title>

	<!-- Mobile App Meta Tags -->
	<meta name="application-name" content={$status?.theme_page_title || 'HashWeb'} />
	<meta name="apple-mobile-web-app-title" content={$status?.theme_page_title || 'HashWeb'} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

	<!-- Favicon Implementation -->
	<link rel="icon" type="image/x-icon" href={$status?.theme_favicon || '/hashweb.ico'} />
	<link rel="icon" type="image/svg+xml" href="/hashweb.svg" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
	<link rel="manifest" href="/manifest.json" />

	<!-- Theme Color -->
	<meta name="theme-color" content="#0EA5E9" />

	<!-- SEO Meta Tags -->
	<meta name="description" content="Secure, temporary file and text sharing" />
	<meta property="og:title" content={$status?.theme_page_title || 'HashWeb'} />
	<meta property="og:description" content="Secure, temporary file and text sharing" />
	<meta property="og:image" content="/favicon.png" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hashweb.xyz" />
	<meta property="og:site_name" content="HashWeb" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={$status?.theme_page_title || 'HashWeb'} />
	<meta name="twitter:description" content="Secure, temporary file and text sharing" />
	<meta name="twitter:image" content="/favicon.png" />
</svelte:head>

{#await waitLocale() then _}
	<!-- Background Effects -->
	<!-- 1. Dotted Grid Background -->
	<div class="dotted-grid"></div>

	<!-- 2. Scanning Lines (4 lines: 2 horizontal + 2 vertical) -->
	<div class="scanning-lines">
		<div class="scan-line scan-line-h-1"></div>
		<div class="scan-line scan-line-h-2"></div>
		<div class="scan-line scan-line-v-1"></div>
		<div class="scan-line scan-line-v-2"></div>
	</div>

	<!-- 3. Glowing Orbs (3 orbs) -->
	<div class="glowing-orbs">
		<div class="glow-orb glow-orb-1"></div>
		<div class="glow-orb glow-orb-2"></div>
		<div class="glow-orb glow-orb-3"></div>
	</div>

	<main>
		<Header />
		{@render children?.()}
	</main>

	<SvelteToast />

	<Footer />
{/await}

<style>
	main {
		padding: 1rem;
		padding-bottom: 4rem;
		width: 100%;
		max-width: 35rem;
		margin: 0 auto;
		position: relative;
		z-index: 10;
	}
</style>
