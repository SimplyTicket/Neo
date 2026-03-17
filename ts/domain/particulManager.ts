
import { Particle } from "./particle";
import { HtmlStar } from "./stars";
import { DisplayManager } from "./displayManager";
export class ParticulManager {
	private maxParticuls: number = 13000;
	private particuls: Particle[] = [];
	static instance: ParticulManager;
	private timeSinceLastStar: number = 0;
	// private displayManager: DisplayManager;
	private constructor(
		private parent: HTMLElement = document.getElementById("particulContainer")!,
	) {
		// this.displayManager = new DisplayManager();
		// this.displayManager.capOnBackgroundTab();
		if (!parent) {
			throw new Error("Parent element not found");
		}

		document.addEventListener("resize", async () => {
			// add time out
			HtmlStar.update();
		});
	}

	getParticuls(): Particle[] {
		if (!ParticulManager.instance) {
			ParticulManager.instance = new ParticulManager();
		}
		return ParticulManager.instance.particuls;
	}

	static getInstance(): ParticulManager {
		if (!ParticulManager.instance) {
			ParticulManager.instance = new ParticulManager();
		}
		return ParticulManager.instance;
	}

	addParticul(particul: Particle): void {
		if (!(this.particuls.length < this.maxParticuls)) {
			return;
		}
		this.particuls.push(particul);
		particul.summon();
	}

	draw(dt: number): void {
		// if (this.displayManager.getTargetFrameTime()) {
		// 	this.displayManager.timeSinceLastFrame()
		// }

		// if (this.displayManager.getTargetFrameTime() && this.displayManager.timeSinceLastFrame() < this.displayManager.getTargetFrameTime()) {
		// 	this.displayManager.nonFrameTime(dt);
		// 	return; // Skip drawing if we haven't reached the target frame time
		// }

		// this.displayManager.newFrame(dt);

		dt = Math.min(dt, 1 / 30); // Cap dt to avoid big jumps (e.g., when the tab was inactive)

		this.particuls.forEach((particul) => {
			particul.draw(dt);
		});

		// One new star every 0.1 second
		this.timeSinceLastStar = (this.timeSinceLastStar || 0) + dt;
		if (this.timeSinceLastStar >= 0.1 && this.particuls.length < this.maxParticuls) {
			this.addParticul(new HtmlStar(this, undefined, this.parent));
			this.addParticul(new HtmlStar(this, undefined, this.parent));
			this.addParticul(new HtmlStar(this, undefined, this.parent));
			this.addParticul(new HtmlStar(this, undefined, this.parent));
			this.timeSinceLastStar = 0;
		}
	}

	update(): void {
		this.particuls.forEach((particul) => {
			particul.update();
		});
	}

	async progrssiveUpdate(): Promise<void> {
		for (const particul of this.particuls) {
			particul.update();
			await new Promise((resolve) => setTimeout(resolve, 10)); // Attendre 10ms entre chaque update pour éviter les blocages
		}
	}

	summonMaxParticuls(): void {
		while (this.particuls.length < this.maxParticuls) {
			this.addParticul(new HtmlStar(this, undefined, this.parent));
		}
	}

	removeParticul(particul: Particle): void {
		this.particuls = this.particuls.filter((p) => p !== particul);
	}

	getInfo(): string {
		return `Particuls: ${this.particuls.length}/${this.maxParticuls}`;
	}


}