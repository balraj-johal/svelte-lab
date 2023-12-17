<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { setup } from './webGPUSetup';

	let canvas: HTMLCanvasElement;


	onMount(async () => {
		const { device, encoder, context } = await setup(canvas);
		if (!context) return;

		// Define first render pass
		const renderPass = encoder.beginRenderPass({
			// attachments are textures provided to the render pass
			colorAttachments: [{
				/** render passes require a GPUTextureView, not GPUTexture. CreateView with no arguments just returns the entire texture. */
				view: context.getCurrentTexture().createView(),
				loadOp: "clear",
				clearValue: [0, 0.5, 0.5, 1],
				storeOp: "store"
			}]
		})
		renderPass.end();
		/** Turn encoded commands into buffer ready for submission to the GPU.
			NOTE: command buffers are ONE USE ONLY. */ 
		const commandBuffer = encoder.finish();
		// add the command buffer to the GPU Device's execution queue
		device.queue.submit([commandBuffer]);

})
</script>

<style lang="scss">
	.container {
		overflow: clip;
	}
</style>


<div class="container">
    <canvas bind:this={canvas}  width="512" height="512" />
</div>