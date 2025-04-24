import { useEffect, useState } from 'react'
import styles from './Controller.module.css'

export default function Controller({ episode, bestScore, updateSpeed }) {
	const [speedValue, setSpeedValue] = useState(0.05)

	const handleSpeedChange = e => {
		setSpeedValue(e.target.value)
		const newSpeed = Number(e.target.value)
		updateSpeed(newSpeed)
	}

	// Обновление состояний при изменении эпизода и счета
	useEffect(() => {
		// Нет необходимости в обновлениях состояний вручную для episode и bestScore
	}, [episode, bestScore])

	return (
		<div className={styles.controller}>
			<h2 className={styles.episode}>Эпизод: {episode}</h2>
			<h2 className={styles.bestScore}>Лучший счет: {bestScore}</h2>
			<div className={styles.speedContainer}>
				<input
					type='range'
					value={speedValue}
					id='speed'
					min='0.01'
					max='2'
					step='0.01'
					className={styles.speed}
					onChange={handleSpeedChange}
				/>
				<h2 className={styles.speedValue}>
					{parseFloat(speedValue).toFixed(2)}
				</h2>
			</div>
		</div>
	)
}
