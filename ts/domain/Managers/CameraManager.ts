import PixelManager, { Drawable, Position } from "./PixelManager.js";

interface listOfParticuls  {
		baseSize: number;
		basePosition: Position;
		pixelManager: Drawable;
}

export default class CameraManager {
	getZoom() {
		return this.position.z! - this.baseDistance;
	}
	private static instance: CameraManager;
	private baseDistance = 10;
	private position: Position = { x: 0, y: 0, z: this.baseDistance };
	private listOfParticuls: listOfParticuls[] = [];

	private constructor() {}

	static getInstance(): CameraManager {
		if (!CameraManager.instance) {
			CameraManager.instance = new CameraManager();
		}
		return CameraManager.instance;
	}

	addParticul(pixelManager: Drawable, distance: number): void {
		const baseSize = pixelManager.getSize();
		const basePosition = pixelManager.getPosition();
		this.listOfParticuls.push({ baseSize, basePosition, pixelManager });
	}

	setCameraPosition(position: Position): void {
		this.position.x = position.x;
		this.position.y = position.y;
		this.updatePixelManagersPosition();
	}

	updatePixelManagersPosition(): void {
		this.listOfParticuls.forEach(({ basePosition, pixelManager }) => {
			const position = basePosition;
			const distance = this.getDistanceFromCamera(position);
			pixelManager.updatePosition({
				x: basePosition.x + this.position.x / distance,
				y: basePosition.y + this.position.y / distance,
			});
		});
	}

	updatePixelManagersZoom(): void {
		this.listOfParticuls.forEach(({ baseSize, pixelManager }) => {
			const newSize =
				(baseSize * this.baseDistance) /
				this.getDistanceFromCamera(pixelManager.getPosition());
			pixelManager.updateSize(Math.round(newSize));
		});
	}

	mooveCamera(position: Position): void {
		this.position.x += position.x;
		this.position.y += position.y;
		this.updatePixelManagersPosition();
	}

	getCameraPosition(): Position {
		return this.position;
	}

	getDistanceFromCamera(position: Position, camPositon :number = this.position.z!): number {
		return Math.abs((position.z || 0) - camPositon);
	}

	setCameraZoom(z: number): void {
		this.position.z = this.baseDistance + z;
		this.updatePixelManagersZoom();
	}

	zoomCamera(z: number): void {
		this.position.z! += z;
		this.updatePixelManagersZoom();
	}

	getElement(elementTofind: Drawable): listOfParticuls | undefined {
		return this.listOfParticuls.find((element) => {
			return element.pixelManager == elementTofind;
		});
	}

	mooveCameraSoElemIsOn(
		element: Drawable,
		position: Position,
		zoomWillBy: number = this.position.z!,
	): Position {
		zoomWillBy += this.baseDistance
		const distance = this.getDistanceFromCamera(position, zoomWillBy);
		const particul = this.getElement(element);

		if (!particul) throw Error("No element found in the camera");

		const cameraX = position.x * distance - particul.basePosition.x;
		const cameraY = position.y * distance - particul.basePosition.y;

		return { x: cameraX, y: cameraY };
	}
};