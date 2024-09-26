<script lang="ts">
	import { onMount } from 'svelte';
	import MouseMapExample from '.';

	let container: HTMLDivElement;

	onMount(() => {
		new MouseMapExample({ container });
	});
</script>

<div bind:this={container} class="container">
	<h1 class="default-heading">Mouse Map</h1>
</div>

<style lang="scss">
	.container {
		overflow: hidden;

		h1 {
			position: absolute;
			bottom: 1rem;
			left: 1rem;
			margin: 0;
		}
	}
</style>
