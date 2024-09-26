import { Vec2, RenderTarget, Mesh, Triangle, Program } from 'ogl';
import type { OGLRenderingContext } from 'ogl';

interface MouseMapOptions {
	textureSize?: number;
	mouseTrailSize?: number;
	alpha?: number;
	dissipation?: number;
	type?: number;
}
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

uniform sampler2D tMap;

uniform float uMouseTrailSize;
uniform float uAlpha;
uniform float uDissipation;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {
		vec4 color = texture2D(tMap, vUv) * uDissipation;

		vec2 cursor = vUv - uMouse;
		cursor.x *= uAspect;

		vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
		float mouseTrailSize = smoothstep(uMouseTrailSize, 0.0, length(cursor)) * uAlpha;

		color.rgb = mix(color.rgb, stamp, vec3(mouseTrailSize));

		gl_FragColor = color;
}
`;

export class MouseMap {
	gl: OGLRenderingContext;
	uniform: { value: WebGLTexture | null };
	mask: {
		read: RenderTarget | null;
		write: RenderTarget | null;
		swap: () => void;
	};
	aspect: number;
	mouse: Vec2;
	velocity: Vec2;
	mesh: Mesh;

	constructor(
		gl: OGLRenderingContext,
		{
			textureSize = 128,
			mouseTrailSize = 0.125,
			alpha = 1,
			dissipation = 0.875,
			type
		}: MouseMapOptions = {}
	) {
		this.gl = gl;

		this.uniform = { value: null };

		this.mask = {
			read: null,
			write: null,
			swap: () => {
				const temp = this.mask.read;
				if (!this.mask.read) {
					console.error('No texture on the mask.');
					return;
				}
				this.mask.read = this.mask.write;
				this.mask.write = temp;
				this.uniform.value = this.mask.read!.texture;
			}
		};

		const createFBOs = () => {
			// Requested type not supported, fall back to half float
			if (!type) type = 5131 || gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

			const minFilter = (() => {
				if (gl.renderer.isWebgl2) return gl.LINEAR;
				if (gl.renderer.extensions[`OES_texture_${type === gl.FLOAT ? '' : 'half_'}float_linear`])
					return gl.LINEAR;
				return gl.NEAREST;
			})();

			const options = {
				width: textureSize,
				height: textureSize,
				type,
				format: gl.RGBA,
				internalFormat: gl.renderer.isWebgl2 ? (type === gl.FLOAT ? 34836 : 34842) : gl.RGBA,
				minFilter,
				depth: false
			};

			this.mask.read = new RenderTarget(gl, options);
			this.mask.write = new RenderTarget(gl, options);
			this.mask.swap();
		};

		createFBOs();

		this.aspect = 1;
		this.mouse = new Vec2();
		this.velocity = new Vec2();

		const initProgram = () => {
			return new Mesh(gl, {
				geometry: new Triangle(gl),
				program: new Program(gl, {
					vertex,
					fragment,
					uniforms: {
						tMap: this.uniform,
						uMouseTrailSize: { value: mouseTrailSize * 0.5 },
						uAlpha: { value: alpha },
						uDissipation: { value: dissipation },
						uAspect: { value: 1 },
						uMouse: { value: this.mouse },
						uVelocity: { value: this.velocity }
					},
					depthTest: false
				})
			});
		};

		this.mesh = initProgram();
	}

	update() {
		this.mesh.program.uniforms.uAspect.value = this.aspect;

		const target = this.mask.write === null ? undefined : this.mask.write;

		this.gl.renderer.render({
			scene: this.mesh,
			target: target,
			clear: false
		});
		this.mask.swap();
	}
}
