export function update(currentDirection, cart, time) {
	const totalMass = 2 //Масса тележки
	const force = currentDirection * 15 //Приложенная сила в ньютонах (15 это просто удобное число, можно поиграться)
	const frictionCoefficient = 0.2 // Коэффициент трения

	const frictionForse = -frictionCoefficient * cart.cartSpeed //Сила трения
	const totalForce = force + frictionForse //Суммарная сила (+сила трения)

	//Ускорение тележки (a = F/m)
	const acceleration = totalForce / totalMass

	//Скорость и позиция тележеки
	cart.cartSpeed += acceleration * time // v = v0 + a*t
	cart.cartX += cart.cartSpeed * time // x = x0 + v*t

	//Угловое ускоение для маятника
	const angularAcceleration =
		(cart.gravity * Math.sin(cart.angle)) / cart.poleLength -
		(acceleration * Math.cos(cart.angle)) / cart.poleLength

	//Обновление угловой скорости и угла
	cart.angularSpeed += angularAcceleration * time // ω = ω0 + α*t
	cart.angle += cart.angularSpeed * time // θ = θ0 + ω*t
}
