import { useState } from 'react'
import Controller from './components/controller/Controller.jsx'
import { GameContainer } from './components/gameContainer/GameContainer.jsx'
import styles from './styles/App.module.css'

function App() {
	//Для обновления эпизода и счета
	const [episode, setEpisode] = useState(0)
	const [score, setScore] = useState(0)
	const updateGameInfo = (newEpisode, newScore) => {
		setEpisode(newEpisode)
		setScore(newScore > score ? newScore : score)
	}

	//Для обновления скорости
	const [speed, setSpeed] = useState(0.05)
	const updateSpeed = newSpeed => {
		setSpeed(newSpeed)
	}

	return (
		<div className={styles.game}>
			<Controller
				episode={episode}
				bestScore={score}
				updateSpeed={updateSpeed}
			/>
			<GameContainer updateGameInfo={updateGameInfo} speed={speed} />
		</div>
	)
}

export default App
