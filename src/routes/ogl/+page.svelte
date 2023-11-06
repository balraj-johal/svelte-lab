<script lang="ts">
	import { onMount } from 'svelte';
	import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders';
	import { Renderer, Program, Color, Mesh, Triangle } from 'ogl';

	let container: HTMLDivElement;

	onMount(() => {
		const renderer = new Renderer();
		const gl = renderer.gl;

		container.appendChild(gl.canvas);
		gl.clearColor(0.5, 0.5, 0.5, 0.5);

		// setup resize handlers
		const handleResize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		window.addEventListener("resize", handleResize);
		handleResize();

		// setup full screen tri
		const geometry = new Triangle(gl);

		// create shader program
		const shaderUniforms = {
			uTime: { value: 0 },
			uColor: { value: new Color(0.3, 0.2, 0.5) },
		}
		const shaderProgram = new Program(gl, {
			vertex: VERTEX_SHADER,
			fragment: FRAGMENT_SHADER,
			uniforms: shaderUniforms,
		})

		const mesh = new Mesh(gl, { geometry, program: shaderProgram });
		
		const renderFrame = (t: number) => {
			requestAnimationFrame(renderFrame);
			
			shaderProgram.uniforms.uTime.value = t * 0.001;
			
			renderer.render({ scene: mesh });
		}
		requestAnimationFrame(renderFrame);
	});
</script>

<style lang="scss">
	.container {
		h1 {
			position: absolute;
			bottom: 1rem;
			left: 1rem;
			margin: 0;
		}
	}
</style>


<div bind:this={container} class="container">
	<h1 class="default-heading">Simple OGL Scene</h1>
</div>