export class DQN {
	constructor(inputSize, outputSize) {
		this.inputSize = inputSize //Кол-во входных параметров
		this.outputSize = outputSize //Кол-во выходных параметров
		this.gamma = 0.95 //Коэфицент "забывания" будущих наград
		this.epsilon = 1.0 //Вероятность случайного действия (начальное значение)
		this.epsilonMin = 0.2 // Минимальное значение случайности
		this.epsilonDecay = 0.995 // Скорость уменьшения случайности
		this.batchSize = 64 //Кол-вопримреов до обучения или сколько примеров учим за раз
		this.memory = [] //Память агента
		this.memoryCapacity = 200000

		this.model = this.createModel() //Основная нейросеть
		this.targetModel = this.createModel() //Вспомогательная нейросеть (Целевая)
		this.isTraining = false //Флаг для отслеживания идет ли обучени
		this.updateTargetModel() //Копируем веса из основной нейрсоети в целевую
	}

	updateTargetModel() {
		this.targetModel.setWeights(this.model.getWeights())
		console.log('Целевая сеть обновлена')
	}
	createModel() {
		const model = tf.sequential() //Определяет тип нейросети (Здесь простейший)

		//Первый слов (24 нейрона)
		model.add(
			tf.layers.dense({
				//Dense - Полносвязный слой (каждый нейрон связан со всеми входами)
				units: 128, //24 нейрона
				inputShape: [this.inputSize], //Этот параметор указывает, что входной слой принимает данные размерности this.inputSize = 4 (4 состояния: позиция тележки, скорость тележки, угол палки и угловая скорость палки)
				activation: 'elu', //Функция активации (Если входное число отрицательное, обнуляем его)
			})
		)

		//Второй слой (24 нейрона)
		model.add(
			tf.layers.dense({
				units: 128,
				activation: 'elu',
			})
		)

		// Третий слой (64 нейрона)
		model.add(
			tf.layers.dense({
				units: 64,
				activation: 'elu',
			})
		)

		model.add(
			tf.layers.dense({
				units: this.outputSize,
				activation: 'linear', //Без активации, чтобы получать любые числа
			})
		)

		//Настройка обучения
		model.compile({
			optimizer: tf.train.adam(0.001), //"Умный" алгоритм обучения
			loss: 'meanSquaredError', //Как считать ошибки
		})
		return model
	}

	act(state) {
		//Случайное действие (Чтобы исследовать среду)
		if (Math.random() < this.epsilon) {
			return Math.random() < 0.5 ? 0 : 1
		} //Т. к. изначально epsilon = 1 => первые действия будут случайными

		return tf.tidy(() => {
			//Всё, что создаётся внутри tf.tidy(), будет автоматически удалено после завершения функции.
			const tensorState = tf.tensor2d([state]) // Переводим состояние в тензор
			const prediction = this.model.predict(tensorState) //Предсказываем Q-значение
			return prediction.argMax(1).dataSync()[0] //Выбор действия с max Q-значением. Ось 1 означает, что мы ищем максимум по столбцам. Преобразует тензор в обычный массив js.
		})
	}

	//Запоминание опыта
	remember(state, action, reward, nextState, done) {
		// state: Текущее состояние (например, тележка слева)
		// action: Что сделали (влево)
		// reward: Награда (например, +0.1)
		// nextState: Новое состояние (тележка чуть левее)
		// done: Эпизод завершён? (если тележка упала)
		this.memory.push([state, action, reward, nextState, done])
		if (this.memory.length > this.memoryCapacity) {
			this.memory.shift() //Если память переполнена удаляем старые данные
		}
	}

	//Обучение
	async train() {
		if (this.isTraining) return // Если обучение уже идёт, пропускаем вызов
		if (this.memory.length < this.batchSize) return

		this.isTraining = true // Устанавливаем флаг

		try {
			// Случайная выборка из памяти
			const batch = []
			for (let i = 0; i < this.batchSize; i++) {
				const idx = Math.floor(Math.random() * this.memory.length)
				batch.push(this.memory[idx])
			}

			// Подготовка данных
			const states = batch.map(item => item[0])
			const nextStates = batch.map(item => item[3])

			// Явно задаём форму тензоров
			const tensorStates = tf.tensor2d(states, [states.length, 5])
			const tensorNextStates = tf.tensor2d(nextStates, [nextStates.length, 5])

			// Предсказание Q-значений
			const currentQs = await this.model.predict(tensorStates).array()
			const nextQs = await this.targetModel.predict(tensorNextStates).array()

			// Обновляем Q-значения с учётом наград
			const X = []
			const Y = []
			batch.forEach(([state, action, reward, nextState, done], idx) => {
				let target = reward
				if (!done) {
					target += this.gamma * Math.max(...nextQs[idx])
				}
				const currentQ = currentQs[idx]
				currentQ[action] = target
				X.push(state)
				Y.push(currentQ)
			})

			// Обучаем модель на новых данных
			await this.model.fit(
				tf.tensor2d(X, [X.length, 5]),
				tf.tensor2d(Y, [Y.length, 2]),
				{
					batchSize: this.batchSize,
					epochs: 1,
					verbose: 0,
				}
			)
		} catch (error) {
			console.error('Error during training:', error)
		} finally {
			this.isTraining = false // Сбрасываем флаг после завершения обучения
		}

		// Уменьшаем случайность (становимся увереннее)
		if (this.epsilon > this.epsilonMin) {
			this.epsilon *= this.epsilonDecay
		}
	}

	//Сохранение и загрузка модели
	// async saveModel() {
	// 	await this.model.save('downloads://cartpole-model') // Скачивание в браузере
	// }

	// async loadModel() {
	// 	this.model = await tf.loadLayersModel('cartpole-model/model.json')
	// 	this.updateTargetModel()
	// }
}
