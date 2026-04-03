import { Sun } from "../sun.js";
import PixelManager, { Drawable, Position } from "./PixelManager.js";

interface listOfParticles  {
		baseSize: number;
		basePosition: Position;
		pixelManager: Drawable;
}

export default class CameraManager {

	updateBasePosition(element: Drawable, position: Position) {
		const index = this.getElementIndex(element);

		this.listOfParticles[index].basePosition = position
		this.updatePixelManagersPosition()
	}

	getDepthEffect(element : Drawable) : number {
		const closestZ = this.getDistanceFromCamera(
			this.closestObject().getPosition(),
		);
		const distance = this.getDistanceFromCamera(element.getPosition());
		return closestZ / distance;
	}
	getZoom() {
		return this.position.z! - this.baseDistance;
	}
	private static instance: CameraManager;
	private baseDistance = 10;
	private position: Position = { x: 0, y: 0, z: this.baseDistance };
	private listOfParticles: listOfParticles[] = [];

	private constructor() {}

	static getInstance(): CameraManager {
		if (!CameraManager.instance) {
			CameraManager.instance = new CameraManager();
		}
		return CameraManager.instance;
	}

	addParticle(pixelManager: Drawable): void {
		const baseSize = pixelManager.getSize();
		const basePosition = pixelManager.getPosition();
		this.listOfParticles.push({ baseSize, basePosition, pixelManager });
		this.listOfParticles.sort((a: listOfParticles, b: listOfParticles) => {
			return a.pixelManager.getPosition().z - b.pixelManager.getPosition().z;
		});
	}

	setCameraPosition(position: Position): void {
		this.position.x = position.x;
		this.position.y = position.y;
		// this.position.z = position.z;
		this.updatePixelManagersPosition();
	}

	updatePixelManagersPosition(): void {
		this.listOfParticles.forEach(({ basePosition, pixelManager }) => {
			const position = basePosition;
			const distance = this.getDistanceFromCamera(position);
			pixelManager.updatePosition({
				x: basePosition.x + this.position.x / distance,
				y: basePosition.y + this.position.y / distance,
				z: basePosition.z, // May cauze bug should refacor the base position
			});
		});
	}

	closestObject(): Drawable {
		return this.listOfParticles[0].pixelManager;
	}

	furtherObject(): Drawable {
		return this.listOfParticles[this.listOfParticles.length - 1].pixelManager;
	}

	moveCameraSoElemIsOn(
		element: Drawable,
		position: Position,
		zoomWillBy: number = this.position.z!,
	): Position {
		zoomWillBy += this.baseDistance;
		const distance = this.getDistanceFromCamera(
			element.getPosition(),
			zoomWillBy,
		);
		const particle = this.getElement(element);

		if (!particle) throw Error("No element found in the camera");

		const cameraX = (position.x - particle.basePosition.x) * distance;
		const cameraY = (position.y - particle.basePosition.y) * distance;

		return { x: cameraX, y: cameraY, z: zoomWillBy };
	}

	updatePixelManagersZoom(): void {
		this.listOfParticles.forEach(({ baseSize, pixelManager }) => {
			const newSize =
				(baseSize * this.baseDistance) /
				this.getDistanceFromCamera(pixelManager.getPosition());
			pixelManager.updateSize(Math.round(newSize));
		});
	}

	moveCamera(position: Position): void {
		this.position.x += position.x;
		this.position.y += position.y;
		this.updatePixelManagersPosition();
	}

	getCameraPosition(): Position {
		return { x: this.position.x, y: this.position.y, z: this.position.z! - this.baseDistance };
	}

	getDistanceFromCamera(
		position: Position,
		camPositon: number = this.position.z!,
	): number {
		return Math.abs((position.z || 0) + camPositon);
	}

	setCameraZoom(z: number): void {
		this.position.z = this.baseDistance + z;
		this.updatePixelManagersZoom();
	}

	zoomCamera(z: number): void {
		this.position.z! += z;
		this.updatePixelManagersZoom();
	}

	getElement(elementTofind: Drawable): listOfParticles | undefined {
		return this.getElementIndex(elementTofind) !== -1
			? this.listOfParticles[this.getElementIndex(elementTofind)]
			: undefined;
	}

	getElementIndex(elementTofind: Drawable): number {
		return this.listOfParticles.findIndex((element) => {
			return element.pixelManager == elementTofind;
		});
	}

	getAllElements(): Drawable[] {
		return this.listOfParticles.map((element) => element.pixelManager);
	}
};