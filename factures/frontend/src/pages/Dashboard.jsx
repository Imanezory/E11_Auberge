const invoices = [
    {
      id: "FAC-2026-001",
      client: "Sara Amrani",
      date: "05/11/2026",
      amount: "1 250 DH",
      status: "Payée",
    },
    {
      id: "FAC-2026-002",
      client: "Youssef Karim",
      date: "05/11/2026",
      amount: "850 DH",
      status: "Non payée",
    },
    {
      id: "FAC-2026-003",
      client: "Salma Idrissi",
      date: "04/11/2026",
      amount: "2 100 DH",
      status: "Payée",
    },
    {
      id: "FAC-2026-004",
      client: "Omar Benali",
      date: "03/11/2026",
      amount: "650 DH",
      status: "En attente",
    },
  ];
  
  function Dashboard() {
    return (
      <main className="dashboard">
        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Bienvenue dans votre espace d'administration.</p>
          </div>
  
          <div className="topbar-right">
            <span className="notification">♧</span>
            <div className="topbar-avatar">A</div>
          </div>
        </header>
  
        <section className="welcome-section">
          <div>
            <span className="welcome-label">DAR ATLAS • FACTURATION</span>
            <h1>Bonjour, Administrateur !</h1>
            <p>Voici un aperçu de votre activité aujourd'hui.</p>
          </div>
          <div className="welcome-decoration">✦</div>
        </section>
  
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total des factures</span>
              <span className="stat-icon">▤</span>
            </div>
            <h2>128</h2>
            <p>Factures enregistrées</p>
          </div>
  
          <div className="stat-card">
            <div className="stat-top">
              <span>Factures payées</span>
              <span className="stat-icon green">✓</span>
            </div>
            <h2>96</h2>
            <p>Factures réglées</p>
          </div>
  
          <div className="stat-card">
            <div className="stat-top">
              <span>Non payées</span>
              <span className="stat-icon orange">◷</span>
            </div>
            <h2>32</h2>
            <p>En attente de paiement</p>
          </div>
  
          <div className="stat-card">
            <div className="stat-top">
              <span>Chiffre d'affaires</span>
              <span className="stat-icon gold">◇</span>
            </div>
            <h2>48 500 DH</h2>
            <p>Montant total encaissé</p>
          </div>
        </section>
  
        <section className="invoices-section">
          <div className="section-heading">
            <div>
              <h2>Dernières factures</h2>
              <p>Suivez les factures récemment créées.</p>
            </div>
  
            <button className="view-all">Voir toutes les factures →</button>
          </div>
  
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>N° FACTURE</th>
                  <th>CLIENT</th>
                  <th>DATE</th>
                  <th>MONTANT</th>
                  <th>STATUT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
  
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="invoice-number">{invoice.id}</td>
                    <td>{invoice.client}</td>
                    <td>{invoice.date}</td>
                    <td className="amount">{invoice.amount}</td>
                    <td>
                      <span
                        className={`status ${
                          invoice.status === "Payée"
                            ? "paid"
                            : invoice.status === "Non payée"
                            ? "unpaid"
                            : "pending"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <button className="details-button">
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    );
  }
  
  export default Dashboard;