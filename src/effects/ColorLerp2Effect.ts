/**
 * Simple full-screen color lerp effect with 3 color pairs
 */
import { BackgroundEffect } from '../core/BackgroundEffect'
import colorlerp2FragmentShader from '../shaders/colorlerp2/fragment.glsl'
import colorlerp2VertexShader from '../shaders/colorlerp2/vertex.glsl'

export type ColorLerp2Options = {
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

export class ColorLerp2Effect extends BackgroundEffect {
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
	private targetPointer: [number, number]
	private pointerListener?: (e: MouseEvent) => void

	constructor(options: ColorLerp2Options) {
		super(colorlerp2VertexShader, colorlerp2FragmentShader)

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
		this.targetPointer = [...this.pointer]

		// Get uniform locations
		this.uColor1 = this.gl.getUniformLocation(this.program, 'uColor1')
		this.uColor2 = this.gl.getUniformLocation(this.program, 'uColor2')
		this.uColor3 = this.gl.getUniformLocation(this.program, 'uColor3')
		this.uColor4 = this.gl.getUniformLocation(this.program, 'uColor4')
		this.uColor5 = this.gl.getUniformLocation(this.program, 'uColor5')
		this.uColor6 = this.gl.getUniformLocation(this.program, 'uColor6')
		this.uPercent = this.gl.getUniformLocation(this.program, 'uPercent')
		this.uPointer = this.gl.getUniformLocation(this.program, 'uPointer')

		this.setupPointerTracking()

		// Enable pointer events for this effect
		this.element.style.pointerEvents = 'auto'
	}

	private setupPointerTracking(): void {
		this.pointerListener = (e: MouseEvent) => {
			const rect = this.element.getBoundingClientRect()
			const x = (e.clientX - rect.left) / rect.width
			const y = 1.0 - (e.clientY - rect.top) / rect.height // Flip Y for WebGL
			this.targetPointer = [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))]
		}
	}

	override start(): void {
		super.start()
		if (this.pointerListener) {
			this.element.addEventListener('mousemove', this.pointerListener)
		}
	}

	override dispose(): void {
		if (this.pointerListener) {
			this.element.removeEventListener('mousemove', this.pointerListener)
		}
		super.dispose()
	}

	override updateOptions(options: Partial<ColorLerp2Options>): void {
		if (options.pairs) {
			this.colors = [
				parseColor(options.pairs[0][0]), // First pair, first color
				parseColor(options.pairs[0][1]), // First pair, second color
				parseColor(options.pairs[1][0]), // Second pair, first color
				parseColor(options.pairs[1][1]), // Second pair, second color
				parseColor(options.pairs[2][0]), // Third pair, first color
				parseColor(options.pairs[2][1]), // Third pair, second color
			]
		}
		if (options.percent !== undefined) {
			this.percent = Math.max(0, Math.min(1, options.percent))
		}
		if (options.pointer) {
			this.pointer = options.pointer
			this.targetPointer = [...this.pointer]
		}
	}

	updatePercent(percent: number): void {
		this.percent = Math.max(0, Math.min(1, percent))
	}

	protected override updateUniforms(time: number): void {
		// Smooth pointer interpolation
		this.pointer[0] = this.pointer[0] + (this.targetPointer[0] - this.pointer[0]) * 0.1
		this.pointer[1] = this.pointer[1] + (this.targetPointer[1] - this.pointer[1]) * 0.1

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
