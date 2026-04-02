import AnimationManager, {
	EaseInOutEasing,
} from "./Managers/AnnimationManager.js";
import CameraManager from "./Managers/CameraManager.js";
import PixelManager, {
	Drawable,
	PixelManagerInterface,
	Position,
	rgba,
} from "./Managers/PixelManager.js";
import Perlin, { PerlinProxy } from "./Noise/PerlinNoise.js";
import { ParticleInterface } from "./particle.js";

export class Sun extends Drawable implements ParticleInterface {
	private noise: Perlin;
	private time = 0;

	lastSunUpdate: number = 0;

	constructor(size: number) {
		let ctx: CanvasRenderingContext2D;
		const canvas = document.getElementById("sun") as HTMLCanvasElement;
		if (canvas) {
			ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		} else {
			throw new Error("Element with id 'sun' not found.");
		}
		super(ctx, canvas, size, { x: 0, y: 0, z: 0 });
		this.ctx.fillStyle = "white";
		addEventListener("resize", () => {
			this.resize();
		});

		this.noise = new Perlin();

		this.resize();
	}
	summon(): void {
		throw new Error("Method not implemented.");
	}
	update(): void {
		throw new Error("Method not implemented.");
	}
	destroy(): void {
		throw new Error("Method not implemented.");
	}

	updateSize(size: number) {
		// size = Math.max(10, size); // Minimum size to prevent disappearing
		size = Math.min(size, 2048); // Maximum size to prevent excessive growth

		super.updateSize(size);
	}

	drawPixel(position: Position, color?: rgba, opacity?: number): void {
		// Random yellowish color for the sun
		if (!color) {
			const temperature = this.getTemperature(position);

			// Rouge : élevé partout, léger shimmer
			const r = Math.min(
				255,
				Math.floor(
					205 + 50 * Math.min(temperature + 0.2, 1) + 7 * Math.random(),
				),
			);

			// Vert : transition orange→jaune→blanc, shimmer modéré
			const g = Math.min(
				255,
				Math.floor(45 + 185 * temperature * temperature + 10 * Math.random()),
			);

			// Bleu : éclats visibles mais pas explosifs
			let b;
			if (temperature > 0.8)
				b = Math.min(
					255,
					Math.floor(
						55 + (150 * (temperature - 0.8)) / 0.2 + 10 * Math.random(),
					),
				);
			else if (temperature > 0.3)
				b = Math.floor(
					10 + (48 * (temperature - 0.3)) / 0.5 + 10 * Math.random(),
				);
			else
				b = Math.floor(
					5 + 18 * temperature + 10 * Math.random() * (1 - temperature),
				);

			color = {
				r: r,
				g: g,
				b: b,
				a: opacity,
			} as rgba;

			// b = Math.floor(160 * (1 - Math.max(temperature + Math.random() + 0.2, 1))); // Bleu entre 0 et 10
		}
		position.x = Math.floor(position.x);
		position.y = Math.floor(position.y);
		super.drawPixel(position, color);
	}

	getTemperature(position: { x: number; y: number }): number {
		const detail = 4; // nombre de "cellules" de bruit visibles sur le soleil

		const sunCenter = this.getPosition();

		const positionRelativeToCenter = {
			x: position.x - sunCenter.x,
			y: position.y - sunCenter.y,
		};

		const noiseValue = this.noise.get(
			(positionRelativeToCenter.x / this.size) * detail,
			(positionRelativeToCenter.y / this.size) * detail,
			this.time,
		);

		let shiftedNoise = noiseValue - 0.2;
		let amplifiedNoise = Math.min(Math.max(shiftedNoise * 3, -1), 1);

		return amplifiedNoise * 0.5 + 0.5;
	}
	addTime(shiftAmount: number = 0.05) {
		// Chancge to non linear time progression for more dynamic changes
		this.time += shiftAmount * Math.max(5.5, Math.sin(this.time * 0.5) + 5); // Time progression that speeds up and slows down based on a sine wave
	}

	draw(dt: number) {
		this.lastSunUpdate += dt;

		const ray = new SunRayDecorateur(this);

		ray.filledCircle(this.position, this.size / 2);
		this.addTime(this.lastSunUpdate * 0.4); // Adjust time progression speed based on delta time
		this.lastSunUpdate = 0;
	}

	async moveSunToCam(
		position: Position,
		camZ: number,
		duration: number,
	): Promise<void> {
		const camera = CameraManager.getInstance();
		const annim = new AnimationManager();

		const originalPosition = { ...camera.getCameraPosition() };
		const originalCamZ = camera.getZoom();
		const camPosition = camera.mooveCameraSoElemIsOn(this, position, 30);
		const targetCamPosition = {
			x: camPosition.x,
			y: camPosition.y,
			z: camPosition.z,
		};

		await annim
			.animate(duration, new EaseInOutEasing(), (t) => {
				camera.setCameraPosition({
					x: lerp(originalPosition.x, targetCamPosition.x, t),
					y: lerp(originalPosition.y, targetCamPosition.y, t),
					z: lerp(originalPosition.z, targetCamPosition.z, t),
				});

				camera.setCameraZoom(lerp(originalCamZ, camZ, t));
			})
			.then(() => {
				// Ensure final position and zoom are set after animation
				camera.setCameraPosition(targetCamPosition);
				camera.setCameraZoom(camZ);
			});
	}

	// updatePosition(position: Position): void {
	// 	super.updatePosition(position);
	// }
}

class SunRayDecorateur extends PixelManager {

	constructor(private sun: Sun) {
		super(sun.getCtx(), sun.getCanvas());
	}

	drawPixel(position: Position, color?: rgba): void {
		const temp = this.sun.getTemperature(position);

		// On high temp add pixel arround the current pixel to create rays effect
		let additionalPixels = 0;
		if (temp > 0.3)
			additionalPixels = Math.floor((temp + 0.2) * Math.random() * 10); // More pixels for higher temperatures

		for (let i = 0; i < additionalPixels; i++) {
			const angle = Math.random() * 2 * Math.PI;
			const distance = (Math.random() * temp * this.sun.getSize()) / 8; // More distance for higher temperatures
			const rayX = position.x + Math.cos(angle) * distance;
			const rayY = position.y + Math.sin(angle) * distance;

			this.sun.drawPixel(
				{
					x: Math.floor(rayX),
					y: Math.floor(rayY),
					z: this.sun.getPosition().z,
				},
				color,
				Math.min(temp + 0.2, 0.8),
			); // Ray pixels with lower opacity
		}

		this.sun.drawPixel(position, color);
	}

	filledCircle(center: Position, radius: number): void {
		this.drawCircle(center, radius);
		this.sun.filledCircle(center, radius);
	}
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
