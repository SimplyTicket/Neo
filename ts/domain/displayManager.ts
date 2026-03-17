
export class DisplayManager {
	private lastTime = 0;
	private capedFPS: boolean = false;
	private static readonly targetBGFPS = 30; // FPS cible en arrière-plan
	private targetFrameTime = 1000 / DisplayManager.targetBGFPS; // Temps cible entre chaque frame en ms
	private accumulatedTime = 0;
	private static isTabActive = true;
	private static listenerSet : CallableFunction[] = [];

	constructor() {}

	public capOnBackgroundTab() : void {
		// Ajoute un écouteur pour les changements de visibilité de la page
		DisplayManager.listenerSet.push(() => {
			if (!DisplayManager.getIsTabActive()) {
				this.capedFPS = true;
			} else {
				this.capedFPS = false;
				this.accumulatedTime = 0; // Réinitialise le temps accumulé lorsque l'onglet devient actif
			}
		});
	}

	static setUpEventListeners(): void {
		// document.addEventListener("visibilitychange", () => {
		// 	DisplayManager.isTabActive = !document.hidden;
		// 	console.log(`Tab is now ${DisplayManager.isTabActive ? "active" : "inactive"}`);
		// 	for (const listener of DisplayManager.listenerSet) {
		// 		listener();
		// 	}
		// });
	}

	static getIsTabActive(): boolean {
		return DisplayManager.isTabActive;
	}

	getTargetFrameTime(): number {
		if (!this.capedFPS) {
			return 0; // Pas de limitation de FPS
		}
		return this.targetFrameTime;
	}

	newFrame(dt: number): void {
		if (!this.capedFPS) {
			return; // Pas de limitation de FPS, on peut dessiner immédiatement
		}

		this.accumulatedTime += dt * 1000; // Convertit dt en ms
	}

	nonFrameTime(dt: number): void {
		if (!this.capedFPS) {
			return; // Pas de limitation de FPS, on peut dessiner immédiatement
		}
		
		this.accumulatedTime += dt * 1000; // Convertit dt en ms
	}

	timeSinceLastFrame(): number {
		if (!this.capedFPS) {
			return 0; // Pas de limitation de FPS, on peut dessiner immédiatement
		}

		return this.accumulatedTime;
	}
}