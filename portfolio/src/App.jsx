import { useState, useEffect } from 'react'
import './App.css'

const colors = ['#e36255', '#ec9a86', '#a2c5c9', '#f3c262'];

function getNextColor(prevColorIndex) {
  // Wähle eine zufällige Farbe, die nicht die gleiche wie die vorherige ist
  const availableIndices = colors
    .map((_, index) => index)
    .filter(index => index !== prevColorIndex);
  
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}

function App() {
  const lines = [
    "WELCOME",
    "TO MY CORNER",
    "OF THE WEB"
  ];

  // Sammle alle Buchstaben (ohne Leerzeichen) und weise initiale Farben zu
  const allLetters = [];
  lines.forEach(line => {
    line.split('').forEach(char => {
      if (char !== ' ') {
        allLetters.push(char);
      }
    });
  });

  // Initiale Farbverteilung
  const getInitialColors = () => {
    const charColors = [];
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
  const getRandomGroupDelays = (count) => {
    const delays = new Array(count).fill(Infinity); // Initialisiere mit Infinity
    const groupPause = 5000; // Pause zwischen Gruppen (5 Sekunden)
    const withinGroupOffset = 150; // Zeitversatz innerhalb der Gruppe (150ms)
    
    // Erstelle eine Liste aller Indizes
    const availableIndices = Array.from({ length: count }, (_, i) => i);
    
    // Erstelle zufällige Gruppen
    for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
      // Wähle zufällig 3 Indizes aus den verfügbaren
      const group = [];
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

  const [charColors, setCharColors] = useState(getInitialColors);
  const [charDelays] = useState(() => getRandomGroupDelays(allLetters.length));

  // Animation: Wechsle Farben am Ende der aktiven Animationsphase (bei 50% = 3s)
  useEffect(() => {
    const animationDuration = 6000; // Gesamtdauer der Animation (inkl. Pausen)
    const animationStart = 1200; // Animation startet bei 20% = 1.2s
    const animationEnd = 3000; // Animation endet bei 50% = 3s
    const colorChangeTime = animationEnd; // Farbe wechselt am Ende der Animation (bei 50% = 3s)
    const groupPause = 5000; // Pause zwischen Gruppen
    
    // Für jeden Buchstaben einen individuellen Timer starten
    const allTimers = charDelays.map((delay, index) => {
      const timers = [];
      
      const changeColor = () => {
        setCharColors(prevColors => {
          const newColors = [...prevColors];
          const currentColorIndex = colors.indexOf(prevColors[index]);
          const newColorIndex = getNextColor(currentColorIndex);
          newColors[index] = colors[newColorIndex];
          return newColors;
        });
      };
      
      // Berechne die Zeitpunkte für Farbwechsel
      // Jeder Buchstabe hat sein eigenes Delay, das den Start seiner Animation bestimmt
      // Die Animation läuft von delay+1.2s bis delay+3s
      // Die Farbe wechselt am Ende der Animation (bei delay+3s), damit der Buchstabe danach eine neue Farbe hat
      
      // Plane Farbwechsel für mehrere Zyklen
      // Ein vollständiger Zyklus: Alle Gruppen animieren nacheinander, dann Pause
      const fullCycleDuration = numberOfGroups * groupPause + animationDuration;
      
      for (let cycle = 0; cycle < 50; cycle++) {
        // Berechne die absolute Zeit für diesen Farbwechsel (am Ende der Animation)
        const cycleStart = delay + (cycle * fullCycleDuration);
        const changeTime = cycleStart + colorChangeTime;
        
        // Die Farbe wechselt genau am Ende der Animation (bei 50% = 3s)
        const timer = setTimeout(changeColor, changeTime);
        timers.push(timer);
      }
      
      return timers;
    });

    return () => {
      allTimers.forEach(timers => {
        timers.forEach(timer => clearTimeout(timer));
      });
    };
  }, [charDelays, numberOfGroups]);

  let colorIndex = 0;

  return (
    <div className="app">
      <main className="welcome-container">
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
                    }}
                  >
                    {char}
                  </span>
                );
              })}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>
      </main>
    </div>
  )
}

export default App
