# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with live reload (serves demo/)
- `npm start` - Alias for `npm run dev`

### Building
- `npm run build` - Build library (ESM + TypeScript declarations)
- `npm run build:lib` - Build library only (ESM to build/)
- `npm run build:types` - Generate TypeScript declarations only
- `npm run build:demo` - Build static demo files (to build-demo/)

### Code Quality
- Linting and formatting are handled by husky pre-commit hooks
- Use `npx prettier --write` for manual formatting
- Use `npx eslint` for manual linting

## Architecture

This is a minimal WebGL2-only library for background animations with zero runtime dependencies.

### Core Design Principles
- **WebGL2-only**: No WebGL1 fallback, assumes modern browser support
- **ESM-only**: No CommonJS/UMD builds, targets ES2019+
- **Zero runtime dependencies**: Pure browser APIs only
- **Non-mounting API**: Provides DOM elements but doesn't auto-append to document

### Project Structure

```
src/
├── index.ts              # Main exports (UVMapEffect, GradientEffect)
├── core/
│   ├── BackgroundEffect.ts  # Abstract base class with lifecycle API
│   ├── geometry.ts          # Fullscreen quad geometry generation
│   └── program.ts           # WebGL program compilation/linking
├── effects/
│   ├── UVMapEffect.ts       # UV coordinate visualization effect
│   └── GradientEffect.ts    # Animated gradient effect
└── shaders/
    ├── uvmap/              # GLSL shaders for UV effect
    └── gradient/           # GLSL shaders for gradient effect
```

### Key Classes

**BackgroundEffect** (abstract base class):
- Imperative lifecycle API: `start()`, `pause()`, `dispose()`, `resize()`
- WebGL context creation deferred until `start()`, not constructor
- Frame rate limited to 60fps with requestAnimationFrame
- Automatic resource cleanup and memory management
- Standard uniforms: `uTime`, `uResolution`

**Effect Implementation Pattern**:
1. Extend `BackgroundEffect` with vertex/fragment shader strings
2. Override `updateUniforms(time)` for custom uniforms
3. Constructor handles options validation and defaults

### WebGL Implementation

- Uses fullscreen quad geometry (6 triangles covering canvas)
- Shaders must start with `#version 300 es`
- Fragment shader handles animation logic using time-based uniforms
- UV coordinates span full canvas area (0..1)
- Proper WebGL resource cleanup in dispose method

### Build System

- **Library build**: Single ESM entry point to `build/` directory
- **Demo build**: Separate Vite config for development and static demo
- **Dual output strategy**: Library and demo builds are independent
- TypeScript strict mode with explicit WebGL resource typing