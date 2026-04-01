import { Position } from "../Managers/PixelManager.js";
import PageAbstract from "./PageAbstract.js";

export default class home extends PageAbstract {
	pageName: string = "home";
	camPosition: Position = { x: 0, y: 0, z: 0 };
}