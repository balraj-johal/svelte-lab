// All shaders here are written in WGSL

export const CELL_SHADER = `
@group(0) @binding(0) var<uniform> grid: vec2f;

@vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
    let gridPosBottomLeft = (pos + 1) / grid - 1;

    return vec4f(gridPosBottomLeft, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}
`