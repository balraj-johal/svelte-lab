<script lang="ts">
	import { onMount } from 'svelte';
	import { setup } from './webGPUSetup';
	import { CELL_SHADER } from './shaders';
	import { preloadData } from '$app/navigation';
	import { dev } from '$app/environment';

	let canvas: HTMLCanvasElement;

	const GRID_SIZE = 4;

	onMount(async () => {
		const { device, encoder, context, canvasFormat } = await setup(canvas);
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

		/** The vertex buffer is just a block of memory. This bufferLayout object */
		const vertexBufferLayout = {
			// as each vertex consists of two Float32's, each vertex takes 8 bytes of memory.
			arrayStride: 8, // bytes
			attributes: [{ // buffer attributes
				format: "float32x2", // two float 32s per vertex
				offset: 0,
				shaderLocation: 0, // Position, see vertex shader - arbitrary 0 - 15
			}],
		};

		const shaderModule: GPUShaderModule = device.createShaderModule({
			label: "cell shader",
			code: CELL_SHADER
		});

		/** Defines how geometry is drawn. I barely understand this. */
		const renderPipeline: GPURenderPipeline = device.createRenderPipeline({
			label: "cell pipeline",
			// layout describes inputs other than buffers required
			layout: "auto",
			vertex: {
				module: shaderModule,
				entryPoint: "vertexMain",
				buffers: [vertexBufferLayout]
			},
			fragment: {
				module: shaderModule,
				entryPoint: "fragmentMain",
				// provides details of the color attachments that the pipeline outputs to
				targets: [{
					format: canvasFormat
				}]
			}
		})

		const quadVertices = new Float32Array([
			-0.8, -0.8,
			0.8, -0.8,
			0.8,  0.8,
			-0.8, -0.8,
			0.8,  0.8,
			-0.8,  0.8,
		]);

		/** GPUBuffer containing the vertices data represented by the Float32 TypedArray.
		 *  Most of its properties are immutable, 
		 *  but we can change the contents of the buffer memory.
		 * 
		 * The buffer memory is intially set to 0. */
		const vertexBuffer: GPUBuffer = device.createBuffer({
			// debug name
			label: "Cell vertices",
			// define mem usage
			size: quadVertices.byteLength,
			// GPUBufferUsage flags, former marks this as vertex data,
			// the latter flag allows us to copy data into it
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		// This copies the contents of the TypedArray into the vertex buffer on the device.
		device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, quadVertices);

		// --- BIND UNIFORMS
		const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
		const uniformBuffer: GPUBuffer = device.createBuffer({
			label: "Grid Uniforms",
			size: uniformArray.byteLength,
			// GPUBufferUsage flags, former marks this as uniform data,
			// the latter flag allows us to copy data into it
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		})
		device.queue.writeBuffer(uniformBuffer, /*bufferOffset=*/ 0, uniformArray);

		// TODO: ensure below comment is valid
		// bind group describes the connection between shader stuff and extra input buffers
		const bindGroup: GPUBindGroup = device.createBindGroup({
			label: "Cell renderer bind group",
			// bind group layout 0 corresponds to @group(0) in shader
			layout: renderPipeline.getBindGroupLayout(0),
			entries: [{
				binding: 0,
				resource: {
					buffer: uniformBuffer
				}
			}]
		})

		// --- EXECUTE RENDER PASS
		renderPass.setPipeline(renderPipeline);
		renderPass.setVertexBuffer(0, vertexBuffer);

		// declaring 'that each @binding that's part of @group(0) uses the resources in this bind group'
		renderPass.setBindGroup(0, bindGroup);

		// tell it to draw the number of rendered verts
		// this here is the length of the vert array / 2, as each vert is a vec2
		renderPass.draw(quadVertices.length / 2);

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