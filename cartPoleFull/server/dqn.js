import * as tf from '@tensorflow/tfjs'

export class DQN {
	constructor(inputSize, outputSize) {
		this.inputSize = inputSize
		this.outputSize = outputSize
		this.gamma = 0.95
		this.epsilon = 1.0
		this.epsilonMin = 0.2
		this.epsilonDecay = 0.995
		this.batchSize = 64
		this.memory = []
		this.memoryCapacity = 200000

		this.model = this.createModel()
		this.targetModel = this.createModel()
		this.updateTargetModel()
		this.isTraining = false
	}

	updateTargetModel() {
		this.targetModel.setWeights(this.model.getWeights())
		console.log('Target network updated')
	}

	createModel() {
		const model = tf.sequential()
		model.add(
			tf.layers.dense({
				units: 128,
				activation: 'elu',
				inputShape: [this.inputSize],
			})
		)
		model.add(tf.layers.dense({ units: 128, activation: 'elu' }))
		model.add(tf.layers.dense({ units: 64, activation: 'elu' }))
		model.add(tf.layers.dense({ units: this.outputSize, activation: 'linear' }))
		model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' })
		return model
	}

	act(state) {
		if (Math.random() < this.epsilon) {
			return Math.random() < 0.5 ? 0 : 1
		}
		return tf.tidy(() => {
			const tensorState = tf.tensor2d([state])
			const prediction = this.model.predict(tensorState)
			return prediction.argMax(1).dataSync()[0]
		})
	}

	remember(state, action, reward, nextState, done) {
		this.memory.push([state, action, reward, nextState, done])
		if (this.memory.length > this.memoryCapacity) this.memory.shift()
	}

	async train() {
		if (this.isTraining || this.memory.length < this.batchSize) return
		this.isTraining = true
		try {
			const batch = []
			for (let i = 0; i < this.batchSize; i++) {
				batch.push(this.memory[Math.floor(Math.random() * this.memory.length)])
			}
			const states = batch.map(x => x[0])
			const nextStates = batch.map(x => x[3])
			const tensorStates = tf.tensor2d(states, [states.length, 5])
			const tensorNext = tf.tensor2d(nextStates, [nextStates.length, 5])

			const currentQs = await this.model.predict(tensorStates).array()
			const nextQs = await this.targetModel.predict(tensorNext).array()

			const X = [],
				Y = []
			batch.forEach(([state, action, reward, _ns, done], i) => {
				let target = reward
				if (!done) target += this.gamma * Math.max(...nextQs[i])
				const q = currentQs[i]
				q[action] = target
				X.push(state)
				Y.push(q)
			})

			await this.model.fit(
				tf.tensor2d(X, [X.length, 5]),
				tf.tensor2d(Y, [Y.length, 2]),
				{ batchSize: this.batchSize, epochs: 1, verbose: 0 }
			)
		} catch (e) {
			console.error(e)
		} finally {
			this.isTraining = false
			if (this.epsilon > this.epsilonMin) this.epsilon *= this.epsilonDecay
		}
	}
}
