<script lang="ts">
	import Canvas from '../Canvas.svelte';
	import type { PageData } from './$types';
	import type { LayoutServerData } from '../../$types';

	export let data: LayoutServerData & PageData;
</script>

<Canvas seed={data.seed} url={data.url} />