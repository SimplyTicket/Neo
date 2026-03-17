import { ParticulManager } from "./domain/particulManager.js";
import { canvasParticulManager } from "./domain/canvasParticulManager.js";
import { Sun } from "./domain/sun.js"
import PerlinNoise, { PerlinNoise2D } from "./domain/Noise/PerlinNoise.js";

document.addEventListener("DOMContentLoaded", main);

let lastTime = 0;
let frameCount = 0;
let lastSunUpdate = 0;
const DEBUG = false;
const particulManager: ParticulManager = ParticulManager.getInstance();

const sun = new Sun(128);

// Animate sun shrinking and growing progressively
let sunSize = 128;
let sunGrowing = false;
const minSunSize = 64;
const maxSunSize = 128;
const sunSpeed = 40; // pixels per second

const size = sun.getSize();
sun.filledCircle({ x: size / 2, y: size / 2 }, size / 2);

function main() {

	// Init DisplayManager to handle tab visibility and FPS capping
	// DisplayManager.setUpEventListeners();

	// Create a new star and summon it to the page
	// ParticulManager.getInstance().summonMaxParticuls();

	// make the annimation frame


	window.requestAnimationFrame(animate);

	test();
}

function animate(currentTime: number) {
	// Update all particles managed by ParticulManager
	// ParticulManager.getInstance().update();



	if (frameCount++ < 30 && DEBUG) {
		const particulAmmount = canvasParticulManager.getInstance().getParticuls().length;
		document.getElementById("frameRate")!.textContent = `FPS: ${Math.round(1 / ((currentTime - lastTime) / 1000))} | Particuls: ${particulAmmount}`;
		frameCount = 0;
	}

	// Calculate delta time for smooth animation
	if (lastTime === 0) lastTime = currentTime;
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;
	// Draw all particles managed by ParticulManager
	// ParticulManager.getInstance().draw(deltaTime);
	canvasParticulManager.getInstance().draw(deltaTime);

	// Update the sun's appearance based on Perlin noise every 0.3 seconds
	sun.draw(deltaTime);

	// Request the next animation frame
	window.requestAnimationFrame(animate);
}


// For testing propruces, must be deleted
function test() {




	// sun.drawLine({ x: 0, y: 0 }, { x: size / 2, y: size / 2 });
	// sun.drawLine({ x: 32, y: 0 }, { x: size / 2, y: size / 2 });
	// sun.drawLine({ x: 64, y: 0 }, { x: size / 2, y: size / 2 });

	// sun.drawLine({ x: 0, y: 32 }, { x: size / 2, y: size / 2 });
	// sun.drawLine({ x: 64, y: 32 }, { x: size / 2, y: size / 2 });

	// sun.drawLine({ x: 0, y: 64 }, { x: size / 2, y: size / 2 });
	// sun.drawLine({ x: 32, y: 64 }, { x: size / 2, y: size / 2 });
	// sun.drawLine({ x: 64, y: 64 }, { x: size / 2, y: size / 2 });



	// sun.drawLine({x:64, y:32}, {x:0, y:0})

}