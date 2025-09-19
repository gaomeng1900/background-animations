import { defineConfig } from 'vite'

import { glslLoaderPlugin, replacePlugin } from './vite.plugins'

export default defineConfig({
	build: {
		outDir: 'build',
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'index.js',
		},
		sourcemap: false,
		minify: false,
		emptyOutDir: true,
	},
	publicDir: false,
	plugins: [
		glslLoaderPlugin(),
		replacePlugin({
			__BACKGROUND_ANIMATIONS_VERSION__: JSON.stringify(process.env.npm_package_version),
		}),
	],
})
