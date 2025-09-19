/**
 * Simple plane geometry that covers the entire canvas
 * Much simpler than the complex border geometry
 */

export function createPlaneGeometry(): { positions: Float32Array; uvs: Float32Array } {
	// Two triangles covering the entire clip space (-1 to 1)
	const positions = new Float32Array([
		// First triangle
		-1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

		// Second triangle
		-1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
	])

	// UV coordinates (0 to 1)
	const uvs = new Float32Array([
		// First triangle
		0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

		// Second triangle
		0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
	])

	return { positions, uvs }
}
