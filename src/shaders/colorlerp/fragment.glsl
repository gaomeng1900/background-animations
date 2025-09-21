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

// mix three colors based on factors.
// 1~0.5 mix colorA and colorB
// 0.5~0 mix colorB and colorC
vec4 mixColorsLinear(vec4 colorA, vec4 colorB, vec4 colorC, float factor) {
	return factor < 0.5 ? mix(colorA, colorB, factor * 2.0) : mix(colorB, colorC, (factor - 0.5) * 2.0);
}

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
	// float mask = smoothstep(-0.4, 1.2, vUV.x - vUV.y);
	float mask = smoothstep(-0.8, 0.9, vUV.x - vUV.y);

	return clamp(value * mask, 0.0, 1.0);
}

float fbm(in vec3 x) {
	float H = 1.5;
	float t = 0.0;
	for(int i = 0; i < 4; i++) {
		float f = pow(2.0, float(i));
		float a = pow(f, -H);
		t += a * cnoise(f * x);
	}
	return t;
}

float fbm(in vec4 x) {
	float H = 1.5;
	float t = 0.0;
	for(int i = 0; i < 4; i++) {
		float f = pow(2.0, float(i));
		float a = pow(f, -H);
		t += a * cnoise(f * x);
	}
	return t;
}

float pattern(in vec3 p) {
	vec3 q, r;

	q.x = fbm(p + vec3(0.0, 0.0, 0.0));
	q.y = fbm(p + vec3(5.2, 1.3, 0.0));

	r.x = fbm(p + 4.0 * q + vec3(1.7, 9.2, 0.0));
	r.y = fbm(p + 4.0 * q + vec3(8.3, 2.8, 0.0));

	return fbm(p + 4.0 * r);
}

float pattern(in vec4 p) {
	vec4 q, r;

	q.x = fbm(p + vec4(0.0, 0.0, 0.0, 0.0));
	q.y = fbm(p + vec4(5.2, 1.3, 0.0, 0.0));

	r.x = fbm(p + 4.0 * q + vec4(1.7, 9.2, 0.0, 0.0));
	r.y = fbm(p + 4.0 * q + vec4(8.3, 2.8, 0.0, 0.0));

	return fbm(p + 4.0 * r);
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

	// Scale UV coordinates for better noise patterns
	vec2 scaledUV = vUV * 9.0; // Scale up for more detail
	vec2 scaledPointer = uPointer * 2.0; // Scale pointer influence

	float disToPointer = distance(vUV, uPointer);
	float factorPointer = 1.0 - smoothstep(0.0, 0.4, disToPointer);

	// Create 4D noise input: scaled uv + pointer, time, percent
	// vec4 noiseInput = vec4(scaledUV - scaledPointer, uTime * 0.9, uPercent * 5.0);

	// 1

	// Generate noise for each pair with different offsets and amplitudes
	float noise1 = snoise(vec4(scaledUV * 0.7 - scaledPointer, uTime * 0.9, uPercent * 5.0) * 0.3);
	float mixFactor1 = noise1 * 0.8 + 0.4 + factorPointer;
	mixFactor1 = fullScreenMask(mixFactor1);
	// Mix colors within each pair using noise
	// vec3 color1 = mix(uColor1, uColor2, mixFactor1);
	// vec4 color1 = mixColorsLinear(vec4(0.0), vec4(uColor1, 1.0), vec4(uColor2, 1.0), mixFactor1);
	vec4 color1 = mixColorsTransparent(uColor1, uColor2, mixFactor1);

	// 2

	vec3 noiseInput2 = vec3(scaledUV * 0.7 - scaledPointer * 0.5, uTime * 0.6 + uPercent * 5.0);
	// float noise2 = cellular2x2x2(noiseInput2).x;
	// float mixFactor2 = noise2 * 0.8 + 0.0 + factorPointer * 0.7;
	// noise2 = smoothstep(0.3, 1.0, 1.0 - noise2);
	float noise2 = worley(noiseInput2, uPercent * 0.8, false).x;
	float mixFactor2 = noise2 * 0.4 + 0.0 + factorPointer * 0.7;
	mixFactor2 = fullScreenMask(mixFactor2);
	// vec4 color2 = mixColorsLinear(vec4(0.0), vec4(uColor3, 1.0), vec4(uColor4, 1.0), mixFactor2);
	vec4 color2 = mixColorsTransparent(uColor3, uColor4, mixFactor2);

	// 3

	// float noise3 = cnoise(noiseInput);
	// float mixFactor3 = noise3 * 0.4 + 0.5;
	// vec4 color3 = mixColorsLinear(vec4(0.0), vec4(uColor5, 1.0), vec4(uColor6, 1.0), mixFactor3);

	// vec3 noiseInput3 = vec3(scaledUV * 0.1 - scaledPointer * 0.1, uTime * 0.03 + uPercent * 0.9);
	// float noise3 = fbm(noiseInput3);
	vec4 noiseInput3 = vec4(scaledUV * 0.1 - scaledPointer * 0.1, uTime * 0.03, uPercent * 0.4);
	float noise3 = pattern(noiseInput3);
	float mixFactor3 = noise3 * 0.9 + 0.1 + factorPointer * 0.5;
	mixFactor3 = fullScreenMask(mixFactor3);
	vec4 color3 = mixColorsTransparent(uColor5, uColor6, mixFactor3);

	// float x = fbm(vec4(scaledUV * 1.3 - scaledPointer * 0.3, uTime * 0.2, uPercent * 5.0));
	// float y = cnoise(vec4(scaledUV * 1.3 - scaledPointer * 0.3, uTime * 0.2, uPercent * 5.0));

	// Final color is weighted sum of all three pairs

	vec4 finalColor;
	finalColor.rgb = color1.rgb * factor1 + color2.rgb * factor2 + color3.rgb * factor3;
	finalColor.a = max(color1.a * factor1, max(color2.a * factor2, color3.a * factor3));

	// Add film grain noise for texture
	vec2 grainUV = vUV * uResolution.xy; // High frequency for fine grain
	float grain = (random(grainUV + uTime) - 0.5) * 0.05;
	finalColor.rgb += grain;

	// mask
	// Linear gradient mask: left-top transparent, right-bottom opaque
	// float mask = smoothstep(-0.4, 1.2, vUV.x - vUV.y);
	// finalColor.a *= mask;
	finalColor.rgb *= finalColor.a;

	outColor = finalColor;

	// outColor = vec4(disToPointer);

}