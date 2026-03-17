
enum Direction {
	UP,
	DOWN,
	LEFT,
	RIGHT
}

export abstract class Particle {
	private maxAmmount: number;
	private ammount: number;
	private particles: Particle[];
	private speed: number;
	private direction: Direction;
	private size: number;
	private color: string;

	constructor() {
		this.maxAmmount = 0;
		this.ammount = 0;
		this.particles = [];
		this.speed = 0;
		this.direction = Direction.UP;
		this.size = 0;
		this.color = '';
	}

	abstract summon(): void;
	abstract update(): void;
	abstract draw(dt: number): void;
	abstract destroy(): void;
}