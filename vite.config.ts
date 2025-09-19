import { defineConfig } from 'vite'

import { glslLoaderPlugin, replacePlugin } from './vite.plugins'

export default defineConfig({
	base: './',
	build: {
		outDir: 'build-demo',
		sourcemap: true,
		emptyOutDir: true,
	},
	server: {
		open: true,
	},
	publicDir: false,
	plugins: [
		glslLoaderPlugin(),
		replacePlugin({
			__BACKGROUND_ANIMATIONS_VERSION__: JSON.stringify(process.env.npm_package_version),
		}),
	],
})
