import { PALETTE_GENERATOR } from "../../utils/shaders/colors";
import { COMPLEX_MATHS } from "../../utils/shaders/maths";

export const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 uv;
in vec2 position;

out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision mediump float;

uniform float uTime;
uniform vec2 uRes;

uniform vec2 uPoint1;
uniform vec2 uPoint2;
uniform vec3 uPaletteInput1;
uniform vec3 uPaletteInput2;
uniform vec3 uPaletteInput3;
uniform vec3 uPaletteInput4;
uniform float uLength;

out vec4 fragColor;

${COMPLEX_MATHS}
${PALETTE_GENERATOR}

void main() {
    // map to range of -0.5 to 0.5
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / min(uRes.y, uRes.x);

    // for ease of replicating maths equations
    vec2 z = uv;
    // vec2 p = uPoint1;
    // vec2 q = uPoint2;
      
    // spin points
    float angle = uTime / 15.0 * PI;
    float c = cos(angle);
    float s = sin(angle);  
    vec2 p = vec2( s * uLength, c * uLength );
    vec2 q = vec2( s * -uLength, c * -uLength );

    // Divide z-p by z-q using complex division
    vec2 division = cx_div((z - p), (z - q));
    
    // Calculate the log of our division
    vec2 log_p_over_q = cx_log(division);
    
    // Extract the imaginary number
    float imaginary = log_p_over_q.y;

    vec3 color = palette(
        imaginary,
        uPaletteInput1,
        uPaletteInput2,
        uPaletteInput3,
        uPaletteInput4
    );

    fragColor = vec4(color, 1.0);
}
`;
