import { useState, useEffect } from 'react'
import './ScrollHint.css'

function ScrollHint() {
  const [isScrolling, setIsScrolling] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Wenn User scrollt
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsScrolling(true)
        setIsVisible(false)
        
        // Nach dem Bounce ausblenden
        scrollTimeout = setTimeout(() => {
          setIsVisible(false)
        }, 300)
      }
      
      // Wenn zurück nach oben gescrollt wird
      if (currentScrollY < lastScrollY && currentScrollY < 10) {
        setIsVisible(true)
        setIsScrolling(false)
      }
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className={`scroll-hint ${isScrolling ? 'bouncing' : ''}`}>
      <span className="scroll-hint-text">scroll</span>
      <div className="scroll-hint-arrow">↓</div>
    </div>
  )
}

export default ScrollHint
