import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { CartPole } from './cartPole.js'
import { DQN } from './dqn.js'
import { calculateReward } from './reward.js'
import { update as applyPhysics } from './update.js'

const app = express()
app.use(express.static('../client/dist'))

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', socket => {
	console.log('New client:', socket.id)

	// Инициализация среды и агента
	const cart = new CartPole({ width: 800, height: 600 })
	const dqn = new DQN(5, 2)
	let episode = 0,
		score = 0,
		bestScore = 0,
		speed = 0.05
	const angleThreshold = 30 * (Math.PI / 180)

	socket.on('setSpeed', newSpeed => {
		speed = newSpeed
	})

	async function gameLoop() {
		const state = cart.getState()
		const action = dqn.act(state)
		const dir = action === 0 ? -1 : 1

		applyPhysics(dir, cart, speed)
		if (Math.abs(cart.cartX - cart.targetX) < 5) cart.resetTarget()

		const nextState = cart.getState()
		const done =
			cart.cartX < 20 ||
			cart.cartX > cart.canvas.width - 20 ||
			Math.abs(cart.angle) > angleThreshold
		const reward = calculateReward(cart, done, angleThreshold)

		dqn.remember(state, action, reward, nextState, done)
		await dqn.train()
		if (done && episode % 10 === 0) dqn.updateTargetModel()

		if (done) {
			bestScore = Math.max(bestScore, score)
			socket.emit('updateGameInfo', { episode, bestScore })
			cart.reset()
			episode += 1
			score = 0
		} else {
			score += 1
		}

		socket.emit('gameState', {
			cartX: cart.cartX,
			cartSpeed: cart.cartSpeed,
			angle: cart.angle,
			angularSpeed: cart.angularSpeed,
			targetX: cart.targetX,
			cartWidth: cart.cartWidth,
			cartHeight: cart.cartHeight,
			poleLength: cart.poleLength,
			canvasWidth: cart.canvas.width,
			canvasHeight: cart.canvas.height,
		})

		setImmediate(gameLoop)
	}

	gameLoop()
})

server.listen(3000, () => {
	console.log('Server listening on http://localhost:3000')
})
