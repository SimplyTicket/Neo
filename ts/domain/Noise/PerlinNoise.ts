import PixelManager, { Position, sleep } from "../Managers/PixelManager.js";

export default class Perlin {
	private gradients: { [key: string]: Position };
	// private memory: { [key: string]: number };

	constructor() {
		this.gradients = {};
		// this.memory = {};
	}

	private rand_vect() {
		const theta = Math.random() * 2 * Math.PI;
		const phi = Math.acos(2 * Math.random() - 1);

		return {
			x: Math.sin(phi) * Math.cos(theta),
			y: Math.sin(phi) * Math.sin(theta),
			z: Math.cos(phi),
		};
	}

	private dot_prod_grid(
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

	private smootherstep(x: number) {
		return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
	}
	private interp(x: number, a: number, b: number) {
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

// class LowResPerlin implements Perlin {

// 	private resolution: number;

// 	constructor(resolution: number) {
// 		super();
// 		this.resolution = resolution;
// 	}
// 	get(x: number, y: number, z: number): number {
// 		throw new Error("Method not implemented.");
// 	}

// 	buildGrid() {

// 	}

// 	bilinearInterpolate(x: number, y: number): number {

// 	}

// }

// export class PerlinNoise2D extends PixelManager {
// 	private noise: Perlin;
// 	constructor(ctx: CanvasRenderingContext2D) {
// 		super(ctx);
// 		this.noise = new Perlin();
// 	}

// 	drawNoise(resolution: number = 32, scale: number = 1): void {

// 		let num_pixels = 1 / scale;
// 		for (let y = 0; y < resolution; y += 1 ) {
// 			for (let x = 0; x < resolution; x += 1 ) {
// 				let v = this.noise.get(
// 					(x / resolution) * scale,
// 					(y / resolution) * scale,
// 					0,
// 				);
// 				// this.ctx.fillStyle = "hsl(" + v * 255 + ",50%,50%)";
// 				const colorValue = 128 + Math.floor(v * 128 ** 1.2);
// 				this.ctx.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";

// 				// let value = this.noise.get(x, y);
// 				// let color = Math.floor(((value + 1) / 2) * 255);
// 				this.drawPixel({
// 					x: x,
// 					y: y,
// 				});
// 			}
// 		}
// 	}
// }