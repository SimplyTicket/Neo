import CameraManager from "./CameraManager.js";

export interface Position {
	x: number;
	y: number;
	z: number;
}

export interface rgba {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export interface PixelManagerInterface {
	drawPixel(position: Position, color?: string): void;
	drawLine(pos: Position, pos1: Position): Promise<void>;
	drawCircle(center: Position, radius: number): void;
	filledCircle(center: Position, radius: number): void;
}

export default abstract class PixelManager implements PixelManagerInterface {
	static instances: PixelManager[] = [];

	protected pixelSize: number = 7;

	constructor(
		protected ctx: CanvasRenderingContext2D,
		protected canvas: HTMLCanvasElement,
	) {
		PixelManager.instances.push(this);
	}

	getCanvasHeight(): number {
		return Math.trunc(this.canvas.height / this.pixelSize);
	}

	getCanvasWidth(): number {
		return Math.trunc(this.canvas.width / this.pixelSize);
	}

	resize() {
		// const dpr = window.devicePixelRatio || 1;
		const dpr = 1;

		const width = window.innerWidth;
		const height = window.innerHeight;

		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";

		this.canvas.width = Math.floor(width * dpr);
		this.canvas.height = Math.floor(height * dpr);

		this.ctx.imageSmoothingEnabled = false;
	}

	getCtx(): CanvasRenderingContext2D {
		return this.ctx;
	}

	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	drawPixel(position: Position, color?: string | rgba) {
		if (color) {
			if (typeof color == "object") {
				this.ctx.fillStyle = this.getRgbString(color);
			}
			if (typeof color == "string") {
				this.ctx.fillStyle = color;
			}
		}
		this.ctx.fillRect(
			this.pixelSize * position.x,
			this.pixelSize * position.y,
			this.pixelSize,
			this.pixelSize,
		);
	}

	async drawLine(pos: Position, pos1: Position) {
		const dx = Math.abs(pos1.x - pos.x);
		const dy = Math.abs(pos1.y - pos.y);

		const incX = Math.sign(pos1.x - pos.x);
		const incY = Math.sign(pos1.y - pos.y);

		let x = pos.x;
		let y = pos.y;
		let error;

		// Choisir l'axe principal en fonction de la pente
		if (dx > dy) {
			// Cas où |dx| > |dy| : on incrémente x et on ajuste y
			error = 2 * dy - dx;
			for (; x !== pos1.x; x += incX) {
				this.drawPixel({ x, y, z: 0 });
				if (error >= 0) {
					y += incY;
					error -= 2 * dx;
				}
				error += 2 * dy;
			}
		} else {
			// Cas où |dy| > |dx| : on incrémente y et on ajuste x
			error = 2 * dx - dy;
			for (; y !== pos1.y; y += incY) {
				this.drawPixel({ x, y, z: 0 });
				if (error >= 0) {
					x += incX;
					error -= 2 * dy;
				}
				error += 2 * dx;
			}
		}
		// Dessiner le dernier pixel
		this.drawPixel({ x, y, z: 0 });
	}

	drawCircle(center: Position, radius: number) {
		let x = 0;
		let y = radius;
		let d = 3 - 2 * radius;

		const drawPixel = (x: number, y: number) => {
			this.drawPixel({ x: center.x + x, y: center.y + y, z: 0 });
			this.drawPixel({ x: center.x - x, y: center.y + y, z: 0 });
			this.drawPixel({ x: center.x + x, y: center.y - y, z: 0 });
			this.drawPixel({ x: center.x - x, y: center.y - y, z: 0 });
			this.drawPixel({ x: center.x + y, y: center.y + x, z: 0 });
			this.drawPixel({ x: center.x - y, y: center.y + x, z: 0 });
			this.drawPixel({ x: center.x + y, y: center.y - x, z: 0 });
			this.drawPixel({ x: center.x - y, y: center.y - x, z: 0 });
		};

		drawPixel(x, y);

		while (x <= y) {
			x++;
			if (d < 0) {
				d = d + 4 * x + 6;
			} else {
				y--;
				d = d + 4 * (x - y) + 10;
			}
			drawPixel(x, y);
		}
	}

	filledCircle(center: Position, radius: number) {
		let x = 0;
		let y = radius;
		let d = 3 - 2 * radius;

		const drawHLine = (x1: number, x2: number, row: number) => {
			for (let i = x1; i <= x2; i++) {
				this.drawPixel({ x: i, y: row, z: 0 });
			}
		};

		while (x <= y) {
			drawHLine(center.x - x, center.x + x, center.y + y);
			drawHLine(center.x - x, center.x + x, center.y - y);
			drawHLine(center.x - y, center.x + y, center.y + x);
			drawHLine(center.x - y, center.x + y, center.y - x);

			x++;
			if (d < 0) {
				d = d + 4 * x + 6;
			} else {
				y--;
				d = d + 4 * (x - y) + 10;
			}
		}
	}

	static getPositionFromRealPosition(position: {
		x: number;
		y: number;
	}): Position {
		return {
			x: Math.round(position.x / this.instances[0].pixelSize),
			y: Math.round(position.y / this.instances[0].pixelSize),
			z: 0,
		};
	}

	getRgbString(color: rgba): string {
		const finalColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;

		return finalColor;
	}
}

export abstract class Drawable extends PixelManager {
	protected position: Position;
	protected size: number;
	private depth: number = 1;
	private cam: CameraManager | null = CameraManager.getInstance();

	constructor(
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		size: number,
		position: Position,
	) {
		super(ctx, canvas);
		this.size = size;
		this.position = position;
	}

	disableCameraEffect() {
		this.cam = null;
	}

	updatePosition(position: Position) {
		// this.position = position;

		this.depth = this.cam ? this.cam.getDepthEffect(this) : 1;

		this.position = {
			x: position.x,
			y: position.y,
			z: position.z !== undefined ? position.z : this.position.z,
		};
	}

	getRgbString(color: rgba): string {
		let finalColor;
		// add darken factor to deeper object

		const r = color.r * this.depth;
		const g = color.g * this.depth;
		const b = color.b * this.depth;
		const a = color.a;

		finalColor = `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;

		return finalColor;
	}

	updateSize(size: number) {
		this.size = size;
	}

	getPosition(): Position {
		return this.position;
	}

	getSize(): number {
		return this.size;
	}

	abstract draw(dt: number): void;
}

export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
