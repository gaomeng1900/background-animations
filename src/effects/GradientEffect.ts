/**
 * Animated vertical gradient effect with two color pairs
 */
import { BackgroundEffect } from '../core/BackgroundEffect'
import gradientFragmentShader from '../shaders/gradient/fragment.glsl'
import gradientVertexShader from '../shaders/gradient/vertex.glsl'

export type GradientOptions = {
	pairs: [[string, string], [string, string]]
}

/**
 * Parse CSS color string to normalized RGB vec3
 */
function parseColor(colorStr: string): [number, number, number] {
	const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
	if (!match) {
		throw new Error(`Invalid color format: ${colorStr}. Use format: rgb(r, g, b)`)
	}
	const [, r, g, b] = match
	return [parseInt(r) / 255, parseInt(g) / 255, parseInt(b) / 255]
}

export class GradientEffect extends BackgroundEffect {
	private uColor1: WebGLUniformLocation | null = null
	private uColor2: WebGLUniformLocation | null = null
	private uColor3: WebGLUniformLocation | null = null
	private uColor4: WebGLUniformLocation | null = null
	private colors: [number, number, number][]

	constructor(options: GradientOptions) {
		super(gradientVertexShader, gradientFragmentShader)

		// Parse colors from pairs
		this.colors = [
			parseColor(options.pairs[0][0]), // First pair, first color
			parseColor(options.pairs[0][1]), // First pair, second color
			parseColor(options.pairs[1][0]), // Second pair, first color
			parseColor(options.pairs[1][1]), // Second pair, second color
		]

		// Get uniform locations
		this.uColor1 = this.gl.getUniformLocation(this.program, 'uColor1')
		this.uColor2 = this.gl.getUniformLocation(this.program, 'uColor2')
		this.uColor3 = this.gl.getUniformLocation(this.program, 'uColor3')
		this.uColor4 = this.gl.getUniformLocation(this.program, 'uColor4')
	}

	protected override updateUniforms(time: number): void {
		// Set color uniforms each frame (they're static but need to be set when program is active)
		if (this.uColor1) this.gl.uniform3f(this.uColor1, ...this.colors[0])
		if (this.uColor2) this.gl.uniform3f(this.uColor2, ...this.colors[1])
		if (this.uColor3) this.gl.uniform3f(this.uColor3, ...this.colors[2])
		if (this.uColor4) this.gl.uniform3f(this.uColor4, ...this.colors[3])
	}
}
