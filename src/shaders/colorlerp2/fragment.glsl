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

// mix 2 colors with transparent based on factors.
// 1~0.5 mix transparent and colorA
// 0.5~0 mix transparent, colorA and colorB
vec4 mixColorsTransparent(vec3 colorA, vec3 colorB, float factor) {
	// return factor < 0.5 ? mix(vec4(0.0), vec4(colorA, 1.0), factor) : mix(vec4(colorA, 1.0), vec4(colorB, 1.0), (factor - 0.5) * 2.0);
	factor = clamp(factor, 0.0, 1.0);
	vec3 color = mix(colorA, colorB, smoothstep(0.3, 1.0, factor));
	float alpha = smoothstep(0.0, 0.5, factor);
	return vec4(color, alpha);
}

float fullScreenMask(float value) {
	float base = smoothstep(-1.2, 1.0, vUV.x - vUV.y * 2.4) * 0.4 - 0.2;

	// return base;

	float mask = smoothstep(-1.2, 1.0, vUV.x - vUV.y * 1.1);

	return clamp(value * mask + base, 0.0, 1.0);
}

float random(in vec2 _st) {
	return fract(sin(dot(_st.xy, vec2(12.9898, 78.233))) *
		43758.5453123);
}

void main() {
	// Calculate factors for smoother 3-way blending
	float factor1, factor2, factor3;

	if(uPercent < 0.5) {
		// First half: transition from pair1 to pair2
		// factor1 = 1.0 - (uPercent * 2.0);
		// factor2 = uPercent * 2.0;
		factor2 = smoothstep(0.3, 0.4, uPercent); // Smooth transition
		factor1 = 1.0 - factor2;

		factor3 = 0.0;
	} else {
		// Second half: transition from pair2 to pair3
		factor1 = 0.0;
		// float t = (uPercent - 0.5) * 2.0;
		// factor2 = 1.0 - t;
		// factor3 = t;
		factor3 = smoothstep(0.6, 0.7, uPercent); // Smooth transition
		factor2 = 1.0 - factor3;
	}

	float disToPointer = distance(vUV, uPointer);
	float factorPointer = 1.0 - smoothstep(0.0, 0.4, disToPointer);

	// Create 4D noise input: scaled uv + pointer, time, percent
	// vec4 noiseInput = vec4(scaledUV - scaledPointer, uTime * 0.9, uPercent * 5.0);

	vec3 colorA = uColor1 * factor1 + uColor3 * factor2 + uColor5 * factor3;
	vec3 colorB = uColor2 * factor1 + uColor4 * factor2 + uColor6 * factor3;

	// Generate noise for each pair with different offsets and amplitudes
	float noise1 = snoise(vec4((vUV * 1.3 - uPointer * 0.7) * vec2(1.0, 1.1), uTime * 0.3, uPercent * 2.0));
	float mixFactor1 = noise1 * 0.8 + 0.4 + factorPointer;
	mixFactor1 = fullScreenMask(mixFactor1);
	vec4 finalColor = mixColorsTransparent(colorA, colorB, mixFactor1);

	// Add film grain noise for texture
	vec2 grainUV = vUV * uResolution.xy; // High frequency for fine grain
	float grain = (random(grainUV + uTime) - 0.5) * 0.02;
	finalColor.rgb += grain;

	// mask
	// Linear gradient mask: left-top transparent, right-bottom opaque
	// float mask = smoothstep(-0.4, 1.2, vUV.x - vUV.y);
	// finalColor.a *= mask;
	finalColor.rgb *= finalColor.a;

	outColor = finalColor;

	// outColor = vec4(disToPointer);

}