<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders';
	import { Renderer, Program, Color, Mesh, Triangle, Vec2, Vec3 } from 'ogl';
	import seedrandom from 'seedrandom';
	import { generateRandomString } from '../../utils/maths/random';

    export let seed = "intro";
    export let url: string;

    let nextSeed = generateRandomString(10);
	let container: HTMLDivElement;

	onMount(() => {
		// setup WebGL Canvas
		const renderer = new Renderer();
		const gl = renderer.gl;
		container.appendChild(gl.canvas);

		// setup predictable RNG
		const prng = seedrandom(seed);
		
		// setup uniforms
		const uRes = { value: new Vec2(0, 0) };
		const uPoint1 = { value: new Vec2(-0.25, -0.25) };
		const uPoint2 = { value: new Vec2(0.25, 0.25) };
		const uPaletteInput1 = { value: new Vec3(prng.quick(), prng.quick(), prng.quick()) };
		const uPaletteInput2 = { value: new Vec3(prng.quick(), prng.quick(), prng.quick()) };
		const uPaletteInput3 = { value: new Vec3(prng.quick(), prng.quick(), prng.quick()) };
		const uPaletteInput4 = { value: new Vec3(prng.quick(), prng.quick(), prng.quick()) };
		const uLength = { value: (prng.quick() + 1) / 2 };

		// setup resize handlers
		const handleResize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			uRes.value.x = window.innerWidth;
			uRes.value.y = window.innerHeight;
		}
		window.addEventListener("resize", handleResize);
		handleResize();

		// setup full screen tri
		const geometry = new Triangle(gl);

		// create shader program
		const shaderUniforms = {
			uTime: { value: 0 },
			uColor: { value: new Color(0.3, 0.2, 0.5) },
			uRes,
			uPoint1,
			uPoint2,
			uLength,
			uPaletteInput1,
			uPaletteInput2,
			uPaletteInput3,
			uPaletteInput4
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
		}
	}
</style>


<div bind:this={container} class="container">
	<h1 
        transition:fade={{ duration: 3000, easing: quintOut }} 
        class="default-heading"
    >
        Complex Numbers
    </h1>
	<p>
		Thanks to:
		<a href="https://hturan.com/writing/complex-numbers-glsl" rel="noreferrer" target="_parent">
			Harley Turan
		</a>
		<a href={`${url}/complex-numbers/${nextSeed}`} rel="noreferrer" target="_parent">
			RANDOM
		</a>
	</p>
</div>