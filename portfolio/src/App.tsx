import './App.css'
import Aufmacher from './components/Aufmacher'
import Menue from './components/Menue'
import ScrollHint from './components/ScrollHint'

function App() {
  return (
    <div className="app">
      <section className="aufmacher-section">
        <div className="welcome-container">
          <Aufmacher />
        </div>
      </section>
      <section className="menu-section">
        <Menue />
      </section>
      <ScrollHint />
    </div>
  )
}

export default App

