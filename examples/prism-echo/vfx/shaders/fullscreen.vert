attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_uv;

/** Forward clip-space geometry and the matching source coordinates. */
void main() {
    v_uv = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
