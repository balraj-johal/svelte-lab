export const VERTEX_SHADER = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
    gl_FragColor.rgb = 0.5 + 0.3 * cos(vUv.xyx + uTime) + uColor;
    gl_FragColor.a = 1.0;
}
`;
