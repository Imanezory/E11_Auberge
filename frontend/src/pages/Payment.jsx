
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Payment.css";

function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur.");
  }

  return response.json();
}

function Payment() {
  // ID de réservation
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const [mode, setMode] = useState("visa");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // =====================================
  // CHARGER LE MONTANT DE LA RESERVATION
  // =====================================

  useEffect(() => {
    let cancelled = false;

    const fetchReservation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/factures/reservations/${id}/checkout/`,
          {
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            result.error || "Impossible de récupérer la réservation."
          );
        }

        if (!cancelled) {
          setReservation(result);
        }

      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchReservation();
    } else {
      setError("Identifiant de réservation manquant.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =====================================
  // VALIDATION DU FORMULAIRE
  // =====================================

  const validatePaymentForm = () => {
    if (
      !cardName.trim() ||
      !cardNumber.trim() ||
      !expiry.trim() ||
      !cvv.trim()
    ) {
      return "Veuillez remplir tous les champs.";
    }

    const cleanNumber = cardNumber.replace(/\s/g, "");

    if (!/^\d{16}$/.test(cleanNumber)) {
      return "Le numéro fictif doit contenir 16 chiffres.";
    }

    const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/);

    if (!expiryMatch) {
      return "Format invalide. Utilisez MM/AA.";
    }

    const month = Number(expiryMatch[1]);

    if (month < 1 || month > 12) {
      return "Mois d'expiration invalide.";
    }

    if (!/^\d{3}$/.test(cvv)) {
      return "Le CVV fictif doit contenir 3 chiffres.";
    }

    return null;
  };

  // =====================================
  // PAIEMENT DEMONSTRATIF
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentLoading || success) return;

    setError("");

    const validationError = validatePaymentForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!reservation?.reservation_id) {
      setError("Réservation introuvable.");
      return;
    }

    setPaymentLoading(true);

    try {
      // Initialisation CSRF
      const csrfResponse = await fetch("/api/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) {
        throw new Error("Impossible d'initialiser la protection CSRF.");
      }

      const csrfData = await readResponse(csrfResponse);

      const csrfToken =
        getCookie("csrftoken") || csrfData.csrfToken;

      if (!csrfToken) {
        throw new Error("Token CSRF introuvable.");
      }

      // Confirmation de paiement de démonstration
      const response = await fetch(
        `/api/factures/reservations/${id}/payer/`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            payment_method: mode,
            demo_confirmed: true,
          }),
        }
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.detail ||
          "Le paiement a échoué."
        );
      }

      setSuccess(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // =====================================
  // CHARGEMENT
  // =====================================

  if (loading) {
    return (
      <div className="payment-message">
        Chargement de votre réservation...
      </div>
    );
  }

  // =====================================
  // ERREUR
  // =====================================

  if (!reservation) {
    return (
      <div className="payment-message">
        <h2>Réservation introuvable</h2>
        <p>{error}</p>

        <button onClick={() => navigate("/")}>
          Retour
        </button>
      </div>
    );
  }

  // =====================================
  // PAIEMENT REUSSI
  // =====================================

  if (success) {
    return (
      <main className="payment-page">
        <div className="payment-message">

          <div className="payment-success-icon">✓</div>

          <h2>Paiement effectué avec succès !</h2>

          <p>
            Votre paiement de démonstration a été confirmé.
          </p>

          <div className="payment-summary">

            <div className="summary-line">
              <span>Réservation</span>
              <strong>#{success.reservation_id}</strong>
            </div>

            <div className="summary-line">
              <span>Facture</span>
              <strong>#{success.facture_id}</strong>
            </div>

            <div className="summary-line">
              <span>Montant payé</span>
              <strong>
                {Number(success.montant_total).toFixed(2)} MAD
              </strong>
            </div>

            <div className="summary-line">
              <span>Statut</span>
              <strong>{success.statut_facture}</strong>
            </div>

          </div>

          {success.pdf_url && (
            <a
              className="confirm-payment-button"
              href={success.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Télécharger ma facture PDF
            </a>
          )}

          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            Retour à mon espace client
          </button>

        </div>
      </main>
    );
  }

  // =====================================
  // FORMULAIRE VISA / MASTERCARD
  // =====================================

  return (
    <main className="payment-page">

      

      <div className="payment-container">

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Retour à la réservation
        </button>

        <div className="payment-layout">

          <section className="payment-form-card">

            <div className="payment-title">
              <h2>Paiement de votre réservation</h2>
              <p>Veuillez choisir votre mode de paiement.</p>
            </div>

            <form onSubmit={handleSubmit}>

              <label className="field-label">
                Mode de paiement
              </label>

              <div className="payment-methods">

                <button
                  type="button"
                  className={`method-card ${mode === "visa" ? "selected" : ""}`}
                  onClick={() => setMode("visa")}
                >
                  <span className="visa-logo">VISA</span>
                  <span>Carte Visa</span>
                </button>

                <button
                  type="button"
                  className={`method-card ${mode === "mastercard" ? "selected" : ""}`}
                  onClick={() => setMode("mastercard")}
                >
                  <span className="mastercard-logo">
                    <span></span>
                    <span></span>
                  </span>
                  <span>Mastercard</span>
                </button>

              </div>

              <div className="demo-notice">
                <strong>Simulation universitaire</strong>

                <p>
                  Cette page simule un paiement.
                  Utilisez uniquement des informations fictives.
                  Aucune transaction bancaire réelle n'est effectuée.
                </p>
              </div>

              <h3 className="form-section-title">
                Informations de paiement fictives
              </h3>

              <div className="form-field">

                <label htmlFor="cardName">
                  Nom du titulaire
                </label>

                <input
                  id="cardName"
                  type="text"
                  placeholder="Ex. CLIENT TEST"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />

              </div>

              <div className="form-field">

                <label htmlFor="cardNumber">
                  Numéro de carte fictif
                </label>

                <input
                  id="cardNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength="19"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 16)
                      .replace(/(.{4})/g, "$1 ")
                      .trim();

                    setCardNumber(value);
                  }}
                  required
                />

              </div>

              <div className="form-row">

                <div className="form-field">

                  <label htmlFor="expiry">
                    Date d'expiration
                  </label>

                  <input
                    id="expiry"
                    type="text"
                    placeholder="MM/AA"
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => {
                      let value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                      if (value.length > 2) {
                        value =
                          value.slice(0, 2) +
                          "/" +
                          value.slice(2);
                      }

                      setExpiry(value);
                    }}
                    required
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="cvv">
                    CVV fictif
                  </label>

                  <input
                    id="cvv"
                    type="password"
                    inputMode="numeric"
                    maxLength="3"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(
                        e.target.value.replace(/\D/g, "").slice(0, 3)
                      )
                    }
                    required
                  />

                </div>

              </div>

              {error && (
                <div className="payment-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="confirm-payment-button"
                disabled={paymentLoading}
              >
                {paymentLoading
                  ? "Traitement en cours..."
                  : "Confirmer le paiement"}
              </button>

            </form>

            <p className="payment-footer-note">
              Paiement de démonstration • Aucun montant réel ne sera débité.
            </p>

          </section>

          {/* RESUME RESERVATION */}

          <aside className="payment-summary">

            <h3>Résumé de la réservation</h3>

            <div className="summary-line">
              <span>Numéro de réservation</span>
              <strong>#{reservation.reservation_id}</strong>
            </div>

            <div className="summary-line">
              <span>Nombre de nuits</span>
              <strong>{reservation.nuits}</strong>
            </div>

            <div className="summary-line">
              <span>Hébergement</span>
              <strong>
                {Number(reservation.montant_chambres).toFixed(2)} MAD
              </strong>
            </div>

            <div className="summary-line">
              <span>Services</span>
              <strong>
                {Number(reservation.montant_services).toFixed(2)} MAD
              </strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Montant total</span>
              <strong>
                {Number(reservation.montant_total).toFixed(2)} MAD
              </strong>
            </div>

            <div className="summary-security">
              <span>✓</span>
              <p>
                Simulation de paiement destinée à la démonstration du projet.
              </p>
            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default Payment;
