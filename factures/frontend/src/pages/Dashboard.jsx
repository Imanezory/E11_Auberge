
import { useState } from "react";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [search, setSearch] = useState("");

  // Les factures seront récupérées depuis l'API.
  // Pour le moment, aucune donnée fictive.
  const invoices = [];

  const filteredInvoices = invoices.filter((invoice) =>
    `${invoice.id} ${invoice.client}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard invoice-dashboard">
        <header className="topbar">
          <div>
            <h2>Liste des Factures</h2>
            <p>Gérez et suivez toutes les factures</p>
          </div>

          <div className="topbar-right">
            <span className="notification">♧</span>
            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <section className="invoice-search">
          <div className="search-input">
            <input
              type="text"
              placeholder="Rechercher par N° facture ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span>⌕</span>
          </div>

          <button className="search-button">
            ⌕ &nbsp; Rechercher
          </button>
        </section>

        <section className="invoice-list">
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
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="invoice-number">{invoice.id}</td>
                      <td>{invoice.client}</td>
                      <td>{invoice.date}</td>
                      <td className="amount">{invoice.amount}</td>
                      <td>
                        <span className={`status ${invoice.statusClass}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <button className="details-button">
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      <div className="empty-state">
                        <span className="empty-icon">▤</span>
                        <strong>
                          {search
                            ? "Aucune facture trouvée"
                            : "Aucune facture disponible"}
                        </strong>
                        <p>
                          {search
                            ? "Essayez avec un autre numéro ou nom de client."
                            : "Les factures apparaîtront ici après leur création."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="invoice-footer">
          Affichage de {filteredInvoices.length} facture(s)
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
