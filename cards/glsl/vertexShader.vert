#version 300 es

in vec2 vertexPosition;

uniform mat4 u_positionMatrix;

out vec2 uv;

void main() {
    uv = vertexPosition;
    gl_Position = u_positionMatrix * vec4(vertexPosition, 0.0, 1.0);
}
