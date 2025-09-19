# AI Motion

[![npm version](https://badge.fury.io/js/background-animations.svg)](https://www.npmjs.com/package/background-animations)
[![CI](https://github.com/gaomeng1900/background-animations/workflows/CI/badge.svg)](https://github.com/gaomeng1900/background-animations/actions)
[![npm downloads](https://img.shields.io/npm/dm/background-animations.svg)](https://www.npmjs.com/package/background-animations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English | [中文](README.zh-CN.md)**

WebGL2 animated backgrounds effects. Zero dependencies, modern browsers only.

🌈 **[Live Demo](https://gaomeng1900.github.io/background-animations/)**

![Demo](public/demo.gif)

## Install

```bash
npm install background-animations
```

## Quick Start

```ts
import { UVMapEffect, GradientEffect } from 'background-animations'

// UV Map Effect (displays UV coordinates as red-green colors)
const uvEffect = new UVMapEffect()
document.body.appendChild(uvEffect.element)
uvEffect.resize(400, 300)
uvEffect.start()

// Gradient Effect (animated vertical gradient with color pairs)
const gradientEffect = new GradientEffect({
    pairs: [
        ['rgb(255, 0, 0)', 'rgb(0, 255, 0)'],    // First pair: Red to Green
        ['rgb(0, 0, 255)', 'rgb(255, 255, 0)']   // Second pair: Blue to Yellow
    ]
})
document.body.appendChild(gradientEffect.element)
gradientEffect.resize(400, 300)
gradientEffect.start()
```

## API Reference

TODO

## Requirements

- WebGL2 support
- Modern browsers

## Development

```bash
npm install
npm start      # dev server
npm run build  # library build
```

## License

[MIT](./LICENSE)

## Attribution & Community

While the MIT license allows free use without attribution requirements, we encourage and appreciate developers who acknowledge the original work. This helps foster a healthy open source ecosystem and supports continued development.

**If AI Motion helps your project, please consider:**

- Mentioning this project in your documentation or README
- Keeping attribution comments in your code
- Adding a link back to this repository when appropriate
- Starring the repository to show support

**Contributing Back to the Community:**
We welcome contributions from the community! Here are ways you can help:

- Report bugs and suggest features through [GitHub Issues](https://github.com/gaomeng1900/background-animations/issues)
- Submit pull requests for improvements
- Share your use cases and examples
- Help improve documentation
- Spread the word about the project

Your contributions, whether code, documentation, or feedback, help make AI Motion better for everyone.
