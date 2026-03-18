
enum Direction {
	UP,
	DOWN,
	LEFT,
	RIGHT
}

export interface ParticleInterface {
	maxAmmount: number;
	ammount: number;

	summon(): void;
	update(): void;
	draw(dt: number): void;
	destroy(): void;
}

export abstract class Particle implements ParticleInterface {
	maxAmmount: number;
	ammount: number;
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