import React, { useEffect, useRef } from 'react'
import runGameLogic from '../../scripts'
import styles from './GameContainer.module.css'

export function GameContainer({ updateGameInfo, speed }) {
	const canvasRef = useRef(null)
	const speedRef = useRef(speed)

	useEffect(() => {
		speedRef.current = speed
	}, [speed])

	useEffect(() => {
		const canvas = canvasRef.current
		if (canvas) {
			runGameLogic(canvas, updateGameInfo, speedRef)
		}
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight - 100
	}, [])
	return (
		<div className={styles.gameContainer}>
			<canvas ref={canvasRef}></canvas>
		</div>
	)
}
