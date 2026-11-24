
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <h2>Auberge</h2>
      </div>

      <nav className="sidebar-menu">
        <a href="/admin-dashboard" className="menu-link">
          <span>⌂</span>
          Dashboard
        </a>

        <a href="/admin-dashboard" className="menu-link active">
          <span>▤</span>
          Factures
        </a>

        <a href="#reservations" className="menu-link">
          <span>▣</span>
          Réservations
        </a>

        <a href="#services" className="menu-link">
          <span>☰</span>
          Services
        </a>


        <a href="/admin/" className="menu-link">
          <span>⇥</span>
          Déconnexion
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
