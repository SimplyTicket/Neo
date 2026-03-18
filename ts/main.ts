import { ParticulManager } from "./domain/particulManager.js";
import { canvasParticulManager } from "./domain/canvasParticulManager.js";
import { Sun } from "./domain/sun.js";
import PerlinNoise, { PerlinNoise2D } from "./domain/Noise/PerlinNoise.js";
import AnimationManager, {
	EaseInOutEasing,
	LinearEasing,
} from "./domain/Managers/AnnimationManager.js";
import CameraManager from "./domain/Managers/CameraManager.js";
import PixelManager from "./domain/Managers/PixelManager.js";

document.addEventListener("DOMContentLoaded", main);

let lastTime = 0;
let frameCount = 0;
let lastSunUpdate = 0;
const DEBUG = true;

const sunInstance = new Sun(128);
const camera = CameraManager.getInstance();
camera.addParticul(sunInstance, 50);

function main() {
	// Init DisplayManager to handle tab visibility and FPS capping
	// DisplayManager.setUpEventListeners();

	// Create a new star and summon it to the page
	// ParticulManager.getInstance().summonMaxParticuls();

	// make the annimation frame

	window.requestAnimationFrame(animate);

	// sunInstance.updatePosition({ x: 50, y: 50 });


	canvasParticulManager.getInstance().addStars();

	// test();
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

setTimeout(() => {
	testCamera();
}, 2000);

function testCamera() {
	const annim = new AnimationManager();

	// const position = camera.mooveCameraSoElemIsOn(sunInstance, {x: sunInstance.getCanvasWidth() /2, y: 10}, 30)
	// camera.setCameraZoom(30);
	// camera.setCameraPosition(position)

	// camera.mooveCamera({ x: 2, y: 1 });
	// camera.setCameraZoom(30);

	sunInstance
		.moveSunToCam(
			{
				x: sunInstance.getCanvasWidth() / 2 - 10,
				y: sunInstance.getCanvasHeight() / 2 * (3 / 4),
			},
			10,
			3000,
		)
		.then(() => {
			// Move the camera back to its original position and zoom after 2 seconds
			setTimeout(() => {
				sunInstance.moveSunToCam(
					{ x: sunInstance.getCanvasWidth() / 2, y: 15 },
					30,
					3500,
				);
			});
		});

	addEventListener("click", (e) => {
		const clickPosition = PixelManager.getPositionFromRealPosition({ x: e.clientX, y: e.clientY });

		sunInstance.moveSunToCam(clickPosition, camera.getZoom(), 1000);
	});

	let lastScrollY = window.scrollY;
	document.addEventListener("scroll", (event) => {
		const scroolDiff = window.scrollY - lastScrollY;

		camera.mooveCamera({ x: 0, y: scroolDiff * 3 });
		lastScrollY = window.scrollY;




	});




	// annim
	// .animate(3000, new EaseInOutEasing(), (t) => {
	// 	camera.setCameraPosition({
	// 		x: lerp(0, position.x, t),
	// 		y: lerp(0, position.y, t),
	// 	});
	// 		camera.setCameraZoom(lerp(0, 30, t));
	// 	})
	// 	.then(() => {
	// 		setTimeout(() => {
	// 		}, 2000);
	// 	});
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
