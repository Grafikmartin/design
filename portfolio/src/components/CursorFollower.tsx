import { useState, useEffect } from 'react'
import './CursorFollower.css'

function CursorFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsIdle(false)
      
      // Clear existing timer
      clearTimeout(idleTimer)
      
      // Set idle after 500ms of no movement
      idleTimer = setTimeout(() => {
        setIsIdle(true)
      }, 500)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(idleTimer)
    }
  }, [])

  return (
    <div 
      className={`cursor-follower ${isIdle ? 'idle' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    />
  )
}

export default CursorFollower
