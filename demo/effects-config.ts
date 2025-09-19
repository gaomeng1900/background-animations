/**
 * Configuration for all available effects in the demo
 */
import { GradientEffect, UVMapEffect } from '../src/index'

export interface EffectConfig {
	name: string
	description: string
	class: any
	defaultOptions?: any
	parameters?: ParameterConfig[]
}

export interface ParameterConfig {
	name: string
	type: 'color' | 'number' | 'boolean' | 'select'
	default: any
	min?: number
	max?: number
	step?: number
	options?: string[]
	description?: string
	group?: string
}

export const effectsConfig: EffectConfig[] = [
	{
		name: 'UV Map',
		description: 'Displays UV coordinates as red-green colors. Great for debugging geometry.',
		class: UVMapEffect,
		parameters: [],
	},
	{
		name: 'Gradient',
		description: 'Animated vertical gradient that transitions between two color pairs.',
		class: GradientEffect,
		defaultOptions: {
			pairs: [
				['rgb(255, 0, 0)', 'rgb(0, 255, 0)'], // First pair: Red to Green
				['rgb(0, 0, 255)', 'rgb(255, 255, 0)'], // Second pair: Blue to Yellow
			] as [[string, string], [string, string]],
		},
		parameters: [
			{
				name: 'pair1Color1',
				type: 'color',
				default: '#ff0000',
				description: 'Top color',
				group: 'Pair 1',
			},
			{
				name: 'pair1Color2',
				type: 'color',
				default: '#00ff00',
				description: 'Bottom color',
				group: 'Pair 1',
			},
			{
				name: 'pair2Color1',
				type: 'color',
				default: '#0000ff',
				description: 'Top color',
				group: 'Pair 2',
			},
			{
				name: 'pair2Color2',
				type: 'color',
				default: '#ffff00',
				description: 'Bottom color',
				group: 'Pair 2',
			},
		],
	},
]

export function getEffectUsageCode(config: EffectConfig, options?: any): string {
	const className = config.class.name

	if (config.name === 'UV Map') {
		return `import { ${className} } from 'background-animations'

const effect = new ${className}()
document.body.appendChild(effect.element)
effect.resize(400, 300)
effect.start()`
	}

	if (config.name === 'Gradient') {
		const pairs = options?.pairs || config.defaultOptions?.pairs || []
		const pairStrings = pairs
			.map((pair: [string, string]) => `['${pair[0]}', '${pair[1]}']`)
			.join(',\n    ')

		return `import { ${className} } from 'background-animations'

const effect = new ${className}({
  pairs: [
    ${pairStrings}
  ]
})
document.body.appendChild(effect.element)
effect.resize(400, 300)
effect.start()`
	}

	return `// Usage code for ${config.name}`
}
