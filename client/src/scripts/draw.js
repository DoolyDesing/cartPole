export function draw(canvas, ctx, cart) {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	//Дорога
	ctx.fillStyle = '#444'
	ctx.fillRect(0, canvas.height - 40, canvas.width, 4)

	//Вогонетка
	ctx.fillStyle = 'blue'
	ctx.fillRect(
		cart.cartX - cart.cartWidth / 2, // X-координата левого края
		canvas.height - 60 - cart.cartHeight, // Y-координата верхнего края
		cart.cartWidth,
		cart.cartHeight
	)

	//Маятник
	ctx.strokeStyle = 'red'
	ctx.lineWidth = 4
	ctx.beginPath()
	const endX = cart.cartX + Math.sin(cart.angle) * cart.poleLength
	const endY =
		canvas.height -
		60 -
		cart.cartHeight -
		Math.cos(cart.angle) * cart.poleLength
	ctx.moveTo(cart.cartX, canvas.height - 60 - cart.cartHeight)
	ctx.lineTo(endX, endY)
	ctx.stroke()

	//Цель
	ctx.fillStyle = 'green'
	ctx.fillRect(cart.targetX, 0, 5, canvas.height)
}
