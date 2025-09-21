#version 300 es
precision lowp float;
#include <../utils/noise.glsl>

in vec2 vUV;
out vec4 outColor;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPercent;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;

void main() {
	// Calculate factors for smoother 3-way blending
	float factor1, factor2, factor3;

	if(uPercent < 0.5) {
		// First half: transition from pair1 to pair2
		factor1 = 1.0 - (uPercent * 2.0);
		factor2 = uPercent * 2.0;
		factor3 = 0.0;
	} else {
		// Second half: transition from pair2 to pair3
		float t = (uPercent - 0.5) * 2.0;
		factor1 = 0.0;
		factor2 = 1.0 - t;
		factor3 = t;
	}

	// Scale UV coordinates for better noise patterns
	vec2 scaledUV = vUV * 8.0; // Scale up for more detail
	vec2 scaledPointer = uPointer * 2.0; // Scale pointer influence

	// Create 4D noise input: scaled uv + pointer, time, percent
	vec4 noiseInput = vec4(scaledUV + scaledPointer, uTime * 0.3, uPercent * 5.0);

	// Generate noise for each pair with different offsets and amplitudes
	float noise1 = cnoise(noiseInput + vec4(0.0, 0.0, 0.0, 0.0)) * 0.8;
	float noise2 = cnoise(noiseInput + vec4(100.0, 100.0, 10.0, 0.0)) * 0.8;
	float noise3 = cnoise(noiseInput + vec4(200.0, 200.0, 20.0, 0.0)) * 0.8;

	// Convert noise from [-0.8,0.8] to [0.1,0.9] range for better mixing
	float mixFactor1 = noise1 * 0.4 + 0.5;
	float mixFactor2 = noise2 * 0.4 + 0.5;
	float mixFactor3 = noise3 * 0.4 + 0.5;

	// Mix colors within each pair using noise
	vec3 color1 = mix(uColor1, uColor2, mixFactor1);
	vec3 color2 = mix(uColor3, uColor4, mixFactor2);
	vec3 color3 = mix(uColor5, uColor6, mixFactor3);

	// Final color is weighted sum of all three pairs
	vec3 finalColor = color1 * factor1 + color2 * factor2 + color3 * factor3;

	outColor = vec4(finalColor, 1.0);
}