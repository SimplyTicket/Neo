import CameraManager from "../Managers/CameraManager.js";
import { Drawable, Position } from "../Managers/PixelManager.js";
import { ParticleInterface } from "../particle.js";

export default class Star extends Drawable implements ParticleInterface {
	private maxDepth = 3000;
	private minDepth = 500;
	private margin = 10;
	maxAmmount: number = 100;
	ammount: number = 0;

	constructor(
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		size: number,
	) {
		const position = { x: 0, y: 0, z: 0 };
		super(ctx, canvas, size, position);
		this.summon();
		CameraManager.getInstance().addParticle(this);
	}

	summon() {
		this.position = {
			x: Math.round(
				-this.margin + Math.random() * (this.getCanvasWidth() + this.margin * 2),
			),
			y: Math.round(
				-this.margin + Math.random() * (this.getCanvasHeight() + this.margin * 2),
			),
			z: Math.round(this.minDepth + Math.random() * this.maxDepth),
		};

		this.drawPixel(
			this.position,
			`rgba(255, 255, 255, ${1 - this.position.z! / this.maxDepth})`,
		);
	}

	updatePosition(position: Position) {

		// if out of screen, move it to the other side (with a screen size margin)
		if (this.position.x! <  -this.margin) {
			position.x += this.getCanvasWidth() + this.margin;
		} else if (this.position.x! > this.getCanvasWidth() + this.margin) {
			position.x -= this.getCanvasWidth() + this.margin;
		}

		if (this.position.y! < -this.margin) {
			position.y += this.getCanvasHeight() + this.margin;
		} else if (this.position.y! > this.getCanvasHeight() + this.margin) {
			position.y -= this.getCanvasHeight() + this.margin;
		}

		super.updatePosition(position);
	}

	update(): void {
		throw new Error("Method not implemented.");
	}
	draw(dt: number): void {
		this.drawPixel(
			this.position,
			`rgba(255, 255, 255, ${1 - this.position.z! / this.maxDepth})`,
		);
	}
	destroy(): void {
		throw new Error("Method not implemented.");
	}
}