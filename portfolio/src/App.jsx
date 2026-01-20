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

  // Sammle alle Buchstaben (ohne Leerzeichen) und weise Farben zu
  const allLetters = [];
  lines.forEach(line => {
    line.split('').forEach(char => {
      if (char !== ' ') {
        allLetters.push(char);
      }
    });
  });

  // Erstelle Farbverteilung für alle Buchstaben
  const charColors = [];
  let prevColorIndex = -1;

  allLetters.forEach(() => {
    const colorIndex = getNextColor(prevColorIndex);
    charColors.push(colors[colorIndex]);
    prevColorIndex = colorIndex;
  });

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
                const color = charColors[colorIndex++];
                return (
                  <span 
                    key={charInLineIndex} 
                    className="welcome-char"
                    style={{ color }}
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
