import { useState, useEffect } from 'react'
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

  let colorIndex = 0;

  return (
    <>
      <h1 className="welcome-text">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="welcome-line">
            {line.split('').map((char, charInLineIndex) => {
              if (char === ' ') {
                return <span key={charInLineIndex} className="space"> </span>;
              }
              const color = charColors[colorIndex];
              const delay = charDelays[colorIndex]; // Zufälliges Delay
              colorIndex++;
              return (
                <span 
                  key={charInLineIndex} 
                  className="welcome-char"
                  style={{ 
                    '--animation-delay': `${delay}ms`,
                    '--char-color': color
                  } as React.CSSProperties}
                >
                  {char}
                </span>
              );
            })}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        ))}
      </h1>
      <div className="aufmacher-divider"></div>
    </>
  )
}

export default Aufmacher
