import PixelManager, { Position } from "../Managers/PixelManager.js";
import PageAbstract from "./PageAbstract.js";
import { Sun } from "../sun.js";

import {
	canvasManager,
	canvasParticleManager,
} from "../canvasParticleManager.js";
import AnimationManager, {
	EaseInOutEasing,
} from "../Managers/AnimationManager.js";

export default class WebRing extends PageAbstract {

	suns: Sun[] = [];

	pageName: string = "WebRing";
	camPosition: Position = { x: -5000, y: 5000, z: 20 };

	private centerX = window.innerWidth / 2; // Center the circle horizontally
	private centerY = window.innerHeight / 2; // Center the circle vertically
	private division = 8;
	private radius : number // Radius of the circle, adjust as needed
	private prticulManager: canvasManager | undefined;
	private degOffset: number = -90;

	constructor() {
		super();


		this.radius = Math.min(window.innerWidth, window.innerHeight) / 2 - 100; // Set radius based on the smaller dimension of the window

		// get links
		const linkContainer = document.getElementById("link-container");
		const links = linkContainer ? linkContainer.querySelectorAll("[circlePos]") : [];

		if (!linkContainer) {
			throw new Error("Link container not found");
		}

		// position links in a circle

		links.forEach((link, index) => {
			const { x, y } = this.getPositionForLink(link);
			link.setAttribute(
				"style",
				`position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%);`,
			);
		});


	}

	getPositionForLink(link: Element, radiusMult: number = 1): { x: number; y: number } {
		// is on small device, put links in a square list
		// if (window.innerWidth < 600) {
		// 	const index = link.getAttribute("circlePos")
		// 		? parseInt(link.getAttribute("circlePos")!)
		// 		: 1;

		// 	const y = 300 + ((index - 1) % 2) * 50;
		// 	const x = index % 2 === 0 ? 100 : window.innerWidth - 100;
		// 	return { x, y };
		// }

		if (window.innerWidth < 780) {
			this.centerY = window.innerHeight * 0.75;
			// this.degOffset = 90;
		}

		const div = link.getAttribute("circlePos")
			? parseInt(link.getAttribute("circlePos")!)
			: this.division;
		const angle =
			((360 / this.division) * div + this.degOffset) * (Math.PI / 180);
		const x = this.centerX + this.radius * radiusMult * Math.cos(angle);
		const y = this.centerY + this.radius * radiusMult * Math.sin(angle);
		return { x, y };
	}


	async beforeSwitch(): Promise<void> {
		super.beforeSwitch();
		// hide links
		const linkContainer = document.getElementById("link-container");
		const links = linkContainer ? linkContainer.querySelectorAll("[circlePos]") : [];

		if (!linkContainer) {
			throw new Error("Link container not found");
		}

		links.forEach((link) => {
			link.classList.add("opacity-0");
		});
	}

	async afterSwitch(): Promise<void> {
		super.afterSwitch();
		const linkContainer = document.getElementById("link-container");

		const links = linkContainer ? linkContainer.querySelectorAll("[circlePos]") : [];

		if (!linkContainer) {
			throw new Error("Link container not found");
		}

		this.prticulManager = new canvasManager("link-stars", 120);
		canvasParticleManager.getInstance().addCanvasManager(this.prticulManager);

		links.forEach((link, index) => {
			const sun = new Sun(25);

			sun.disableCameraEffect();
			const rect = link.getBoundingClientRect();
			const position = PixelManager.getPositionFromRealPosition({
				x: rect.x + rect.width / 2,
				y: rect.y + rect.height / 2,
			});


			const { x, y } = this.getPositionForLink(link, 3);

			const beginPosition = PixelManager.getPositionFromRealPosition({
				x,
				y,
			});

			this.annim.animate(1500 + index * 300, new EaseInOutEasing(), (t) => {
				sun.updatePosition({
					x: AnimationManager.lerp(beginPosition.x, position.x, t),
					y: AnimationManager.lerp(beginPosition.y, position.y, t),
					z: 0,
				});
			}).then(() => {
				// display link after animation
				link.classList.remove("opacity-0");
			});

			this.prticulManager!.addParticle(sun);
			this.suns.push(sun);
		});
	}

	beforeTearDown(): Promise<void> {

		this.suns.forEach((sun) => {
			this.annim.animate(2500, new EaseInOutEasing(), (t) => {
				sun.updateSize(AnimationManager.lerp(sun.getSize(), 0, t));
			})
		});

		const linkContainer = document.getElementById("link-container");

		const links = linkContainer ? linkContainer.querySelectorAll("[circlePos]") : [];

		links.forEach((link) => {
			link.classList.add("opacity-0");
		});
		return super.beforeTearDown();
	}

	async afterTearDown(): Promise<void> {
		this.suns = [];

		if (this.prticulManager) {
			canvasParticleManager
				.getInstance()
				.removeCanvasManager(this.prticulManager);
			this.prticulManager = undefined;
		}
	}
}
