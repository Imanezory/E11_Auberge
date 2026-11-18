
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

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("visa");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Récupérer les informations de la facture
  useEffect(() => {
    const fetchFacture = async () => {
      try {
        const response = await fetch(`/api/factures/${id}/`, {
          credentials: "same-origin",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error("Impossible de récupérer la facture.");
        }

        setFacture(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacture();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Vérification des champs de démonstration
    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    const cleanNumber = cardNumber.replace(/\s/g, "");

    if (!/^\d{16}$/.test(cleanNumber)) {
      setError("Le numéro de démonstration doit contenir 16 chiffres.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Format de date invalide. Utilisez MM/AA.");
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      setError("Le code CVV de démonstration doit contenir 3 chiffres.");
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch(`/api/factures/${id}/payer/`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.detail || "Le paiement a échoué."
        );
      }

      // Retour à la page Client après paiement
      navigate("/", {
        replace: true,
        state: { paymentSuccess: true },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <div className="payment-message">Chargement de la facture...</div>;
  }

  if (!facture) {
    return (
      <div className="payment-message">
        <p>{error || "Facture introuvable."}</p>
        <button onClick={() => navigate("/")}>Retour</button>
      </div>
    );
  }

  if (facture.statut === "payee") {
    return (
      <div className="payment-message">
        <h2>Cette facture est déjà payée.</h2>
        <button onClick={() => navigate("/")}>Retour à ma facture</button>
      </div>
    );
  }

  return (
    <main className="payment-page">
      <header className="payment-header">
        <div className="payment-brand">
          <span className="brand-icon">A</span>
          <div>
            <h1>Auberge Agadir</h1>
            <p>Votre séjour, notre priorité</p>
          </div>
        </div>

        <div className="demo-secure">
          <span>🔒</span>
          <span>Paiement en mode démonstration</span>
        </div>
      </header>

      <div className="payment-container">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Retour à ma facture
        </button>

        <div className="payment-layout">
          <section className="payment-form-card">
            <div className="payment-title">
              <h2>Paiement de votre facture</h2>
              <p>Veuillez choisir votre mode de paiement.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="field-label">Mode de paiement</label>

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
                  Cette page simule un paiement. Utilisez uniquement des
                  informations fictives. Aucune transaction bancaire réelle
                  n'est effectuée.
                </p>
              </div>

              <h3 className="form-section-title">
                Informations de paiement fictives
              </h3>

              <div className="form-field">
                <label htmlFor="cardName">Nom du titulaire</label>
                <input
                  id="cardName"
                  type="text"
                  placeholder="Ex. MARIA BENALI"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="cardNumber">Numéro de carte fictif</label>
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
                  <label htmlFor="expiry">Date d'expiration</label>
                  <input
                    id="expiry"
                    type="text"
                    placeholder="MM/AA"
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (value.length > 2) {
                        value = value.slice(0, 2) + "/" + value.slice(2);
                      }
                      setExpiry(value);
                    }}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="cvv">CVV fictif</label>
                  <input
                    id="cvv"
                    type="password"
                    inputMode="numeric"
                    maxLength="3"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    required
                  />
                </div>
              </div>

              {error && <div className="payment-error">{error}</div>}

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

          <aside className="payment-summary">
            <h3>Résumé de la facture</h3>

            <div className="summary-line">
              <span>Numéro de facture</span>
              <strong>#{facture.id}</strong>
            </div>

            <div className="summary-line">
              <span>Réservation</span>
              <strong>#{facture.reservation_id || "—"}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Montant total</span>
              <strong>
                {Number(facture.montant_total).toFixed(2)} MAD
              </strong>
            </div>

            <div className="summary-security">
              <span>✓</span>
              <p>Simulation de paiement destinée à la démonstration du projet.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Payment;
