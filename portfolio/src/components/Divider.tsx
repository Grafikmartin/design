import { useState, useEffect } from 'react'
import './Divider.css'

function Divider() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      
      // Strich wird sichtbar, wenn man anfängt zu scrollen (ab 5% der Viewport-Höhe)
      if (scrollY > viewportHeight * 0.05) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className={`divider ${isVisible ? 'visible' : ''}`} />
  )
}

export default Divider
