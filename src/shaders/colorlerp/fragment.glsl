#version 300 es
precision lowp float;

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
	// Simple full-screen color lerp between 3 pairs based on percent

	// Use the average of each pair as the representative color
	vec3 pair1 = mix(uColor1, uColor2, 0.5);
	vec3 pair2 = mix(uColor3, uColor4, 0.5);
	vec3 pair3 = mix(uColor5, uColor6, 0.5);

	// Lerp between the 3 pairs based on percent
	vec3 finalColor;
	if (uPercent < 0.5) {
		// Lerp between pair1 and pair2
		finalColor = mix(pair1, pair2, uPercent * 2.0);
	} else {
		// Lerp between pair2 and pair3
		finalColor = mix(pair2, pair3, (uPercent - 0.5) * 2.0);
	}

	outColor = vec4(finalColor, 1.0);
}