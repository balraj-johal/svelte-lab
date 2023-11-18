<svelte:head>
	<title>LAB - Complex Numbers</title>
</svelte:head>

<script lang="ts">
	import Canvas from "./Canvas.svelte";
	import type { LayoutServerData } from '../$types';

	export let data: LayoutServerData;
</script>

<Canvas url={data.url} />