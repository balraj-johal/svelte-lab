<script lang="ts">
	import { onMount } from 'svelte';
	import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
	import { MouseMap } from './MouseMap';

	let container: HTMLDivElement;

	onMount(() => {
		const vertex = /* glsl */ `
		attribute vec2 uv;
		attribute vec2 position;

		varying vec2 vUv;

		void main() {
				vUv = uv;
				gl_Position = vec4(position, 0, 1);
		}
`;

		const fragment = /* glsl */ `
		precision highp float;

		uniform sampler2D tFlow;
		uniform float uTime;

		varying vec2 vUv;

		void main() {

				// R and G values are velocity in the x and y direction
				// B value is the velocity length
				vec3 flow = texture2D(tFlow, vUv).rgb;

				gl_FragColor.rgb = flow;
				gl_FragColor.a = 1.0;
		}
`;

		const renderer = new Renderer({ dpr: window.devicePixelRatio });
		const gl = renderer.gl;

		container.appendChild(gl.canvas);
		gl.clearColor(0.5, 0.5, 0.5, 0.5);

		// setup resize handlers
		const aspectRatio = { value: 1 };
		const windowDimensions = { innerWidth: 0, innerHeight: 0 };
		const handleResize = () => {
			windowDimensions.innerWidth = window.innerWidth;
			windowDimensions.innerHeight = window.innerHeight;

			const { innerHeight, innerWidth } = windowDimensions;
			renderer.setSize(innerWidth, innerHeight);
			aspectRatio.value = innerWidth / innerHeight;
		};
		window.addEventListener('resize', handleResize);
		handleResize();

		// setup mouse input listener
		const mouseInfo = {
			lastDetectedTime: 0,
			position: new Vec2(-1),
			lastPosition: new Vec2(),
			velocity: new Vec2()
		};

		function updateMouse({ pageX, pageY }: MouseEvent) {
			const x = pageX;
			const y = pageY;

			mouseInfo.position.set(x / windowDimensions.innerWidth, 1 - y / windowDimensions.innerHeight);

			if (!mouseInfo.lastDetectedTime) {
				mouseInfo.lastDetectedTime = performance.now();
				mouseInfo.lastPosition.set(x, y);
			}

			const deltaMouse = {
				x: x - mouseInfo.lastPosition.x,
				y: y - mouseInfo.lastPosition.y
			};
			mouseInfo.lastPosition.set(x, y);

			const currentTime = performance.now();
			// TODO: why 14 here?
			const deltaTime = Math.max(14, currentTime - mouseInfo.lastDetectedTime);
			mouseInfo.lastDetectedTime = currentTime;

			mouseInfo.velocity.set(deltaMouse.x / deltaTime, deltaMouse.y / deltaTime);

			console.log(mouseInfo.position, mouseInfo.velocity);
			// Flag update to prevent hanging velocity values when not moving
			// mouseInfo.mouseVelocity.needsUpdate = true;
		}

		window.addEventListener('mousemove', updateMouse, false);

		const mouseMap = new MouseMap(gl, { type: gl.FLOAT });

		// setup full screen tri
		const geometry = new Triangle(gl);

		const program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				uTime: { value: 0 },

				// Note that the uniform is applied without using an object and value property
				// This is because the class alternates this texture between two render targets
				// and updates the value property after each render.
				tFlow: mouseMap.uniform
			}
		});

		const mesh = new Mesh(gl, { geometry, program });

		const renderFrame = (t: number) => {
			requestAnimationFrame(renderFrame);

			// Reset velocity when mouse not moving
			// if (!mouseInfo.mouseVelocity.needsUpdate) {
			// 	mouseInfo.mousePosition.set(-1);
			// 	mouseInfo.mouseVelocity.set(0);
			// }

			// Update flowmap inputs
			mouseMap.aspect = aspectRatio.value;
			mouseMap.mouse.copy(mouseInfo.position);

			mouseMap.velocity.lerp(mouseInfo.velocity, mouseInfo.velocity.len() ? 0.5 : 0.1);
			mouseMap.update();

			program.uniforms.uTime.value = t * 0.001;

			renderer.render({ scene: mesh });
		};

		requestAnimationFrame(renderFrame);
	});
</script>

<div bind:this={container} class="container">
	<h1 class="default-heading">Mouse Map</h1>
</div>

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
