export function update(currentDirection, cart, time) {
	const totalMass = 2
	const force = currentDirection * 15
	const frictionCoefficient = 0.2
	const frictionForce = -frictionCoefficient * cart.cartSpeed
	const acceleration = (force + frictionForce) / totalMass

	cart.cartSpeed += acceleration * time
	cart.cartX += cart.cartSpeed * time

	const angularAcceleration =
		(cart.gravity * Math.sin(cart.angle)) / cart.poleLength -
		(acceleration * Math.cos(cart.angle)) / cart.poleLength
	cart.angularSpeed += angularAcceleration * time
	cart.angle += cart.angularSpeed * time
}
