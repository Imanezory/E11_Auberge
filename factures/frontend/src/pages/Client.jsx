
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Client.css";

function Client() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchClientData = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/factures/espace-client/", {
        method: "GET",
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.detail ||
          "Impossible de récupérer vos informations."
        );
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleDownload = async () => {
    if (!data?.facture?.id || data.facture.statut !== "payee") {
      return;
    }

    try {
      const response = await fetch(
        `/api/factures/${data.facture.id}/pdf/`,
        { credentials: "same-origin" }
      );

      if (!response.ok) {
        throw new Error("Impossible de télécharger la facture.");
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = `facture_${data.facture.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toFixed(2);

  if (loading) {
    return (
      <div className="invoice-container">
        <p>Chargement de votre facture...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="invoice-container">
        <h2>Espace Client</h2>
        <p className="payment-error">{error}</p>
        <button className="pay-button" onClick={fetchClientData}>
          Réessayer
        </button>
      </div>
    );
  }

  const { client, reservation, facture } = data;

  return (
    <div className="client-page">
      <div className="invoice-container">

        <section className="welcome-section">
          <span className="welcome-small">ESPACE CLIENT</span>
          <h2>Bonjour {client.prenom || client.nom} 👋</h2>
          <p>
            Retrouvez ici les informations de votre réservation
            et le récapitulatif de votre facture.
          </p>
        </section>

        <section className="invoice-section">
          <h3>Informations du client</h3>

          <div className="info-grid">
            <div>
              <span>Nom complet</span>
              <strong>{client.prenom} {client.nom}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{client.email}</strong>
            </div>

            <div>
              <span>Téléphone</span>
              <strong>{client.telephone || "Non renseigné"}</strong>
            </div>
          </div>
        </section>

        <section className="invoice-section">
          <div className="section-heading">
            <h3>Détails de la réservation</h3>
            <span className="reference">
              Réservation N° {reservation.reference || reservation.id}
            </span>
          </div>

          <div className="reservation-grid">
            <div>
              <span>Date d'arrivée</span>
              <strong>
                {reservation.date_arrivee || reservation.dateArrivee || "Non renseignée"}
              </strong>
            </div>

            <div>
              <span>Date de départ</span>
              <strong>
                {reservation.date_depart || reservation.dateDepart || "Non renseignée"}
              </strong>
            </div>

            <div>
              <span>Nombre de personnes</span>
              <strong>{reservation.nbrPersonnes || "Non renseigné"}</strong>
            </div>
          </div>
        </section>

        <section className="invoice-section">
          <h3>Récapitulatif de la facture</h3>

          <div className="price-row">
            <span>Hébergement</span>
            <strong>{formatAmount(facture.montant_chambres)} DH</strong>
          </div>

          <div className="price-row">
            <span>Services supplémentaires</span>
            <strong>{formatAmount(facture.montant_services)} DH</strong>
          </div>

          <div className="total-row">
            <span>Montant total</span>
            <strong>{formatAmount(facture.montant_total)} DH</strong>
          </div>

          <div className="status-row">
            <span>Statut de la facture</span>
            <strong className={facture.statut === "payee" ? "status-paid" : "status-unpaid"}>
              {facture.statut === "payee" ? "Payée" : "Non payée"}
            </strong>
          </div>
        </section>

        <section className="payment-section">
          <h3>Paiement et téléchargement</h3>

          {facture.statut !== "payee" ? (
            <>
              <p>
                Veuillez effectuer le paiement pour pouvoir télécharger
                votre facture PDF.
              </p>

              <button
                className="pay-button"
                onClick={() => navigate(`/payment/${facture.id}`)}
              >
                Payer maintenant
              </button>
            </>
          ) : (
            <p className="payment-success">
              Votre paiement a été confirmé avec succès.
            </p>
          )}

          <button
            className="download-button"
            onClick={handleDownload}
            disabled={facture.statut !== "payee"}
          >
            Télécharger ma facture PDF
          </button>

          {error && <p className="payment-error">{error}</p>}

          <p className="security-note">
            Le téléchargement PDF est disponible après confirmation du paiement.
          </p>
        </section>

      </div>
    </div>
  );
}

export default Client;
