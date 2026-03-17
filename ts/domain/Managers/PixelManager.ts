export interface Position {
	x: number;
	y: number;
}

export interface PixelManagerInterface {
	drawPixel(position: Position, color?: string): void;
	drawLine(pos: Position, pos1: Position): Promise<void>;
	drawCircle(center: Position, radius: number): void;
	filledCircle(center: Position, radius: number): void;
}

export default class PixelManager implements PixelManagerInterface {
	protected pixelSize: number = 10;

	constructor(protected ctx: CanvasRenderingContext2D) {}

	getCtx(): CanvasRenderingContext2D {
		return this.ctx;
	}

	drawPixel(position: Position, color?: string) {
		if (color) {
			this.ctx.fillStyle = color;
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
				this.drawPixel({ x, y });
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
				this.drawPixel({ x, y });
				if (error >= 0) {
					x += incX;
					error -= 2 * dy;
				}
				error += 2 * dx;
			}
		}
		// Dessiner le dernier pixel
		this.drawPixel({ x, y });
	}

	drawCircle(center: Position, radius: number) {
		let x = 0;
		let y = radius;
		let d = 3 - 2 * radius;

		const drawPixel = (x: number, y: number) => {
			this.drawPixel({ x: center.x + x, y: center.y + y });
			this.drawPixel({ x: center.x - x, y: center.y + y });
			this.drawPixel({ x: center.x + x, y: center.y - y });
			this.drawPixel({ x: center.x - x, y: center.y - y });
			this.drawPixel({ x: center.x + y, y: center.y + x });
			this.drawPixel({ x: center.x - y, y: center.y + x });
			this.drawPixel({ x: center.x + y, y: center.y - x });
			this.drawPixel({ x: center.x - y, y: center.y - x });
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
		this.drawCircle(center, radius);

		for (let y = -radius; y <= radius; y++) {
			const height = Math.sqrt(radius * radius - y * y);
			for (let x = -height; x <= height; x++) {
				this.drawPixel({
					x: Math.round(center.x + x),
					y: Math.round(center.y + y),
				});
			}
		}
	}
}

export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
