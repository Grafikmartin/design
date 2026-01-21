import { useState, useEffect, useRef } from 'react'
import '../App.css'

const colors: string[] = ['#e36255', '#ec9a86', '#a2c5c9', '#f3c262'];

function getNextColor(prevColorIndex: number): number {
  // Wähle eine zufällige Farbe, die nicht die gleiche wie die vorherige ist
  const availableIndices = colors
    .map((_, index) => index)
    .filter(index => index !== prevColorIndex);
  
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}

function Aufmacher() {
  const lines: string[] = [
    "WELCOME",
    "TO MY CORNER",
    "OF THE WEB"
  ];

  // Sammle alle Buchstaben (ohne Leerzeichen) und weise initiale Farben zu
  const allLetters: string[] = [];
  lines.forEach(line => {
    line.split('').forEach(char => {
      if (char !== ' ') {
        allLetters.push(char);
      }
    });
  });

  // Initiale Farbverteilung
  const getInitialColors = (): string[] => {
    const charColors: string[] = [];
    let prevColorIndex = -1;
    allLetters.forEach(() => {
      const colorIndex = getNextColor(prevColorIndex);
      charColors.push(colors[colorIndex]);
      prevColorIndex = colorIndex;
    });
    return charColors;
  };

  // Organisiere Buchstaben in zufälligen Gruppen von 3
  const groupSize = 3;
  const numberOfGroups = Math.ceil(allLetters.length / groupSize);
  
  // Generiere zufällige Gruppen: Jede Gruppe besteht aus 3 zufällig ausgewählten Buchstaben
  const getRandomGroupDelays = (count: number): number[] => {
    const delays: number[] = new Array(count).fill(Infinity); // Initialisiere mit Infinity
    const groupPause = 10000; // Pause zwischen Gruppen (10 Sekunden)
    const withinGroupOffset = 150; // Zeitversatz innerhalb der Gruppe (150ms)
    
    // Erstelle eine Liste aller Indizes
    const availableIndices = Array.from({ length: count }, (_, i) => i);
    
    // Erstelle zufällige Gruppen
    for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
      // Wähle zufällig 3 Indizes aus den verfügbaren
      const group: number[] = [];
      for (let i = 0; i < groupSize && availableIndices.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const charIndex = availableIndices.splice(randomIndex, 1)[0];
        group.push(charIndex);
      }
      
      // Weise Delays für diese Gruppe zu
      group.forEach((charIndex, positionInGroup) => {
        const groupStartTime = groupIndex * groupPause;
        const withinGroupDelay = positionInGroup * withinGroupOffset;
        delays[charIndex] = groupStartTime + withinGroupDelay;
      });
    }
    
    return delays;
  };

  const [charColors, setCharColors] = useState<string[]>(getInitialColors);
  const [charDelays] = useState<number[]>(() => getRandomGroupDelays(allLetters.length));
  const [fallingLines, setFallingLines] = useState<Set<number>>(new Set());
  const [returningLines, setReturningLines] = useState<Set<number>>(new Set());
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Animation: Wechsle Farben beim Höchstpunkt (bei 35% = 2.1s) - beim großen Sprung
  // Synchronisiert mit CSS-Animation (6 Sekunden Zyklus)
  useEffect(() => {
    const animationCycleDuration = 6000; // Synchron mit CSS-Animation (6s infinite)
    const animationStart = 1200; // Animation startet bei 20% = 1.2s
    // Farbwechsel beginnt früher (bei 30% = 1.8s) für sanfteren Übergang
    const colorChangeOffset = 600; // Farbe wechselt bei 30% = 1.8s (früher für sanfteren Verlauf)
    
    // Für jeden Buchstaben einen individuellen Timer starten
    const allTimers = charDelays.map((delay, index) => {
      const timers: NodeJS.Timeout[] = [];
      
      // Funktion zum Farbwechsel - garantiert immer eine andere Farbe
      const changeColor = () => {
        setCharColors(prevColors => {
          const newColors = [...prevColors];
          const currentColor = prevColors[index];
          const currentColorIndex = colors.indexOf(currentColor);
          
          // Wähle IMMER eine andere Farbe - garantiert
          // Filtere die aktuelle Farbe heraus und wähle zufällig eine andere
          const availableColors = colors.filter((_, idx) => idx !== currentColorIndex);
          
          if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            newColors[index] = availableColors[randomIndex];
          } else {
            // Fallback: Wähle einfach die nächste Farbe im Array
            newColors[index] = colors[(currentColorIndex + 1) % colors.length];
          }
          
          return newColors;
        });
      };
      
      // Plane Farbwechsel synchronisiert mit CSS-Animation
      // Jeder Buchstabe animiert alle 6 Sekunden (wie die CSS-Animation)
      // Der Farbwechsel erfolgt bei jedem Animationszyklus beim Höchstpunkt
      for (let cycle = 0; cycle < 200; cycle++) {
        // Berechne die Zeit für diesen Animationszyklus
        // delay ist das initiale Delay für diesen Buchstaben
        // Jeder Zyklus dauert 6 Sekunden (wie die CSS-Animation)
        const cycleStart = delay + (cycle * animationCycleDuration);
        const changeTime = cycleStart + animationStart + colorChangeOffset;
        
        // Prüfe, ob der Farbwechsel innerhalb eines gültigen Animationszyklus liegt
        // (nur während der aktiven Phase: 20-50% = 1.2s bis 3s innerhalb jedes 6s Zyklus)
        const animationStartTime = cycleStart + animationStart;
        const animationEndTime = cycleStart + 3000; // 50% = 3s
        
        if (changeTime >= animationStartTime && changeTime <= animationEndTime) {
          const timer = setTimeout(changeColor, changeTime);
          timers.push(timer);
        }
      }
      
      return { timers };
    });

    return () => {
      allTimers.forEach(({ timers }) => {
        timers.forEach(timer => clearTimeout(timer));
      });
    };
  }, [charDelays]);

  // Scroll-Animation: Jede Zeile fällt einzeln, wenn sie den oberen Rand erreicht
  // Und kehrt zurück, wenn man nach oben scrollt
  useEffect(() => {
    const handleScroll = () => {
      lineRefs.current.forEach((lineRef, lineIndex) => {
        if (!lineRef) return;
        
        const rect = lineRef.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Wenn die Zeile den oberen Rand erreicht (oder darüber hinaus ist) - FALLEN
        if (rect.top <= 0 && !fallingLines.has(lineIndex)) {
          setFallingLines(prev => new Set([...prev, lineIndex]));
        }
        
        // Wenn die Zeile wieder sichtbar wird (beim Zurückscrollen) - ZURÜCKKEHREN
        // Nur wenn die Zeile wirklich gefallen war und jetzt wieder im Viewport ist
        if (rect.top > 0 && rect.top < viewportHeight * 0.8 && fallingLines.has(lineIndex) && !returningLines.has(lineIndex)) {
          // Zuerst "falling" entfernen und als "returning" markieren
          setFallingLines(prev => {
            const newSet = new Set(prev);
            newSet.delete(lineIndex);
            return newSet;
          });
          setReturningLines(prev => new Set([...prev, lineIndex]));
          
          // Nach der Rückwärts-Animation "returning" entfernen
          setTimeout(() => {
            setReturningLines(prev => {
              const newSet = new Set(prev);
              newSet.delete(lineIndex);
              return newSet;
            });
          }, 1500); // Dauer der Rückwärts-Animation
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fallingLines]);

  // Berechne Positionen für jeden Buchstaben - alle unter die Linie, weniger zur Seite, Überlappung erlaubt
  const getFallPositions = (): { x: number; y: number; rotation: number; zIndex: number; lineIndex: number; charIndexInLine: number }[] => {
    const positions: { x: number; y: number; rotation: number; zIndex: number; lineIndex: number; charIndexInLine: number }[] = [];
    const charWidth = 80;
    const charHeight = 100;
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 1200;
    
    // Sammle alle Buchstaben
    const allChars: { lineIndex: number; charIndexInLine: number; globalIndex: number }[] = [];
    let globalCharIndex = 0;
    
    lines.forEach((line, lineIndex) => {
      line.split('').forEach((char, charIndexInLine) => {
        if (char !== ' ') {
          allChars.push({ lineIndex, charIndexInLine, globalIndex: globalCharIndex });
          globalCharIndex++;
        }
      });
    });
    
    // Reduzierter Bereich für X-Positionen (weniger zur Seite) - Überlappung erlaubt
    const xRange = containerWidth * 0.3; // Nur 30% der Container-Breite (weniger zur Seite)
    const startX = -xRange / 2;
    
    // Einfache Positionierung: Alle Buchstaben bekommen zufällige Positionen, Überlappung erlaubt
    allChars.forEach((charInfo) => {
      // Zufällige X-Position im reduzierten Bereich
      const x = startX + Math.random() * xRange;
      
      // ALLE fallen auf 120% ihrer eigenen Größe unter die Linie
      // Y wird in CSS mit 1.2em berechnet (120% der Schriftgröße)
      const y = 0; // Wird in CSS mit 1.2em berechnet
      
      // Zufällige Rotation (weniger schräg)
      const rotation = (Math.random() - 0.5) * 40; // -20 bis +20 Grad
      
      // Gleicher z-index für alle (niedrig, damit sie von der Maske verdeckt werden)
      const zIndex = 1; // Alle haben z-index 1, Maske hat 1000
      
      positions.push({
        x: x,
        y: y,
        rotation: rotation,
        zIndex: zIndex,
        lineIndex: charInfo.lineIndex,
        charIndexInLine: charInfo.charIndexInLine
      });
    });
    
    return positions;
  };

  const [fallPositions] = useState<{ x: number; y: number; rotation: number; zIndex: number; lineIndex: number; charIndexInLine: number }[]>(() => getFallPositions());

  let colorIndex = 0;

  return (
    <>
      <h1 className="welcome-text">
        {lines.map((line, lineIndex) => {
          let charIndexInLine = 0;
          const isLineFalling = fallingLines.has(lineIndex);
          const isLineReturning = returningLines.has(lineIndex);
          return (
            <span 
              key={lineIndex} 
              ref={(el) => { lineRefs.current[lineIndex] = el; }}
              className={`welcome-line ${isLineFalling ? 'line-falling' : ''}`}
            >
              {line.split('').map((char, charInLineIndex) => {
                if (char === ' ') {
                  return <span key={charInLineIndex} className="space"> </span>;
                }
                const color = charColors[colorIndex];
                const delay = charDelays[colorIndex];
                const fallPos = fallPositions[colorIndex];
                const charDelay = isLineFalling ? charIndexInLine * 100 : 0; // Gestaffeltes Fallen innerhalb der Zeile
                colorIndex++;
                charIndexInLine++;
                return (
                  <span 
                    key={charInLineIndex} 
                    className={`welcome-char ${isLineFalling ? 'char-falling' : isLineReturning ? 'char-returning' : ''}`}
                    style={{ 
                      '--animation-delay': `${delay}ms`,
                      '--char-color': color,
                      '--fall-x': `${fallPos.x}px`,
                      '--fall-rotation': `${fallPos.rotation}deg`,
                      '--fall-delay': `${charDelay}ms`,
                      '--fall-z-index': fallPos.zIndex
                    } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          );
        })}
      </h1>
      <div className="aufmacher-divider"></div>
      <div className="aufmacher-mask"></div>
    </>
  )
}

export default Aufmacher
