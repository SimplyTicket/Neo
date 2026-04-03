import {
	canvasManager,
	canvasParticleManager,
} from "./domain/canvasParticleManager.js";
import { Sun } from "./domain/sun.js";
import AnimationManager, {
	EaseInOutEasing,
	LinearEasing,
} from "./domain/Managers/AnimationManager.js";
import CameraManager from "./domain/Managers/CameraManager.js";
import PixelManager from "./domain/Managers/PixelManager.js";
import PageManager from "./domain/Managers/PageManager.js";

document.onreadystatechange = () => {
	console.log(document.readyState);
	if (document.readyState === "interactive") {
	}
};
main();

let lastTime = 0;
let frameCount = 0;
let lastSunUpdate = 0;
const DEBUG = true;

const sunCanvas = new canvasManager("sun");

const sunInstance = new Sun(128);

const sunInstance2 = new Sun(128);

const camera = CameraManager.getInstance();

sunCanvas.addParticle(sunInstance);
sunCanvas.addParticle(sunInstance2);
camera.addParticle(sunInstance);
camera.addParticle(sunInstance2);
camera.updateBasePosition(sunInstance2, {
	x: sunInstance.getCanvasWidth() / 4,
	y: sunInstance2.getCanvasHeight() / 4,
	z: 20,
});
// camera.updateBasePosition( sunInstance, {
// 	x: sunInstance.getCanvasWidth() / 2,
// 	y: sunInstance.getCanvasHeight() / 2,
// 	z: 0,
// });
camera.updatePixelManagersZoom()

function main() {
	console.log('App started')

	// PreBoot tasks
	PageManager.getInstance();

	// Initialize the animation loop
	window.requestAnimationFrame(animate);

	canvasParticleManager.getInstance().addStars();
}

function animate(currentTime: number) {
	// Update all particles managed by ParticleManager
	// ParticleManager.getInstance().update();

	if (frameCount++ < 30 && DEBUG) {
		const particleAmount = canvasParticleManager
			.getInstance()
			.getParticles().length;
		document.getElementById("frameRate")!.textContent =
			`FPS: ${Math.round(1 / ((currentTime - lastTime) / 1000))} | Particles: ${particleAmount}`;
		frameCount = 0;
	}

	// Calculate delta time for smooth animation
	if (lastTime === 0) lastTime = currentTime;
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	// Draw all particles managed by ParticleManager
	// ParticleManager.getInstance().draw(deltaTime);
	canvasParticleManager.getInstance().draw(deltaTime);
	sunCanvas.draw(deltaTime);

	// Request the next animation frame
	window.requestAnimationFrame(animate);
}

let offsetPosition = { x: 0, y: 0 };
addEventListener('mousemove', (e) => {
	const mousePosition = PixelManager.getPositionFromRealPosition({
		x: e.clientX,
		y: e.clientY,
	});

	const sunInstance = CameraManager.getInstance().getAllElements().find((element) => element instanceof Sun) as Sun;
	const height = sunInstance.getCanvasHeight();
	const width = sunInstance.getCanvasWidth();

	const center = {
		x: width / 2,
		y: height / 2,
	};

	const currentCamPos = CameraManager.getInstance().getCameraPosition();

	const camBasePosition = {
		x: currentCamPos.x - offsetPosition.x,
		y: currentCamPos.y - offsetPosition.y,
		z: currentCamPos.z
	};

	offsetPosition = {
		x: (mousePosition.x - center.x) * 0.5,
		y: (mousePosition.y - center.y) * 0.5,
	};


	camera.setCameraPosition({
		x: camBasePosition.x + offsetPosition.x,
		y: camBasePosition.y + offsetPosition.y,
		z: camBasePosition.z,
	});
});

function testCamera() {
	const annim = new AnimationManager();

	// const position = camera.mooveCameraSoElemIsOn(sunInstance, {x: sunInstance.getCanvasWidth() /2, y: 10}, 30)
	// camera.setCameraZoom(30);
	// camera.setCameraPosition(position)

	// camera.mooveCamera({ x: 2, y: 1, z: NaN });
	// camera.setCameraZoom(30);

	sunInstance
		.moveSunToCam(
			{
				x: sunInstance.getCanvasWidth() / 2 + 20,
				y: (sunInstance.getCanvasHeight() / 2) * (3 / 4),
				z: NaN,
			},
			10,
			3000,
		)
		.then(() => {
			// Move the camera back to its original position and zoom after 2 seconds
			setTimeout(() => {
				sunInstance.moveSunToCam(
					{ x: sunInstance.getCanvasWidth() / 2, y: 15, z: NaN },
					30,
					3500,
				);
			});
		});

	addEventListener("click", (e) => {
		const clickPosition = PixelManager.getPositionFromRealPosition({
			x: e.clientX,
			y: e.clientY,
		});

		sunInstance.moveSunToCam(clickPosition, camera.getZoom(), 1000);
	});

	let lastScrollY = window.scrollY;
	document.addEventListener("scroll", (event) => {
		const scroolDiff = window.scrollY - lastScrollY;

		camera.moveCamera({ x: 0, y: scroolDiff * 3, z: NaN });
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
