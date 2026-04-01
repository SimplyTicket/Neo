import AnimationManager, { EaseInOutEasing } from "../Managers/AnnimationManager.js";
import CameraManager from "../Managers/CameraManager.js";
import { Position } from "../Managers/PixelManager.js";

export default abstract class PageAbstract {
	protected annim = new AnimationManager(120);

	abstract pageName: string;
	abstract camPosition: Position;

	hide(): void {
		console.log("hide");
		const pageElement = document.querySelector(`[pageName="${this.pageName}"]`);
		if (pageElement) {
			pageElement.classList.add("display-none");
		}
	}

	show(): void {
		console.log("show");
		const pageElement = document.querySelector(`[pageName="${this.pageName}"]`);
		if (pageElement) {
			pageElement.classList.remove("display-none");
		}
	}

	async beforeSwitch(): Promise<void> {
		console.log("after switch");

		const camera = CameraManager.getInstance();

		const originalPosition = camera.getCameraPosition();
		console.log("Start animations");

		this.annim.animate(3000, new EaseInOutEasing(), (t) => {
			camera.setCameraPosition({
				x: AnimationManager.lerp(originalPosition.x, this.camPosition.x, t),
				y: AnimationManager.lerp(originalPosition.y, this.camPosition.y, t),
				z: AnimationManager.lerp(originalPosition.z, this.camPosition.z, t),
			});

			camera.setCameraZoom(
				AnimationManager.lerp(originalPosition.z, this.camPosition.z, t),
			);
		});

		const element = document.querySelector(`[pageName="${this.pageName}"]`);
		const columns = element
			? element.querySelectorAll(`[class^="col-"]`)
			: [];
		Array.from(columns).map((column) => {
			column.setAttribute(
				"style",
				`transform: translateY(100%); opacity: 0`,
			);

		})
	}

	async afterSwitch(): Promise<void> {

		const element = document.querySelector(`[pageName="${this.pageName}"]`);
		const columns = element
			? element.querySelectorAll(`[class^="col-"]`)
			: [];
		const animations = Array.from(columns).map((column) =>
			this.annim
				.animate(1000, new EaseInOutEasing(), (t) => {
					column.setAttribute(
						"style",
						`transform: translateY(${AnimationManager.lerp(100, 0, t)}%); opacity: ${AnimationManager.lerp(0, 1, t)}`,
					);
				})
				.then(() => {

				}),
		);

		await Promise.all(animations);

	}

	async beforeTearDown(): Promise<void> {
		const element = document.querySelector(`[pageName="${this.pageName}"]`);
		const columns = element ? element.querySelectorAll(`[class^="col-"]`) : [];
		const animations = Array.from(columns).map((column) =>
			this.annim
				.animate(1000, new EaseInOutEasing(), (t) => {
					column.setAttribute(
						"style",
						`transform: translateY(${AnimationManager.lerp(0, -100, t)}%); opacity: ${AnimationManager.lerp(1, 0, t)}`,
					);
				})
				.then(() => {
					column.classList.add("display-none");
				}),
		);

		await Promise.all(animations);
	}

	async afterTearDown(): Promise<void> {
		const element = document.querySelector(`[pageName="${this.pageName}"]`);
		const columns = element ? element.querySelectorAll(`[class^="col-"]`) : [];
		columns.forEach((column) => {
			column.setAttribute("style", "");
			column.classList.remove("display-none");
		});
	}
}