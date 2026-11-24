
import { useState } from "react";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <a href="/" className="header-logo" onClick={closeMenus}>
          Auberge<span>.</span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`header-nav ${menuOpen ? "nav-open" : ""}`}>
          <a href="/" onClick={closeMenus}>Accueil</a>
          <a href="/chambres/" onClick={closeMenus}>Chambres</a>
          <a href="/services/" onClick={closeMenus}>Services</a>
          <a href="/#apropos" onClick={closeMenus}>À propos</a>
          <a href="/#contact" onClick={closeMenus}>Contact</a>

          <div className="account-menu">
            <button
              className="account-button"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-expanded={accountOpen}
            >
              Mon compte <span>⌄</span>
            </button>

            {accountOpen && (
              <div className="account-dropdown">
                <a href="/profil/" onClick={closeMenus}>Mon profil</a>
                <a href="/logout/" onClick={closeMenus}>Déconnexion</a>
              </div>
            )}
          </div>

        </nav>
      </div>
    </header>
  );
}

export default Header;

