export function calculateReward(cart, done, angleThreshold) {
	if (done) return -1
	const targetDistance = (cart.targetX - cart.cartX) / cart.canvas.width
	const targetReward = 1 - Math.abs(targetDistance)
	const anglePenalty = Math.abs(cart.angle) > angleThreshold ? -0.3 : 0
	const angleReward = 1 - Math.abs(cart.angle / angleThreshold)
	return targetReward * 2.6 + angleReward * 0.35 + anglePenalty
}
