import AnimationManager, {
	EaseInOutEasing,
} from "./Managers/AnnimationManager.js";
import CameraManager from "./Managers/CameraManager.js";
import PixelManager, {
	Drawable,
	PixelManagerInterface,
	Position,
} from "./Managers/PixelManager.js";
import Perlin from "./Noise/PerlinNoise.js";

export class Sun extends Drawable {
	private noise = new Perlin();
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
		super(ctx, canvas, size, { x: 0, y: 0 });
		this.ctx.fillStyle = "white";
		addEventListener("resize", () => {
			this.resize();
		});

		this.resize();
	}

	drawPixel(
		position: { x: number; y: number },
		color?: string,
		opacity?: number,
	): void {
		// Random yellowish color for the sun
		if (!color) {
			const temperature = this.getTemperature(position);

			// Calculer les composantes RGB en fonction de la température
			const r =
				100 + Math.floor(155 * Math.max(temperature + Math.random(), 1)); // Rouge entre 200 et 255
			const g = 30 + Math.floor(10 * Math.random() + 130 * temperature); // Vert entre 50 et 155

			let b;
			if (temperature < 0.1)
				// the lower temp the more blue spike you have
				b = 40 + Math.floor(30 * Math.random() * (1 - temperature)); // Bleu entre 0 et 55
			else if (temperature < 0.6)
				b = Math.floor(25 * (1 - Math.max(temperature + Math.random(), 1))); // Bleu entre 0 et 25
			else b = 10 + Math.floor(140 * Math.random() * Math.min(temperature, 1)); // Bleu entre 0 et 55

			// b = Math.floor(160 * (1 - Math.max(temperature + Math.random() + 0.2, 1))); // Bleu entre 0 et 10

			color = `rgba(${r}, ${g}, ${b}, ${opacity ?? 1})`;
		}
		position.x = Math.floor(position.x);
		position.y = Math.floor(position.y);
		super.drawPixel(position, color);
	}

	getTemperature(position: { x: number; y: number }): number {
		// Simple temperature gradient based on perlin noise
		const scale = 0.1; // Adjust for more or less variation

		const noiseValue = this.noise.get(
			position.x * scale,
			position.y * scale,
			this.time,
		);

		// Shift temp to have more lower temp values for more blue spikes and less yellow ones
		let shiftedNoise = noiseValue - 0.2;

		// Amplify the noise to create more contrast in temperature
		let amplifiedNoise = Math.min(Math.max(shiftedNoise * 3, -1), 1); // Adjust the factor as needed

		// Map noise value (-1 to 1) to temperature range (e.g., 3000K to 6000K)
		return amplifiedNoise * 0.5 + 0.5; // Normalize to -0.3 and 1.3
	}

	addTime(shiftAmount: number = 0.05) {
		// Chancge to non linear time progression for more dynamic changes
		this.time += shiftAmount * Math.max(0.5, Math.sin(this.time * 0.5) + 0.5); // Time progression that speeds up and slows down based on a sine wave
	}

	draw(dt: number) {
		this.lastSunUpdate += dt;
		if (this.lastSunUpdate < 1 / 15) {
			// Update the sun at a maximum of 15 FPS
			return;
		}
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const ray = new SunRayDecorateur(this);

		ray.filledCircle(this.position, this.size / 2);
		this.addTime(this.lastSunUpdate * 0.4); // Adjust time progression speed based on delta time
		this.lastSunUpdate = 0;
	}

	drawCircle(center: { x: number; y: number }, radius: number) {
		super.drawCircle(center, radius);
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
		};

		await annim.animate(duration, new EaseInOutEasing(), (t) => {
			camera.setCameraPosition({
				x: lerp(originalPosition.x, targetCamPosition.x, t),
				y: lerp(originalPosition.y, targetCamPosition.y, t),
			});

			camera.setCameraZoom(lerp(originalCamZ, camZ, t));
		}).then(() => {
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

	drawPixel(position: Position, color?: string): void {
		const temp = this.sun.getTemperature(position);

		// On high temp add pixel arround the current pixel to create rays effect
		const additionalPixels = Math.floor((temp + 0.2) * Math.random() * 10); // More pixels for higher temperatures

		for (let i = 0; i < additionalPixels; i++) {
			const angle = Math.random() * 2 * Math.PI;
			const distance = (Math.random() * temp * this.sun.getSize()) / 8; // More distance for higher temperatures
			const rayX = position.x + Math.cos(angle) * distance;
			const rayY = position.y + Math.sin(angle) * distance;

			this.sun.drawPixel(
				{ x: Math.floor(rayX), y: Math.floor(rayY) },
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
