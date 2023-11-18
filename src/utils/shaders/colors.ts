/** From https://iquilezles.org/www/articles/palettes/palettes.htm */
export const PALETTE_GENERATOR = `
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b * cos(2.0 * PI * (c * t + d));
}
`
