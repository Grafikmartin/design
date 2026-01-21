import './Menue.css'

function Menue() {
  const menuItems = ['about', 'portfolio', 'kontakt'];

  return (
    <nav className="menu">
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li key={index} className="menu-item">
            <span className="menu-link">{item}</span>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Menue
