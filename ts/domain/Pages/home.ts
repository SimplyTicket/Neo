import CameraManager from "../Managers/CameraManager.js";
import { Position } from "../Managers/PixelManager.js";
import { Sun } from "../sun.js";
import PageAbstract from "./PageAbstract.js";

export default class home extends PageAbstract {
	pageName: string = "home";
	camPosition: Position = { x: 0, y: 0, z: 0 };

	async beforeSwitch(): Promise<void> {

		const sunInstance = CameraManager.getInstance().getAllElements().find((element) => element instanceof Sun) as Sun;

		sunInstance.moveSunToCam(
			{
				x: sunInstance.getCanvasWidth() / 3 + 20,
				y: (sunInstance.getCanvasHeight() / 2) * (3 / 4),
				z: NaN,
			},
			10,
			3000,
		);
	}
}