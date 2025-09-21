/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/background-animations
 */
import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Plugin } from 'vite'

/**
 * Vite plugin to load GLSL files as string modules.
 * Supports .glsl file extensions and #include directives.
 */
export function glslLoaderPlugin(): Plugin {
	const extensions = ['.glsl']

	/**
	 * Recursively process #include directives in GLSL source
	 */
	function processIncludes(
		source: string,
		currentPath: string,
		processedFiles = new Set<string>()
	): string {
		// Avoid circular includes
		if (processedFiles.has(currentPath)) {
			throw new Error(`Circular include detected: ${currentPath}`)
		}
		processedFiles.add(currentPath)

		// Match #include directives with both angle brackets and quotes
		const includeRegex = /#include\s+[<"']([^<>"']+)[>"']/g

		return source.replace(includeRegex, (_, includePath) => {
			// Resolve the include path relative to current file
			const resolvedPath = resolve(dirname(currentPath), includePath)

			// Check if file exists
			if (!existsSync(resolvedPath)) {
				throw new Error(`Include file not found: ${includePath} (resolved to: ${resolvedPath})`)
			}

			// Read and process the included file
			const includeSource = readFileSync(resolvedPath, 'utf-8')

			// Recursively process includes in the included file
			return processIncludes(includeSource, resolvedPath, new Set(processedFiles))
		})
	}

	return {
		name: 'glsl-loader',

		load(id: string) {
			// Check if the file has a GLSL extension
			if (extensions.some((ext) => id.endsWith(ext))) {
				// Return null to let Vite handle the file reading
				return null
			}
		},

		transform(src: string, id: string) {
			// Transform GLSL files to ES modules
			if (extensions.some((ext) => id.endsWith(ext))) {
				try {
					// Process #include directives first
					const processedSource = processIncludes(src, id)

					// Minify the GLSL source by removing comments and unnecessary whitespace
					const minified = processedSource
						.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
						.replace(/\/\/.*$/gm, '') // Remove line comments
						.replace(/^\s+/gm, '') // Remove leading whitespace
						.replace(/\s+$/gm, '') // Remove trailing whitespace
						.replace(/\n\s*\n/g, '\n') // Remove empty lines
						.trim()

					return {
						code: `export default \`${minified}\`;`,
						map: null, // No source map
					}
				} catch (error) {
					// Provide helpful error messages for include issues
					const message = error instanceof Error ? error.message : String(error)
					this.error(`GLSL include error in ${id}: ${message}`)
				}
			}
		},
	}
}

/**
 * Vite plugin to replace constant values in code
 */
export function replacePlugin(replacements: Record<string, string>): Plugin {
	return {
		name: 'replace-constants',

		transform(src: string, id: string) {
			// Skip node_modules and non-JS/TS files
			if (id.includes('node_modules') || !/\.(js|ts|jsx|tsx)$/.test(id)) {
				return null
			}

			let code = src
			let hasReplacements = false

			// Apply all replacements
			for (const [key, value] of Object.entries(replacements)) {
				const regex = new RegExp(escapeRegExp(key), 'g')
				if (regex.test(code)) {
					code = code.replace(regex, value)
					hasReplacements = true
				}
			}

			// Only return transformed code if we made changes
			return hasReplacements ? { code, map: null } : null
		},
	}
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
