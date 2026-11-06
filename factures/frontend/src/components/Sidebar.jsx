function Sidebar() {
    return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">D</div>
          <div>
            <h2>Dar Atlas</h2>
            <span>Administration</span>
          </div>
        </div>
  
        <div className="menu-section">
          <p className="menu-title">MENU PRINCIPAL</p>
  
          <a href="#dashboard" className="menu-link active">
            <span>▦</span> Dashboard
          </a>
  
          <a href="#invoices" className="menu-link">
            <span>▤</span> Factures
          </a>
  
          <a href="#clients" className="menu-link">
            <span>♙</span> Clients
          </a>
  
          <a href="#payments" className="menu-link">
            <span>◇</span> Paiements
          </a>
        </div>
  
        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="avatar">A</div>
            <div>
              <strong>Administrateur</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }
  
  export default Sidebar;