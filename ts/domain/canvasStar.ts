import { Particle } from "./particle.js";
import { canvasParticleManager, DirectionEnum, DirectionVectors } from "./canvasParticleManager.js";

export class CanvasStar extends Particle {
	private velocity: { x: number; y: number } = { x: 0, y: 0 };
	static innerHeight: number;
	static innerWidth: number;
	private static readonly margin = 10;
	private position: { x: number; y: number } = { x: 0, y: 0 };
	private static readonly size = 6;
	private static readonly starPixels = [
		[
			{ dx: 1, dy: 0, r: 255, g: 255, b:255, opacity: 1 }, // Haut-centre
			{ dx: 0, dy: 1, r: 255, g: 255, b:255, opacity: 1 }, // Gauche-centre
			{ dx: 2, dy: 1, r: 255, g: 255, b:255, opacity: 1 }, // Droit-centre
			{ dx: 1, dy: 2, r: 255, g: 255, b:255, opacity: 1 }, // Bas-centre
			{ dx: 1, dy: 1, r: 255, g: 255, b:255, opacity: 1 }, // Centre (optionnel)
		],
		[
			{ dx: 1, dy: 0, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 2, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 2, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 2, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 2, dy: 2, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 1, dy: 3, r: 255, g: 235, b:56, opacity: 0.6 },
		],
		[
			{ dx: 1, dy: 0, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 2, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 2, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 2, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 2, dy: 2, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 1, dy: 3, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 0, dy: 3, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 1, dy: 4, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 2, dy: 3, r: 255, g: 235, b:56, opacity: 0.6 },
		],
		[
			{ dx: 1, dy: 0, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 2, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 2, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 2 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 2, dy: 2 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 1, dy: 3 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 0, dy: 3 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 1, dy: 4 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 2, dy: 3 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
		],
		[
			{ dx: 1, dy: 0, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 2, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 2, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 1, dy: 1, r: 255, g: 255, b:255, opacity: 1 },
			{ dx: 0, dy: 3 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 1, dy: 4 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
			{ dx: 2, dy: 3 + 1, r: 255, g: 235, b:56, opacity: 0.6 },
		],
	];
	private frame: number = 0;
	private timeSinceLastFrame: number = 0;
	private annimationSpeed: number = 0.2; // Vitesse d'animation en secondes par frame
	private static readonly baseOpacity = 0.6;
	private static direction : DirectionEnum = "UP" as DirectionEnum;

	constructor(
		private particleManager: canvasParticleManager,
		window: Window = globalThis.window,
		private ctx: CanvasRenderingContext2D,
	) {
		super();
		CanvasStar.innerHeight = this.particleManager.canvas.height;
		CanvasStar.innerWidth = this.particleManager.canvas.width;

		// random annimation speed between 0.1 and 0.3 seconds per frame
		this.annimationSpeed = 0.1 + Math.random() * 0.2;

		this.summon();
	}

	summon(): void {

		this.position = {
			x: Math.random() * CanvasStar.innerWidth,
			y: DirectionVectors[CanvasStar.direction].y == -1 ? CanvasStar.innerHeight : 0 - CanvasStar.margin,
		};

		this.ctx.fillStyle = "white";
		this.velocity = { x: 50, y: 0 };

		// start on random frame to add some variation between stars
		this.frame = Math.floor(Math.random() * CanvasStar.starPixels.length);

		this.drawStar();
	}
	update(): void {
		throw new Error("Method not implemented.");
	}
	draw(dt: number): void {

		this.timeSinceLastFrame += dt;
		if (this.timeSinceLastFrame >= this.annimationSpeed) {
			this.frame = (this.frame + 1) % CanvasStar.starPixels.length;
			this.timeSinceLastFrame = 0;
		}

		// expodentially increase the velocity to create a falling effect
		this.velocity.y += 0.3 * dt; // Gravité linéaire (optionnel, pour un effet plus réaliste)
		this.velocity.y = Math.min(this.velocity.y * Math.exp(1.15 * dt), 500); // Accélération exponentielle indépendante du FPS

		this.position.y +=
			DirectionVectors[CanvasStar.direction].y * this.velocity.y;
		this.position.x +=
			DirectionVectors[CanvasStar.direction].x * this.velocity.x;

		this.drawStar();

		// this.fadeOut(dt);
		
		// Element outisde canvas bounds, destroy it
		if (this.isOutOfBounds()) {
			this.softDestroy();
		}
	}

	private isOutOfBounds() {
		return (
			this.position.y > CanvasStar.innerHeight + CanvasStar.margin ||
			this.position.y < -CanvasStar.margin ||
			this.position.x > CanvasStar.innerWidth + CanvasStar.margin ||
			this.position.x < -CanvasStar.margin
		);
	}

	private drawStar() {
		//Manage the direction of the star based on the static direction property

		const Xdirection = DirectionVectors[CanvasStar.direction].x;
		const Ydirection = DirectionVectors[CanvasStar.direction].y;

		CanvasStar.starPixels[this.frame].forEach(({ dx, dy, r, g, b, opacity }) => {
			this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * CanvasStar.baseOpacity})`;
			this.ctx.fillRect(
				this.position.x + dx * CanvasStar.size,
				this.position.y + dy * CanvasStar.size,
				CanvasStar.size,
				CanvasStar.size,
			);
		});
	}
	destroy(): void {
		this.particleManager.removeParticle(this);
	}

	softDestroy(): void {

		if (this.particleManager.activParticles === false) {
			this.destroy();
			return;
		}

		// this.element.style.opacity = "1";
		this.velocity = { x: 0, y: 0 };
		this.frame = 0;
		this.summon();
	}
}
