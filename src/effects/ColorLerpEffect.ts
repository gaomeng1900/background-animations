/**
 * Simple full-screen color lerp effect with 3 color pairs
 */
import { BackgroundEffect } from '../core/BackgroundEffect'
import colorlerpFragmentShader from '../shaders/colorlerp/fragment.glsl'
import colorlerpVertexShader from '../shaders/colorlerp/vertex.glsl'

export type ColorLerpOptions = {
	pairs: [[string, string], [string, string], [string, string]]
	percent?: number
	pointer?: [number, number]
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

export class ColorLerpEffect extends BackgroundEffect {
	private uColor1: WebGLUniformLocation | null = null
	private uColor2: WebGLUniformLocation | null = null
	private uColor3: WebGLUniformLocation | null = null
	private uColor4: WebGLUniformLocation | null = null
	private uColor5: WebGLUniformLocation | null = null
	private uColor6: WebGLUniformLocation | null = null
	private uPercent: WebGLUniformLocation | null = null
	private uPointer: WebGLUniformLocation | null = null

	private colors: [number, number, number][]
	private percent: number
	private pointer: [number, number]

	constructor(options: ColorLerpOptions) {
		super(colorlerpVertexShader, colorlerpFragmentShader)

		// Parse colors from pairs
		this.colors = [
			parseColor(options.pairs[0][0]), // First pair, first color
			parseColor(options.pairs[0][1]), // First pair, second color
			parseColor(options.pairs[1][0]), // Second pair, first color
			parseColor(options.pairs[1][1]), // Second pair, second color
			parseColor(options.pairs[2][0]), // Third pair, first color
			parseColor(options.pairs[2][1]), // Third pair, second color
		]

		this.percent = options.percent ?? 0.0
		this.pointer = options.pointer ?? [0.5, 0.5]

		// Get uniform locations
		this.uColor1 = this.gl.getUniformLocation(this.program, 'uColor1')
		this.uColor2 = this.gl.getUniformLocation(this.program, 'uColor2')
		this.uColor3 = this.gl.getUniformLocation(this.program, 'uColor3')
		this.uColor4 = this.gl.getUniformLocation(this.program, 'uColor4')
		this.uColor5 = this.gl.getUniformLocation(this.program, 'uColor5')
		this.uColor6 = this.gl.getUniformLocation(this.program, 'uColor6')
		this.uPercent = this.gl.getUniformLocation(this.program, 'uPercent')
		this.uPointer = this.gl.getUniformLocation(this.program, 'uPointer')
	}

	setPercent(value: number): void {
		this.percent = Math.max(0, Math.min(1, value))
	}

	setPointer(x: number, y: number): void {
		this.pointer = [x, y]
	}

	setColors(pairs: [[string, string], [string, string], [string, string]]): void {
		this.colors = [
			parseColor(pairs[0][0]), // First pair, first color
			parseColor(pairs[0][1]), // First pair, second color
			parseColor(pairs[1][0]), // Second pair, first color
			parseColor(pairs[1][1]), // Second pair, second color
			parseColor(pairs[2][0]), // Third pair, first color
			parseColor(pairs[2][1]), // Third pair, second color
		]
	}

	protected override updateUniforms(time: number): void {
		// Set color uniforms
		if (this.uColor1) this.gl.uniform3f(this.uColor1, ...this.colors[0])
		if (this.uColor2) this.gl.uniform3f(this.uColor2, ...this.colors[1])
		if (this.uColor3) this.gl.uniform3f(this.uColor3, ...this.colors[2])
		if (this.uColor4) this.gl.uniform3f(this.uColor4, ...this.colors[3])
		if (this.uColor5) this.gl.uniform3f(this.uColor5, ...this.colors[4])
		if (this.uColor6) this.gl.uniform3f(this.uColor6, ...this.colors[5])

		// Set dynamic uniforms
		if (this.uPercent) this.gl.uniform1f(this.uPercent, this.percent)
		if (this.uPointer) this.gl.uniform2f(this.uPointer, ...this.pointer)
	}
}
