import CameraManager from "../Managers/CameraManager.js";
import { Position } from "../Managers/PixelManager.js";
import { Sun } from "../sun.js";
import PageAbstract from "./PageAbstract.js";

export default class ReleaseNotes extends PageAbstract {
	pageName: string = "ReleaseNotes";
	camPosition: Position = { x: 0, y: 0, z: 0 };

	beforeSwitch(): Promise<void> {

		const sunInstance = CameraManager.getInstance().getAllElements().find((element) => element instanceof Sun) as Sun;
		sunInstance.moveSunToCam(
			{
				x: 20,
				y: (sunInstance.getCanvasHeight() / 2) * (3 / 4),
				z: NaN,
			},
			30,
			3000,
		);

		return Promise.resolve();
	}
}