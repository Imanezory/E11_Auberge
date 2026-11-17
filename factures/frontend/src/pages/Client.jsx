
import { useState } from "react";
import "./Client.css";

function Client() {
  const [paymentStatus, setPaymentStatus] = useState("non_payee");

  // Données de démonstration à remplacer par les données de réservation
  const client = {
    nom: "Maryam ",
    email: "mary@email.com",
    telephone: "06 12 34 56 78",
  };

  const reservation = {
    reference: "RES-2026-001",
    chambre: "Chambre Deluxe",
    arrivee: "15 Novembre 2026",
    depart: "18 Novembre 2026",
    nuits: 3,
    prixChambre: 1200,
    services: 200,
    total: 1400,
  };

  const handlePayment = () => {
    // Démonstration uniquement : à remplacer par Stripe
    alert("Le paiement en ligne sera connecté à Stripe.");
  };

  const handleDownload = () => {
    alert("Le téléchargement PDF sera disponible après le paiement confirmé.");
  };

  return (
    <div className="client-page">

      {/* Header */}
      <header className="client-header">
        <div className="brand">
          <h1>Auberge.</h1>
          <p>Votre confort, notre priorité</p>
        </div>
        <span className="secure-label">
          <i className="fa-solid fa-lock"></i> Paiement sécurisé
        </span>
      </header>

      <main className="invoice-container">

        <div className="welcome-section">
          <h2>Bonjour {client.nom} 👋</h2>
          <p>Retrouvez les informations de votre réservation et procédez au paiement de votre séjour.</p>
        </div>

        {/* Client information */}
        <section className="invoice-section">
          <h3>Informations du client</h3>
          <div className="info-grid">
            <div>
              <span>Nom complet</span>
              <strong>{client.nom}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{client.email}</strong>
            </div>
            <div>
              <span>Téléphone</span>
              <strong>{client.telephone}</strong>
            </div>
          </div>
        </section>

        {/* Reservation */}
        <section className="invoice-section">
          <div className="section-heading">
            <h3>Détails de la réservation</h3>
            <span className="reference">{reservation.reference}</span>
          </div>

          <div className="reservation-grid">
            <div>
              <span>Chambre</span>
              <strong>{reservation.chambre}</strong>
            </div>
            <div>
              <span>Date d'arrivée</span>
              <strong>{reservation.arrivee}</strong>
            </div>
            <div>
              <span>Date de départ</span>
              <strong>{reservation.depart}</strong>
            </div>
            <div>
              <span>Nombre de nuits</span>
              <strong>{reservation.nuits} nuits</strong>
            </div>
          </div>
        </section>

        {/* Invoice */}
        <section className="invoice-section">
          <h3>Récapitulatif de la facture</h3>

          <div className="price-row">
            <span>Hébergement</span>
            <strong>{reservation.prixChambre.toFixed(2)} DH</strong>
          </div>

          <div className="price-row">
            <span>Services supplémentaires</span>
            <strong>{reservation.services.toFixed(2)} DH</strong>
          </div>

          <div className="total-row">
            <span>Montant total</span>
            <strong>{reservation.total.toFixed(2)} DH</strong>
          </div>
        </section>

        {/* Payment */}
        <section className="payment-section">
          <div className="payment-title">
            <h3>Paiement en ligne</h3>
            <span>Visa · Mastercard</span>
          </div>

          {paymentStatus === "non_payee" ? (
            <>
              <p>
                Procédez au paiement sécurisé par carte bancaire pour confirmer
                le règlement de votre facture.
              </p>

              <button className="pay-button" onClick={handlePayment}>
                <i className="fa-solid fa-lock"></i>
                Payer {reservation.total.toFixed(2)} DH
              </button>
            </>
          ) : (
            <p>Votre paiement a été confirmé.</p>
          )}

          <button
            className="download-button"
            onClick={handleDownload}
            disabled={paymentStatus !== "payee"}
          >
            <i className="fa-solid fa-download"></i>
            Télécharger ma facture PDF
          </button>

          <p className="security-note">
            Vos informations de paiement sont protégées.
          </p>
        </section>

      </main>

      <footer className="client-footer">
        <p>© 2026 Auberge Agadir - Tous droits réservés</p>
      </footer>

    </div>
  );
}

export default Client;
