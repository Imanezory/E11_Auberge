
import { useState, useEffect, useCallback } from "react";
import "./Client.css";
import { useNavigate } from "react-router-dom";

function Client() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Récupérer le token CSRF
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }

    return null;
  };

  // Charger les informations du client et sa facture
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

  // Effectuer un paiement simulé
  const handlePayment = async () => {
    if (!data?.facture?.id) return;

    setPaymentLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/factures/${data.facture.id}/payer/`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.detail ||
          "Le paiement a échoué."
        );
      }

      // Actualiser le statut de la facture
      setData((previousData) => ({
        ...previousData,
        facture: {
          ...previousData.facture,
          statut: result.statut,
          date_paiement: result.date_paiement,
        },
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Télécharger la facture PDF
  const handleDownload = async () => {
    if (!data?.facture?.id || data.facture.statut !== "payee") {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/factures/${data.facture.id}/pdf/`,
        {
          method: "GET",
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        let message = "Impossible de télécharger la facture.";

        try {
          const result = await response.json();
          message = result.error || result.detail || message;
        } catch {
          // Réponse non JSON
        }

        throw new Error(message);
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

  // Affichage pendant le chargement
  if (loading) {
    return (
      <main className="invoice-container">
        <p>Chargement de vos informations...</p>
      </main>
    );
  }

  // Affichage en cas d'erreur
  if (!data) {
    return (
      <main className="invoice-container">
        <h2>Espace Client</h2>

        <p className="payment-error">
          {error || "Aucune information disponible."}
        </p>

        <button onClick={fetchClientData}>
          Réessayer
        </button>
      </main>
    );
  }

  const { client, reservation, facture } = data;

  const formatAmount = (amount) =>
    Number(amount || 0).toFixed(2);

  return (
    <div className="client-page">

      {/* Header */}
      <header className="client-header">
        <div className="brand">
          <h1>Auberge Agadir</h1>
          <p>Votre confort, notre priorité</p>
        </div>

        <span className="secure-label">
          Paiement en mode démonstration
        </span>
      </header>

      <main className="invoice-container">

        {/* Welcome */}
        <section className="welcome-section">
          <h2>
            Bonjour {client.prenom || client.nom} 👋
          </h2>

          <p>
            Bienvenue dans votre espace client.
            Retrouvez votre réservation et votre facture.
          </p>
        </section>

        {/* Client information */}
        <section className="invoice-section">
          <h3>Informations du client</h3>

          <div className="info-grid">
            <div>
              <span>Nom complet</span>
              <strong>
                {client.prenom} {client.nom}
              </strong>
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

        {/* Reservation information */}
        <section className="invoice-section">
          <div className="section-heading">
            <h3>Détails de la réservation</h3>

            <span className="reference">
              {reservation.reference || reservation.id}
            </span>
          </div>

          <div className="reservation-grid">
            <div>
              <span>Chambre(s)</span>
              <strong>
                {reservation.chambres?.length
                  ? reservation.chambres
                      .map(
                        (chambre) =>
                          chambre.type || chambre.numChambre
                      )
                      .join(", ")
                  : "Non renseignée"}
              </strong>
            </div>

            <div>
              <span>Date d'arrivée</span>
              <strong>
                {reservation.date_arrivee || "Non renseignée"}
              </strong>
            </div>

            <div>
              <span>Date de départ</span>
              <strong>
                {reservation.date_depart || "Non renseignée"}
              </strong>
            </div>

            <div>
              <span>Nombre de personnes</span>
              <strong>
                {reservation.nbrPersonnes || "Non renseigné"}
              </strong>
            </div>
          </div>

          {/* Services */}
          <h4>Services réservés</h4>

          {reservation.services?.length > 0 ? (
            <ul className="services-list">
              {reservation.services.map((service, index) => (
                <li key={service.id || index}>
                  <span>{service.nom}</span>

                  <strong>
                    {formatAmount(service.prix)} DH
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun service supplémentaire.</p>
          )}
        </section>

        {/* Invoice */}
        <section className="invoice-section">
          <h3>Récapitulatif de la facture</h3>

          <div className="price-row">
            <span>Hébergement</span>
            <strong>
              {formatAmount(facture.montant_chambres)} DH
            </strong>
          </div>

          <div className="price-row">
            <span>Services supplémentaires</span>
            <strong>
              {formatAmount(facture.montant_services)} DH
            </strong>
          </div>

          <div className="total-row">
            <span>Montant total</span>
            <strong>
              {formatAmount(facture.montant_total)} DH
            </strong>
          </div>

          <div className="status-row">
            <span>Statut de la facture</span>

            <strong
              className={
                facture.statut === "payee"
                  ? "status-paid"
                  : "status-unpaid"
              }
            >
              {facture.statut === "payee"
                ? "Payée"
                : "Non payée"}
            </strong>
          </div>
        </section>

        {/* Payment */}
        <section className="payment-section">
          <h3>Paiement</h3>

          {facture.statut === "non_payee" ? (
            <>
              <p>
                Effectuez votre paiement en mode démonstration.
                Aucun montant réel ne sera débité.
              </p>

              <button
               onClick={() => navigate(`/payment/${data.facture.id}`)}
               disabled={data.facture.statut === "payee"}
              >
               Payer maintenant
              </button>
            </>
          ) : (
            <p className="payment-success">
              Votre paiement a été confirmé avec succès.
            </p>
          )}

          {error && (
            <p className="payment-error">{error}</p>
          )}

          <button
            className="download-button"
            onClick={handleDownload}
            disabled={facture.statut !== "payee"}
          >
            Télécharger ma facture PDF
          </button>

          <p className="security-note">
            Le téléchargement PDF est disponible après
            confirmation du paiement.
          </p>
        </section>

      </main>

      <footer className="client-footer">
        <p>
          © 2026 Auberge Agadir - Tous droits réservés
        </p>
      </footer>

    </div>
  );
}

export default Client;
