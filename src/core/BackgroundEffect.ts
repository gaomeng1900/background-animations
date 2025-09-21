/**
 * Base class for WebGL background effects
 */
import { createPlaneGeometry } from './geometry'
import { createProgram } from './program'

export abstract class BackgroundEffect {
	readonly element: HTMLCanvasElement
	protected gl: WebGL2RenderingContext
	protected program: WebGLProgram
	protected vao: WebGLVertexArrayObject | null = null

	private uTime: WebGLUniformLocation | null = null
	private uResolution: WebGLUniformLocation | null = null
	private running = false
	private disposed = false
	private startTime = 0
	private lastTime = 0
	private rafId: number | null = null
	private observer?: ResizeObserver

	constructor(vertexShader: string, fragmentShader: string) {
		// Create canvas
		this.element = document.createElement('canvas')
		this.element.style.display = 'block'
		this.element.style.pointerEvents = 'none'

		// Setup WebGL context
		const gl = this.element.getContext('webgl2', { antialias: false, alpha: true })
		if (!gl) {
			throw new Error('WebGL2 is required but not available.')
		}
		this.gl = gl

		// Create shader program
		this.program = createProgram(gl, vertexShader, fragmentShader)

		// Setup geometry
		this.setupGeometry()

		// Get standard uniform locations
		this.uTime = gl.getUniformLocation(this.program, 'uTime')
		this.uResolution = gl.getUniformLocation(this.program, 'uResolution')
	}

	start(): void {
		if (this.disposed) throw new Error('BackgroundEffect instance has been disposed.')
		if (this.running) return

		this.running = true
		this.startTime = performance.now()

		const loop = () => {
			if (!this.running) return
			this.rafId = requestAnimationFrame(loop)

			const now = performance.now()
			const delta = now - this.lastTime

			// Limit to 30fps for better performance
			if (delta < 1000 / 33) return

			this.lastTime = now
			const t = (now - this.startTime) * 0.001
			this.render(t)
		}
		this.rafId = requestAnimationFrame(loop)
	}

	pause(): void {
		if (this.disposed) throw new Error('BackgroundEffect instance has been disposed.')
		this.running = false
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId)
			this.rafId = null
		}
	}

	dispose(): void {
		if (this.disposed) return
		this.disposed = true
		this.running = false
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId)
			this.rafId = null
		}

		if (this.vao) this.gl.deleteVertexArray(this.vao)
		this.gl.deleteProgram(this.program)

		if (this.observer) this.observer.disconnect()

		this.element.remove()
	}

	resize(width: number, height: number, ratio?: number): void {
		if (this.disposed) throw new Error('BackgroundEffect instance has been disposed.')

		const dpr = ratio ?? 0.5
		const desiredWidth = Math.max(1, Math.floor(width * dpr))
		const desiredHeight = Math.max(1, Math.floor(height * dpr))

		this.element.style.width = `${width}px`
		this.element.style.height = `${height}px`
		this.element.width = desiredWidth
		this.element.height = desiredHeight

		if (this.running) {
			this.gl.viewport(0, 0, this.element.width, this.element.height)
		}
	}

	autoResize(sourceElement: HTMLElement): void {
		if (this.observer) {
			this.observer.disconnect()
		}

		this.observer = new ResizeObserver(() => {
			const rect = sourceElement.getBoundingClientRect()
			this.resize(rect.width, rect.height)
		})

		this.observer.observe(sourceElement)
	}

	// Hook for subclasses to update their custom uniforms
	protected updateUniforms(time: number): void {}

	// Hook for subclasses to update their options dynamically
	updateOptions(options: any): void {}

	private setupGeometry(): void {
		const { positions, uvs } = createPlaneGeometry()

		this.vao = this.gl.createVertexArray()
		this.gl.bindVertexArray(this.vao)

		// Position buffer
		const positionBuffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW)

		const aPosition = this.gl.getAttribLocation(this.program, 'aPosition')
		this.gl.enableVertexAttribArray(aPosition)
		this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0)

		// UV buffer
		const uvBuffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, uvs, this.gl.STATIC_DRAW)

		const aUV = this.gl.getAttribLocation(this.program, 'aUV')
		this.gl.enableVertexAttribArray(aUV)
		this.gl.vertexAttribPointer(aUV, 2, this.gl.FLOAT, false, 0, 0)

		this.gl.bindVertexArray(null)
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
	}

	private render(time: number): void {
		this.gl.viewport(0, 0, this.element.width, this.element.height)
		this.gl.useProgram(this.program)
		this.gl.bindVertexArray(this.vao)

		// Update standard uniforms
		if (this.uTime) this.gl.uniform1f(this.uTime, time)
		if (this.uResolution) {
			this.gl.uniform2f(this.uResolution, this.element.width, this.element.height)
		}

		// Let subclass update its uniforms
		this.updateUniforms(time)

		// Clear and draw
		this.gl.clearColor(0, 0, 0, 0)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)

		this.gl.bindVertexArray(null)
	}
}
