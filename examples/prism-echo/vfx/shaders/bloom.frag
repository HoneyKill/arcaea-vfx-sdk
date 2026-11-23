varying vec2 v_uv;
uniform sampler2D u_srcTex;
uniform vec4 u_glow;

/** Extract and soften light from the prism pass for additive composition. */
void main() {
    vec2 stepSize = vec2(0.006 / u_glow.x, 0.006);
    vec3 bloom = vec3(0.0);
    for (int y = -1; y <= 1; ++y) {
        for (int x = -1; x <= 1; ++x) {
            vec3 color = texture2D(u_srcTex, v_uv + vec2(float(x), float(y)) * stepSize).rgb;
            float peak = max(color.r, max(color.g, color.b));
            float weight = (2.0 - abs(float(x))) * (2.0 - abs(float(y)));
            bloom += color * smoothstep(0.40, 0.90, peak) * weight;
        }
    }
    gl_FragColor = vec4(bloom * (0.019 * u_glow.y), 0.0);
}
