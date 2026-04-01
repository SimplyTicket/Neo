import Star from "./bg/stars.js";
import { CanvasStar } from "./canvasStar.js";
import { Drawable } from "./Managers/PixelManager.js";
import { Particle, ParticleInterface } from "./particle.js";

export enum DirectionEnum {
	UP = "UP",
	DOWN = "DOWN",
	LEFT = "LEFT",
	RIGHT = "RIGHT",
}

export const DirectionVectors = {
	[DirectionEnum.UP]: { x: 0, y: -1 },
	[DirectionEnum.DOWN]: { x: 0, y: 1 },
	[DirectionEnum.LEFT]: { x: -1, y: 0 },
	[DirectionEnum.RIGHT]: { x: 1, y: 0 },
};

export class canvasManager {
	public canvas: HTMLCanvasElement;
	protected ctx: CanvasRenderingContext2D;
	private particles: Drawable[] = [];
	private lastTime: number = 0;
	protected maxParticuls: number;
	public activParticuls: boolean = true;
	lastFrame: number = 0;
	private static canvasInstance: canvasManager[] = [];
	protected static instance: canvasParticulManager;

	constructor(
		canvasId: string,
		private frameRate: number = 15,

	) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas) {
			throw new Error(`Canvas element with id "${canvasId}" not found`);
		}
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get 2D context");
		}
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		this.ctx = ctx;
		this.resize(this.canvas, this.ctx);
		this.maxParticuls = Math.floor(
			(this.canvas.width * this.canvas.height) / 10000,
		);
		addEventListener("resize", () => {
			this.resize(this.canvas, this.ctx);
			CanvasStar.innerHeight = window.innerHeight;
			CanvasStar.innerWidth = window.innerWidth;
		});
	}

	resize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		// const dpr = window.devicePixelRatio || 1;
		const dpr = 1;

		const width = window.innerWidth;
		const height = window.innerHeight;

		canvas.style.width = width + "px";
		canvas.style.height = height + "px";

		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);

		this.maxParticuls = Math.floor(
			(this.canvas.width * this.canvas.height) / 10000,
		);

		// ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.imageSmoothingEnabled = false;
	}

	addParticle(particle: Drawable): void {
		this.particles.push(particle);
	}

	getParticuls() {
		return this.particles;
	}

	removeParticle(particle: Drawable): void {
		const index = this.particles.indexOf(particle);
		if (index !== -1) {
			this.particles.splice(index, 1);
		}
	}

	draw(dt: number): void {
		this.lastFrame += dt;
		if (this.lastFrame < 1 / this.frameRate) {
			// Update the sun at a maximum of 15 FPS
			return;
		}

		dt = Math.min(dt, 1 / 30); // Cap dt to avoid big jumps (e.g., when the tab was inactive)
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw all particles ordered by their z-index (if they have one)
		this.particles.sort(
			(a: Drawable, b: Drawable) => b.getPosition().z - a.getPosition().z,
		);
		this.particles.forEach((particle) => {
			particle.draw(dt);
		});

		canvasManager.canvasInstance.forEach((instance) => {
			if (instance !== this) {
				instance.draw(dt);
			}
		});

		this.lastFrame = 0;

		// One new star every 0.1 second
		// this.timeSinceLastStar = (this.timeSinceLastStar || 0) + dt;
		// if (
		// 	this.activParticuls &&
		// 	this.timeSinceLastStar >= 0.1 &&
		// 	this.particles.length < this.maxParticuls
		// ) {
		// 	this.addParticle(new CanvasStar(this, undefined, this.ctx));
		// 	this.timeSinceLastStar = 0;
		// }
	}

	addCanvasManager(particulManager: canvasManager) {
		canvasManager.canvasInstance.push(particulManager);
	}

	removeCanvasManager(particulManager: canvasManager) {
		const index = canvasManager.canvasInstance.indexOf(particulManager);
		if (index !== -1) {
			canvasManager.canvasInstance.splice(index, 1);
		}
	}
}

export class canvasParticulManager extends canvasManager{

	static getInstance(canvasId: string = "starBg"): canvasParticulManager {
		if (!canvasParticulManager.instance) {
			canvasParticulManager.instance = new canvasParticulManager(canvasId);
		}
		return canvasParticulManager.instance;
	}

	addStars() {
		for (let i = 0; i < this.maxParticuls; i++) {
			this.addParticle(new Star(this.ctx, this.canvas, 1));
		}
	}
}