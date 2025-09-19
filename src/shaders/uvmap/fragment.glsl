#version 300 es
precision lowp float;

in vec2 vUV;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;

void main() {
	// Simple UV map: red = X coordinate, green = Y coordinate
	vec3 color = vec3(vUV.x, vUV.y, 0.0);
	outColor = vec4(color, 1.0);
}
