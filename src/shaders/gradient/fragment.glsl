#version 300 es
precision lowp float;

in vec2 vUV;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

void main() {
	// Vertical gradient (Y coordinate)
	float t = vUV.y;

	// Animate between two color pairs
	float animationT = sin(uTime * 0.5) * 0.5 + 0.5;

	// First pair: color1 to color2
	vec3 gradient1 = mix(uColor1, uColor2, t);

	// Second pair: color3 to color4
	vec3 gradient2 = mix(uColor3, uColor4, t);

	// Animate between the two gradients
	vec3 finalColor = mix(gradient1, gradient2, animationT);

	outColor = vec4(finalColor, 1.0);
}
