import './App.css'
import Aufmacher from './components/Aufmacher'
import Menue from './components/Menue'
import ScrollHint from './components/ScrollHint'
import Footer from './components/Footer'
import CursorFollower from './components/CursorFollower'

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
      <Footer />
      <ScrollHint />
      <CursorFollower />
    </div>
  )
}

export default App

