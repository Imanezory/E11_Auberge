
import { useEffect, useMemo, useState } from 'react'
import { getServices } from '../services/reservationService'

function ReservationFormPage({
  reservationData,
  onBack,
  onConfirm,
}) {
  const [clientName, setClientName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])

  const [loadingServices, setLoadingServices] = useState(true)
  const [serviceError, setServiceError] = useState('')
  const [error, setError] = useState('')

  // Charger les services depuis le Backend
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getServices()
        setServices(Array.isArray(data) ? data : data.results || [])
      } catch (err) {
        setServiceError('Impossible de charger les services.')
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  const chambre = reservationData?.chambre

  const dateArrivee = reservationData?.dateArrivee
  const dateDepart = reservationData?.dateDepart

  // Calculer le nombre de nuits
  const nombreNuits = useMemo(() => {
    if (!dateArrivee || !dateDepart) return 0

    const arrivee = new Date(`${dateArrivee}T00:00:00`)
    const depart = new Date(`${dateDepart}T00:00:00`)

    const difference = depart - arrivee

    return difference > 0
      ? Math.round(difference / (1000 * 60 * 60 * 24))
      : 0
  }, [dateArrivee, dateDepart])

  // Prix de la chambre
  const prixChambre = Number(chambre?.prix || 0)

  // Services sélectionnés
  const servicesChoisis = services.filter(service =>
    selectedServices.includes(service.id)
  )

  const totalServices = servicesChoisis.reduce(
    (total, service) => total + Number(service.prix || 0),
    0
  )

  const totalChambre = prixChambre * nombreNuits
  const totalGeneral = totalChambre + totalServices

  const formatPrice = (price) =>
    `${Number(price).toFixed(2)} DH`

  const toggleService = (serviceId) => {
    setSelectedServices(previous =>
      previous.includes(serviceId)
        ? previous.filter(id => id !== serviceId)
        : [...previous, serviceId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!clientName.trim() || !email.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (!chambre?.id) {
      setError('Aucune chambre sélectionnée.')
      return
    }

    if (nombreNuits <= 0) {
      setError('Veuillez vérifier les dates de votre séjour.')
      return
    }

    onConfirm({
      ...reservationData,

      // IDs attendus par ReservationSerializer
      services: selectedServices,

      // Informations affichées dans le récapitulatif
      clientName,
      email,
      phone,
      notes,

      totalChambre,
      totalServices,
      totalGeneral,
    })
  }

  return (
    <section className="reservation-form-page">

      {/* En-tête */}
      <div className="page-heading">
        <p className="eyebrow">ÉTAPE 02 — VOTRE SÉJOUR</p>

        <h1>Finalisez votre réservation</h1>

        <p>
          Vérifiez les détails de votre séjour et choisissez
          vos services supplémentaires.
        </p>
      </div>

      <div className="reservation-form-layout">

        <div className="reservation-form-main">

          {/* Informations client */}
          <div className="client-form-card">

            <h2>Informations personnelles</h2>

            <p className="section-description">
              Veuillez saisir vos coordonnées.
            </p>

            <form id="reservation-form" onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="clientName">
                  Nom complet *
                </label>

                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="email">Adresse email *</label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Téléphone *</label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+212 ..."
                    required
                  />
                </div>

              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  Demandes spéciales
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Avez-vous une demande particulière ?"
                  rows={3}
                />
              </div>

            </form>
          </div>

          {/* Services supplémentaires */}
          <div className="additional-services-card">

            <div className="services-heading">
              <div>
                <p className="eyebrow">PERSONNALISEZ VOTRE SÉJOUR</p>
                <h2>Services supplémentaires</h2>
                <p className="section-description">
                  Sélectionnez les services que vous souhaitez ajouter.
                </p>
              </div>

              <span className="optional-label">Optionnel</span>
            </div>

            {loadingServices && (
              <p className="loading-message">
                Chargement des services...
              </p>
            )}

            {serviceError && (
              <p className="error-message">{serviceError}</p>
            )}

            {!loadingServices && !serviceError && services.length === 0 && (
              <p className="empty-message">
                Aucun service disponible pour le moment.
              </p>
            )}

            <div className="additional-services-grid">

              {services.map(service => {
                const selected = selectedServices.includes(service.id)

                return (
                  <label
                    key={service.id}
                    className={`additional-service-card ${
                      selected ? 'selected' : ''
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleService(service.id)}
                    />

                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.nom}
                        className="additional-service-image"
                      />
                    )}

                    <div className="additional-service-content">

                      <div className="service-title-row">
                        <h3>{service.nom}</h3>

                        <span className="service-price">
                          {Number(service.prix) === 0
                            ? 'Gratuit'
                            : formatPrice(service.prix)}
                        </span>
                      </div>

                      <p>{service.description}</p>

                      <span className="service-type">
                        {service.type}
                      </span>

                    </div>

                  </label>
                )
              })}

            </div>
          </div>

        </div>

        {/* Récapitulatif */}
        <aside className="booking-summary-card">

          <p className="eyebrow">VOTRE RÉSERVATION</p>

          <h2>Récapitulatif</h2>

          <div className="summary-room">
            {chambre?.image && (
              <img
                src={chambre.image}
                alt="Chambre sélectionnée"
              />
            )}

            <div>
              <h3>
                Chambre {chambre?.numChambre || ''}
              </h3>

              <p>{chambre?.type || 'Chambre sélectionnée'}</p>
            </div>
          </div>

          <div className="summary-line">
            <span>Arrivée</span>
            <strong>{dateArrivee || 'Non définie'}</strong>
          </div>

          <div className="summary-line">
            <span>Départ</span>
            <strong>{dateDepart || 'Non définie'}</strong>
          </div>

          <div className="summary-line">
            <span>Personnes</span>
            <strong>{reservationData?.nbrPersonnes || 0}</strong>
          </div>

          <div className="summary-line">
            <span>Nombre de nuits</span>
            <strong>{nombreNuits}</strong>
          </div>

          <hr />

          <div className="summary-line">
            <span>Chambre / nuit</span>
            <strong>{formatPrice(prixChambre)}</strong>
          </div>

          <div className="summary-line">
            <span>Prix du séjour</span>
            <strong>{formatPrice(totalChambre)}</strong>
          </div>

          <div className="summary-line">
            <span>Services sélectionnés</span>
            <strong>{formatPrice(totalServices)}</strong>
          </div>

          <hr />

          <div className="summary-total">
            <span>Total estimé</span>
            <strong>{formatPrice(totalGeneral)}</strong>
          </div>

          <p className="summary-note">
            Le montant affiché est une estimation basée
            sur les prix des services et de la chambre.
          </p>

          <div className="selected-services-list">
            {servicesChoisis.map(service => (
              <div key={service.id}>
                <span>{service.nom}</span>
                <strong>{formatPrice(service.prix)}</strong>
              </div>
            ))}
          </div>

        </aside>

      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Actions */}
      <div className="form-actions">

        <button
          type="button"
          className="form-cancel-button"
          onClick={onBack}
        >
          Retour
        </button>

        <button
          type="submit"
          form="reservation-form"
          className="new-reservation-button"
        >
          Revoir ma réservation →
        </button>

      </div>

    </section>
  )
}

export default ReservationFormPage
