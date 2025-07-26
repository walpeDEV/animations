#version 300 es

in vec2 vertexPosition;

out vec2 uv;

void main() {
    uv = vertexPosition;
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}
