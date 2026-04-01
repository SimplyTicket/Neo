import { link } from "node:fs";
import PixelManager, { Position } from "../Managers/PixelManager.js";
import PageAbstract from "./PageAbstract.js";
import { Sun } from "../sun.js";

import {
	canvasManager,
	canvasParticulManager,
} from "../canvasParticulManager.js";
import AnimationManager, {
	EaseInOutEasing,
} from "../Managers/AnnimationManager.js";

export default class WebRing extends PageAbstract {
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
		const links = linkContainer ? linkContainer.querySelectorAll("a") : [];

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

	getPositionForLink(link: Element, raduisMult: number = 1): { x: number; y: number } {
			const div = link.getAttribute("circlePos")
				? parseInt(link.getAttribute("circlePos")!)
				: this.division;
			const angle =
				((360 / this.division) * div + this.degOffset) * (Math.PI / 180);
			const x = this.centerX + this.radius * raduisMult * Math.cos(angle);
			const y = this.centerY + this.radius * raduisMult * Math.sin(angle);
			return { x, y };
	}


	async afterSwitch(): Promise<void> {
		super.afterSwitch();
		const linkContainer = document.getElementById("link-container");

		const links = linkContainer ? linkContainer.querySelectorAll("a") : [];

		if (!linkContainer) {
			throw new Error("Link container not found");
		}

		this.prticulManager = new canvasManager("link-stars", 120);
		canvasParticulManager.getInstance().addCanvasManager(this.prticulManager);

		links.forEach((link, index) => {
			const sun = new Sun(25);
			sun.disableCameraEffect();
			const rect = link.getBoundingClientRect();
			const position = PixelManager.getPositionFromRealPosition({
				x: rect.x,
				y: rect.y,
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
			});

			this.prticulManager!.addParticle(sun);
		});
	}

	async afterTearDown(): Promise<void> {
		if (this.prticulManager) {
			canvasParticulManager
				.getInstance()
				.removeCanvasManager(this.prticulManager);
			this.prticulManager = undefined;
		}
	}
}
