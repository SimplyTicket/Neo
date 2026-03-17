import { Particle } from "./particle";
import { ParticulManager } from "./particulManager";



export class HtmlStar extends Particle {
	private element: HTMLDivElement;
	private velocity: { x: number; y: number } = { x: 0, y: 0 };
	private static innerHeight: number;
	private static innerWidth: number;
	private static readonly margin = 10;
	private position: { x: number; y: number } = { x: 0, y: 0 };

	constructor(
		private particulManager: ParticulManager,
		window: Window = globalThis.window,
		parent: HTMLElement = document.body,
	) {
		super();
		this.element = document.createElement("div");
		this.element.classList.add("star", "particul");
		this.element.style.willChange = "transform, opacity";
		document.body.appendChild(this.element);

		HtmlStar.innerHeight = window.innerHeight + HtmlStar.margin;
		HtmlStar.innerWidth = window.innerWidth + HtmlStar.margin;
	}

	update(): void {
		throw new Error("Method not implemented.");
	}

	summon(): void {
		// put at the bottom of the page with a random horizontal position
		this.element.style.left = `${-HtmlStar.margin}px`;
		this.element.style.top = `${-HtmlStar.margin}px`;
		this.position = {
			x: Math.random() * HtmlStar.innerWidth,
			y: HtmlStar.innerHeight,
		};

		this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
		this.velocity = { x: 0, y: 0 };
	}

	static update(): void {
		// react to window resize
		HtmlStar.innerHeight = window.innerHeight + HtmlStar.margin;
		HtmlStar.innerWidth = window.innerWidth + HtmlStar.margin;
	}

	draw(dt: number): void {
		// expodentially increase the velocity to create a falling effect
		this.velocity.y += 0.5 * dt; // Gravité linéaire (optionnel, pour un effet plus réaliste)
		this.velocity.y = Math.min(this.velocity.y * Math.exp(1.2 * dt), 500); // Accélération exponentielle indépendante du FPS
		this.position.y -= this.velocity.y;
		// Dans ta méthode draw(dt: number) :
		this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`; // Utilise transform au lieu de top

		// this.fadeOut(dt);

		if (this.position.y < -HtmlStar.margin) {
			this.softDestroy();
		}
	}

	private fadeOut(dt: number): void {
		this.element.style.opacity = `${1 - this.velocity.y * 7 * dt}`; // Fading effect
	}
	private inOut(dt: number): void {
		this.element.style.opacity = `${this.velocity.y * 7 * dt}`; // Fading effect
	}

	destroy(): void {
		this.element.remove();
		this.particulManager.removeParticul(this);
	}

	// reset intead of destroy to reuse the element and avoid creating too many divs
	softDestroy(): void {
		this.element.style.opacity = "1";
		this.velocity = { x: 0, y: 0 };
		this.summon();
	}
}