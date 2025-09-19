/**
 * Simple UV map effect - displays UV coordinates as red-green colors
 */
import { BackgroundEffect } from '../core/BackgroundEffect'
import uvFragmentShader from '../shaders/uvmap/fragment.glsl'
import uvVertexShader from '../shaders/uvmap/vertex.glsl'

export class UVMapEffect extends BackgroundEffect {
	constructor() {
		super(uvVertexShader, uvFragmentShader)
	}

	// No custom uniforms needed - just uses uTime and uResolution from base class
}
