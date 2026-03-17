import { ParticulManager } from "./domain/particulManager.js";
import { canvasParticulManager } from "./domain/canvasParticulManager.js";
import { Sun } from "./domain/sun.js";
import PerlinNoise, { PerlinNoise2D } from "./domain/Noise/PerlinNoise.js";
import AnimationManager, {
	EaseInOutEasing,
	LinearEasing,
} from "./domain/Managers/AnnimationManager.js";

document.addEventListener("DOMContentLoaded", main);

let lastTime = 0;
let frameCount = 0;
let lastSunUpdate = 0;
const DEBUG = false;
const particulManager: ParticulManager = ParticulManager.getInstance();

const sunInstance = new Sun(128);

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
		const particulAmmount = canvasParticulManager
			.getInstance()
			.getParticuls().length;
		document.getElementById("frameRate")!.textContent =
			`FPS: ${Math.round(1 / ((currentTime - lastTime) / 1000))} | Particuls: ${particulAmmount}`;
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
	sunInstance.draw(deltaTime);

	// Request the next animation frame
	window.requestAnimationFrame(animate);
}

// For testing propruces, must be deleted
function test() {
	setTimeout(() => {
		const anim = new AnimationManager();
		const size = sunInstance.getSize();
		const targetSize = 55;
		anim
			.animate(5000, new EaseInOutEasing(), (t) => {
				const x = lerp(size, targetSize, t);
				sunInstance.updateSize(x);
			})
			.then(() => {
				sunInstance.updateSize(targetSize);
			});

		const position = sunInstance.getPosition();
		const targetPosition = {
			x: sunInstance.getCanvasWidth() - 10,
			y: (sunInstance.getCanvasHeight() * 3) / 4,
		};
		anim
			.animate(5000, new EaseInOutEasing(), (t) => {
				const x = lerp(position.x, targetPosition.x, t);
				const y = lerp(position.y, targetPosition.y, t);
				sunInstance.updatePosition({ x, y });
			})
			.then(() => {
				sunInstance.updatePosition(targetPosition);
				nextFrame();
			});
	}, 5000);

	function nextFrame() {
		const anim = new AnimationManager();
		const size = sunInstance.getSize();
		const targetSize = 16;
		anim
			.animate(5000, new EaseInOutEasing(), (t) => {
				const x = lerp(size, targetSize, t);
				sunInstance.updateSize(x);
			})
			.then(() => {
				sunInstance.updateSize(targetSize);
			});

		const position = sunInstance.getPosition();
		const targetPosition = {
			x: sunInstance.getCanvasWidth() / 2,
			y: 10,
		};
		anim
			.animate(5000, new EaseInOutEasing(), (t) => {
				const x = lerp(position.x, targetPosition.x, t);
				const y = lerp(position.y, targetPosition.y, t);
				sunInstance.updatePosition({ x, y });
			})
			.then(() => {
				sunInstance.updatePosition(targetPosition);
				setInterval(() => {
					nextFrame();
				}, 2000);
			});
	}

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

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
