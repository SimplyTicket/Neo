import PixelManager, { sleep } from "../Managers/PixelManager.js";

export default class Perlin {
	private gradients: { [key: string]: { x: number; y: number } };
	// private memory: { [key: string]: number };

	constructor() {
		this.gradients = {};
		// this.memory = {};
	}

	rand_vect() {
		const theta = Math.random() * 2 * Math.PI;
		const phi = Math.acos(2 * Math.random() - 1);

		return {
			x: Math.sin(phi) * Math.cos(theta),
			y: Math.sin(phi) * Math.sin(theta),
			z: Math.cos(phi),
		};
	}

	dot_prod_grid(
		x: number,
		y: number,
		z: number,
		vx: number,
		vy: number,
		vz: number,
	) {
		let g_vect;
		let d_vect = { x: x - vx, y: y - vy, z: z - vz };

		const key = `${vx},${vy},${vz}`;

		if (this.gradients[key]) {
			g_vect = this.gradients[key];
		} else {
			g_vect = this.rand_vect();
			this.gradients[key] = g_vect;
		}

		return d_vect.x * g_vect.x + d_vect.y * g_vect.y + d_vect.z * g_vect.z;
	}

	smootherstep(x: number) {
		return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
	}
	interp(x: number, a: number, b: number) {
		return a + this.smootherstep(x) * (b - a);
	}
	get(x: number, y: number, z: number): number {
		const key = `${x},${y},${z}`;
		// if (this.memory[key]) return this.memory[key];

		let xf = Math.floor(x);
		let yf = Math.floor(y);
		let zf = Math.floor(z);

		// 8 corners
		let c000 = this.dot_prod_grid(x, y, z, xf, yf, zf);
		let c100 = this.dot_prod_grid(x, y, z, xf + 1, yf, zf);
		let c010 = this.dot_prod_grid(x, y, z, xf, yf + 1, zf);
		let c110 = this.dot_prod_grid(x, y, z, xf + 1, yf + 1, zf);

		let c001 = this.dot_prod_grid(x, y, z, xf, yf, zf + 1);
		let c101 = this.dot_prod_grid(x, y, z, xf + 1, yf, zf + 1);
		let c011 = this.dot_prod_grid(x, y, z, xf, yf + 1, zf + 1);
		let c111 = this.dot_prod_grid(x, y, z, xf + 1, yf + 1, zf + 1);

		let xt00 = this.interp(x - xf, c000, c100);
		let xt10 = this.interp(x - xf, c010, c110);
		let xt01 = this.interp(x - xf, c001, c101);
		let xt11 = this.interp(x - xf, c011, c111);

		let yt0 = this.interp(y - yf, xt00, xt10);
		let yt1 = this.interp(y - yf, xt01, xt11);

		let v = this.interp(z - zf, yt0, yt1);

		// this.memory[key] = v;
		return v;
	}
};

// export default class PerlinNoise {
// 	private grild: { x: number; y: number }[][] = [];
// 	private nodes = 0;

// 	private random_unit_vector() {
// 		let theta = Math.random() * 2 * Math.PI;
// 		return { x: Math.cos(theta), y: Math.sin(theta) };
// 	}

// 	constructor(nodes: number) {
// 		this.nodes = nodes;
// 		this.generateGrid();
// 	}

// 	generateGrid() {
// 		for (let i = 0; i < this.nodes; i++) {
// 			let row: { x: number; y: number }[] = [];
// 			for (let j = 0; j < this.nodes; j++) {
// 				row.push(this.random_unit_vector());
// 			}
// 			this.grild.push(row);
// 		}
// 	}

// 	noise(x: number, y: number): number {

// 		let x0 = Math.floor(x);
// 		let x1 = x0 + 1;
// 		let y0 = Math.floor(y);
// 		let y1 = y0 + 1;

// 		let sx = x - x0;
// 		let sy = y - y0;

// 		let n0 = this.dot_prod_grid(x, y, x0, y0);
// 		let n1 = this.dot_prod_grid(x, y, x1, y0);
// 		let ix0 = this.lin_interp(sx, n0, n1);

// 		n0 = this.dot_prod_grid(x, y, x0, y1);
// 		n1 = this.dot_prod_grid(x, y, x1, y1);
// 		let ix1 = this.lin_interp(sx, n0, n1);

// 		return this.lin_interp(sy, ix0, ix1);
// 	}

// 	dot_prod_grid(x: number, y: number, vert_x: number, vert_y: number): number {
// 		var g_vect = this.grild[vert_y][vert_x];
// 		var d_vect = { x: x - vert_x, y: y - vert_y };
// 		return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
// 	}

// 	lin_interp(x: number, a: number, b: number): number {
// 		return a + x * (b - a);
// 	}
// }

export class PerlinNoise2D extends PixelManager {
	private noise: Perlin;
	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.noise = new Perlin();
	}

	drawNoise(resolution: number = 32, scale: number = 1): void {

		let num_pixels = 1 / scale;
		for (let y = 0; y < resolution; y += 1 ) {
			for (let x = 0; x < resolution; x += 1 ) {
				let v = this.noise.get(
					(x / resolution) * scale,
					(y / resolution) * scale,
					0,
				);
				// this.ctx.fillStyle = "hsl(" + v * 255 + ",50%,50%)";
				const colorValue = 128 + Math.floor(v * 128 ** 1.2);
				this.ctx.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";

				// let value = this.noise.get(x, y);
				// let color = Math.floor(((value + 1) / 2) * 255);
				this.drawPixel({
					x: x,
					y: y,
				});
			}
		}
	}
}