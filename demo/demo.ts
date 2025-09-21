/**
 * Interactive demo for background animations
 */
import { type EffectConfig, effectsConfig, getEffectUsageCode } from './effects-config'

interface DemoState {
	currentEffect: EffectConfig | null
	currentInstance: any
	parameters: Record<string, any>
}

class Demo {
	private state: DemoState = {
		currentEffect: null,
		currentInstance: null,
		parameters: {},
	}

	private elements = {
		effectGrid: document.getElementById('effectGrid') as HTMLElement,
		previewContainer: document.getElementById('previewContainer') as HTMLElement,
		controlsContainer: document.getElementById('controlsContainer') as HTMLElement,
		codeContainer: document.getElementById('codeContainer') as HTMLElement,
		themeToggle: document.getElementById('themeToggle') as HTMLElement,
	}

	constructor() {
		this.init()
	}

	private init(): void {
		this.setupTheme()
		this.renderEffectGrid()
		this.setupEventListeners()

		// Load first effect by default
		if (effectsConfig.length > 0) {
			this.selectEffect(effectsConfig[0])
		}
	}

	private setupTheme(): void {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
		const savedTheme = localStorage.getItem('demo-theme')
		const theme = savedTheme || (prefersDark.matches ? 'dark' : 'light')

		this.setTheme(theme)

		this.elements.themeToggle?.addEventListener('click', () => {
			const current = document.documentElement.getAttribute('data-theme')
			const newTheme = current === 'dark' ? 'light' : 'dark'
			this.setTheme(newTheme)
		})
	}

	private setTheme(theme: string): void {
		document.documentElement.setAttribute('data-theme', theme)
		localStorage.setItem('demo-theme', theme)

		const toggleIcon = this.elements.themeToggle?.querySelector('.toggle-icon')
		if (toggleIcon) {
			toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙'
		}
	}

	private renderEffectGrid(): void {
		if (!this.elements.effectGrid) return

		this.elements.effectGrid.innerHTML = effectsConfig
			.map(
				(config, index) => `
			<div class="effect-card" data-effect-index="${index}">
				<div class="effect-info">
					<h3 class="effect-name">${config.name}</h3>
					<p class="effect-description">${config.description}</p>
				</div>
			</div>
		`
			)
			.join('')
	}

	private createMiniPreview(config: EffectConfig, container: HTMLElement): void {
		try {
			const options = config.defaultOptions || {}
			const effect = new config.class(options)

			container.appendChild(effect.element)
			effect.resize(200, 120)
			effect.start()

			// Store reference for cleanup
			container.setAttribute('data-effect-instance', 'true')
		} catch (error) {
			console.error(`Failed to create preview for ${config.name}:`, error)
			container.innerHTML = '<div class="preview-error">Preview unavailable</div>'
		}
	}

	private setupEventListeners(): void {
		// Effect selection
		this.elements.effectGrid?.addEventListener('click', (e) => {
			const card = (e.target as Element).closest('.effect-card') as HTMLElement
			if (card) {
				const index = parseInt(card.dataset.effectIndex || '0')
				this.selectEffect(effectsConfig[index])
			}
		})
	}

	private selectEffect(config: EffectConfig): void {
		// Cleanup previous effect
		if (this.state.currentInstance) {
			this.state.currentInstance.dispose()
		}

		this.state.currentEffect = config
		this.state.parameters = this.getDefaultParameters(config)

		// Update UI
		this.updateActiveCard(config)
		this.renderMainPreview(config)
		this.renderControls(config)
		this.renderCode(config)
	}

	private getDefaultParameters(config: EffectConfig): Record<string, any> {
		const params: Record<string, any> = {}

		config.parameters?.forEach((param) => {
			params[param.name] = param.default
		})

		return params
	}

	private updateActiveCard(config: EffectConfig): void {
		// Remove active class from all cards
		this.elements.effectGrid?.querySelectorAll('.effect-card').forEach((card) => {
			card.classList.remove('active')
		})

		// Add active class to selected card
		const index = effectsConfig.indexOf(config)
		const activeCard = this.elements.effectGrid?.querySelector(`[data-effect-index="${index}"]`)
		activeCard?.classList.add('active')
	}

	private renderMainPreview(config: EffectConfig): void {
		if (!this.elements.previewContainer) return

		// Clear previous preview
		this.elements.previewContainer.innerHTML = ''

		try {
			const options = this.buildEffectOptions(config)
			const effect = new config.class(options)

			this.elements.previewContainer.appendChild(effect.element)

			// Auto-resize to container
			const resizeEffect = () => {
				const rect = this.elements.previewContainer.getBoundingClientRect()
				effect.resize(rect.width, rect.height)
			}

			resizeEffect()
			effect.start()

			// Handle window resize
			const resizeObserver = new ResizeObserver(resizeEffect)
			resizeObserver.observe(this.elements.previewContainer)

			// Store references for cleanup
			this.state.currentInstance = effect
			;(effect as any)._resizeObserver = resizeObserver
		} catch (error) {
			console.error(`Failed to create main preview for ${config.name}:`, error)
			this.elements.previewContainer.innerHTML =
				'<div class="preview-error">Failed to load effect</div>'
		}
	}

	private buildEffectOptions(config: EffectConfig): any {
		if (config.name === 'UV Map') {
			return undefined // No options needed
		}

		if (config.name === 'Gradient') {
			return {
				pairs: [
					[
						this.hexToRgb(this.state.parameters.pair1Color1 || '#ff0000'),
						this.hexToRgb(this.state.parameters.pair1Color2 || '#00ff00'),
					],
					[
						this.hexToRgb(this.state.parameters.pair2Color1 || '#0000ff'),
						this.hexToRgb(this.state.parameters.pair2Color2 || '#ffff00'),
					],
				] as [[string, string], [string, string]],
			}
		}

		if (config.name === 'Color Lerp') {
			return {
				pairs: [
					[
						this.hexToRgb(this.state.parameters.pair1Color1 || '#ff0000'),
						this.hexToRgb(this.state.parameters.pair1Color2 || '#ff6464'),
					],
					[
						this.hexToRgb(this.state.parameters.pair2Color1 || '#00ff00'),
						this.hexToRgb(this.state.parameters.pair2Color2 || '#64ff64'),
					],
					[
						this.hexToRgb(this.state.parameters.pair3Color1 || '#0000ff'),
						this.hexToRgb(this.state.parameters.pair3Color2 || '#6464ff'),
					],
				] as [[string, string], [string, string], [string, string]],
				percent: parseFloat(this.state.parameters.percent || '0.0'),
				pointer: [0.5, 0.5] as [number, number],
			}
		}

		return config.defaultOptions
	}

	private hexToRgb(hex: string): string {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		if (!result) return 'rgb(0, 0, 0)'

		const r = parseInt(result[1], 16)
		const g = parseInt(result[2], 16)
		const b = parseInt(result[3], 16)

		return `rgb(${r}, ${g}, ${b})`
	}

	private renderControls(config: EffectConfig): void {
		if (!this.elements.controlsContainer) return

		if (!config.parameters || config.parameters.length === 0) {
			this.elements.controlsContainer.innerHTML =
				'<p class="no-controls">No parameters to configure</p>'
			return
		}

		// Group parameters by group property
		const groups = new Map<string, any[]>()
		config.parameters.forEach((param) => {
			const groupName = param.group || 'General'
			if (!groups.has(groupName)) {
				groups.set(groupName, [])
			}
			groups.get(groupName)!.push(param)
		})

		this.elements.controlsContainer.innerHTML = Array.from(groups.entries())
			.map(
				([groupName, params]) => `
				<div class="control-group-section">
					<h4 class="control-group-title">${groupName}</h4>
					<div class="control-group-grid">
						${params
							.map(
								(param) => `
							<div class="control-item">
								<label class="control-label-compact">
									${param.description || param.name}
								</label>
								${this.renderControlInput(param)}
							</div>
						`
							)
							.join('')}
					</div>
				</div>
			`
			)
			.join('')

		// Add event listeners for controls
		this.elements.controlsContainer.querySelectorAll('input').forEach((input) => {
			input.addEventListener('input', (e) => {
				const target = e.target as HTMLInputElement
				const paramName = target.dataset.param
				if (paramName) {
					this.state.parameters[paramName] = target.value
					this.updateEffect()
				}
			})
		})
	}

	private renderControlInput(param: any): string {
		switch (param.type) {
			case 'color':
				return `<input type="color" value="${param.default}" data-param="${param.name}" class="control-input control-color">`
			case 'number':
				return `<input type="range" min="${param.min || 0}" max="${param.max || 100}" step="${param.step || 1}" value="${param.default}" data-param="${param.name}" class="control-input control-range">`
			case 'boolean':
				return `<input type="checkbox" ${param.default ? 'checked' : ''} data-param="${param.name}" class="control-input control-checkbox">`
			default:
				return `<input type="text" value="${param.default}" data-param="${param.name}" class="control-input control-text">`
		}
	}

	private updateEffect(): void {
		if (!this.state.currentEffect || !this.state.currentInstance) return

		// Use standardized updateOptions method if available
		if (this.state.currentInstance.updateOptions) {
			const options = this.buildEffectOptions(this.state.currentEffect)
			this.state.currentInstance.updateOptions(options)
			this.renderCode(this.state.currentEffect)
			return
		}

		// Fallback: recreate effect with new parameters
		this.renderMainPreview(this.state.currentEffect)
		this.renderCode(this.state.currentEffect)
	}

	private renderCode(config: EffectConfig): void {
		if (!this.elements.codeContainer) return

		const options = this.buildEffectOptions(config)
		const code = getEffectUsageCode(config, options)

		this.elements.codeContainer.innerHTML = `
			<div class="code-header">
				<span class="code-title">Usage Example</span>
				<button class="copy-button" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`')}\`)">
					📋 Copy
				</button>
			</div>
			<pre><code>${this.escapeHtml(code)}</code></pre>
		`
	}

	private escapeHtml(text: string): string {
		const div = document.createElement('div')
		div.textContent = text
		return div.innerHTML
	}
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new Demo()
})
