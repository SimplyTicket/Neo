import Star from "./bg/stars.js";
import { CanvasStar } from "./canvasStar.js";
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

export class canvasParticulManager {
	private static instance: canvasParticulManager;
	public canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private particles: ParticleInterface[] = [];
	private lastTime: number = 0;
	private timeSinceLastStar: number = 0;
	private maxParticuls = 60 * 3;
	public activParticuls: boolean = true;

	private constructor(canvasId: string = "starBg") {
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
		addEventListener("resize", () => {
			this.resize(this.canvas, this.ctx);
			CanvasStar.innerHeight = window.innerHeight;
			CanvasStar.innerWidth = window.innerWidth;
		})
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

		// ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.imageSmoothingEnabled = false;
	}


	static getInstance(canvasId: string = "starBg"): canvasParticulManager {
		if (!canvasParticulManager.instance) {
			canvasParticulManager.instance = new canvasParticulManager(canvasId);
		}
		return canvasParticulManager.instance;
	}

	addParticle(particle: ParticleInterface): void {
		this.particles.push(particle);
	}

	getParticuls() {
		return this.particles
	}

	removeParticle(particle: ParticleInterface): void {
		const index = this.particles.indexOf(particle);
		if (index !== -1) {
			this.particles.splice(index, 1);
		}
	}

	draw(dt: number): void {
		dt = Math.min(dt, 1 / 30); // Cap dt to avoid big jumps (e.g., when the tab was inactive)
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.particles.forEach((particle) => {
			particle.draw(dt);
		});

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

	addStars() {
		for (let i = 0; i < this.maxParticuls; i++) {
			this.addParticle(new Star(this.ctx, this.canvas, 1));
		}
	}
}
