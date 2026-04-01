interface EasingStrategy {
	ease(t: number): number;
}

export default class AnimationManager {

	constructor(public maxFrameRate: number = 60) {}

	async animate(
		duration: number,
		easing: EasingStrategy,
		callback: (t: number) => void,
	): Promise<void> {
		const start = performance.now();

		return new Promise((resolve) => {
			let lastFrameTime = 0;
			const step = (now: number) => {
				if (now - lastFrameTime < 1000 / this.maxFrameRate) {
					requestAnimationFrame(step);
					return;
				}
				lastFrameTime = now;

				let t = (now - start) / duration;
				t = Math.min(t, 1);

				const eased = easing.ease(t);
				callback(eased);

				if (t < 1) requestAnimationFrame(step);
				else resolve();
			};

			requestAnimationFrame(step);
		});
	}

	static lerp(start: number, end: number, t: number): number {
		return start + (end - start) * t;
	}
}

export class LinearEasing implements EasingStrategy {
	ease(t: number): number {
		return t;
	}
}

export class EaseInOutEasing implements EasingStrategy {
	ease(t: number): number {
		return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
	}
}
