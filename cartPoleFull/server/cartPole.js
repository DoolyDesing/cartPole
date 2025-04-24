export class CartPole {
	constructor({ width, height }) {
		this.canvas = { width, height }
		this.cartWidth = 60
		this.cartHeight = 25
		this.poleLength = 100
		this.gravity = 9.8
		this.resetTarget()
		this.reset()
	}

	resetTarget() {
		this.targetX = Math.random() * (this.canvas.width - 40) + 20
	}

	reset() {
		this.cartX = this.canvas.width / 2
		this.cartSpeed = 0
		this.angle = 0.01
		this.angularSpeed = 0
		this.resetTarget()
	}

	getState() {
		const targetDistance = (this.targetX - this.cartX) / this.canvas.width
		return [
			this.cartX / this.canvas.width,
			this.cartSpeed / 10,
			this.angle / (Math.PI / 2),
			this.angularSpeed,
			targetDistance,
		]
	}
}
