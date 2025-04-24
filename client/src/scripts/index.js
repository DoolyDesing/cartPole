import { CartPole } from './cartPole/cartPole.js'
import { DQN } from './dqn/dqn.js'
import { calculateReward } from './dqn/reward.js'
import { draw } from './draw.js'
import { update } from './update.js'

export default function runGameLogic(canvas, updateGameInfo, speedRef) {
	const ctx = canvas.getContext('2d')
	let score = 0

	// Создаём экземпляры CartPole и DQN
	const cart = new CartPole(canvas)
	const dqn = new DQN(5, 2)

	let isTraining = true
	let episode = 0

	// Порог угла для определения падения маятника
	const angleThreshold = 30 * (Math.PI / 180) // конвертируем 30 градусов в радианы

	// Функция игрового цикла
	function gameLoop() {
		const state = cart.getState() // Получаем текущее состояние из CartPole
		const action = dqn.act(state) // Используем DQN для выбора действия (0 или 1)

		// Двигаем тележку в зависимости от выбранного действия (влево или вправо)
		const currentDirection = action == 0 ? -1 : 1

		// Обновляем скорость и время в зависимости от статуса обучения
		const time = speedRef.current
		// console.log(time)

		// const time = 0.05

		// Проверяем, достигла ли тележка цели, если да — сбрасываем цель
		if (Math.abs(cart.cartX - cart.targetX) < 5) {
			cart.resetTarget()
		}

		// Вызываем функцию обновления для применения текущего действия
		update(currentDirection, cart, time)

		// Отображаем текущие состояния среды
		draw(canvas, ctx, cart)

		// Получаем следующее состояние после обновления
		const nextState = cart.getState()

		// Проверяем, завершена ли игра
		const done =
			cart.cartX < 20 ||
			cart.cartX > canvas.width - 20 ||
			Math.abs(cart.angle) > angleThreshold

		// Рассчитываем награду на основе текущего состояния и завершения эпизода
		const reward = calculateReward(cart, done, angleThreshold, canvas)

		if (isTraining) {
			// Запоминаем текущее состояние, действие и награду для обучения DQN
			dqn.remember(state, action, reward, nextState, done)
			dqn.train() // Обучаем DQN

			// Периодически обновляем целевую модель
			if (done && episode % 10 == 0) {
				dqn.updateTargetModel()
			}
		}

		// Если эпизод завершён, сбрасываем тележку и увеличиваем счётчик эпизодов
		if (done) {
			console.log(time)

			updateGameInfo(episode, score)
			cart.reset()

			episode++
			// console.log(`Эпизод: ${episode}, Счёт: ${score}, Эпсилон: ${dqn.epsilon}`)
			score = 0
		} else {
			score += 1
		}

		// Продолжаем игровой цикл
		requestAnimationFrame(gameLoop)
	}

	gameLoop()
}
