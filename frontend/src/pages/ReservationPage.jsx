
import { useEffect, useState } from 'react'
import ReservationFormPage from './ReservationFormPage'
import ReservationConfirmationPage from './ReservationConfirmationPage'
import { getChambres } from '../services/reservationService'

function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const [chambres, setChambres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedChambre, setSelectedChambre] = useState(null)

  const [reservationData, setReservationData] = useState({
    chambre: null,
    dateArrivee: '',
    dateDepart: '',
    nbrPersonnes: 1,
    services: [],
  })

  const [createdReservation, setCreatedReservation] = useState(null)

  // Charger les chambres depuis l'API Django
  useEffect(() => {
    const fetchChambres = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getChambres()
        setChambres(data)
      } catch (err) {
        console.error('Erreur :', err)
        setError('Impossible de charger les chambres. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }

    fetchChambres()
  }, [])

  // Date minimale : aujourd'hui
  const today = new Date()
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const [dateArrivee, setDateArrivee] = useState('')
  const [dateDepart, setDateDepart] = useState('')
  const [nbrPersonnes, setNbrPersonnes] = useState(1)

  // Filtrer les chambres disponibles selon leur capacité
  const chambresDisponibles = chambres.filter((chambre) => {
    return (
      chambre.statut === 'disponible' &&
      chambre.capacite >= Number(nbrPersonnes)
    )
  })

  const handleSelectChambre = (chambre) => {
    setSelectedChambre(chambre)
  }

  // Passer à l'étape suivante
  const handleNext = () => {
    if (!dateArrivee || !dateDepart) {
      alert('Veuillez sélectionner les dates de votre séjour.')
      return
    }

    if (dateArrivee < minDate) {
      alert("La date d'arrivée ne peut pas être dans le passé.")
      return
    }

    if (dateDepart <= dateArrivee) {
      alert('La date de départ doit être postérieure à la date d’arrivée.')
      return
    }

    if (!selectedChambre) {
      alert('Veuillez sélectionner une chambre.')
      return
    }

    if (Number(nbrPersonnes) > selectedChambre.capacite) {
      alert('Le nombre de personnes dépasse la capacité de cette chambre.')
      return
    }

    setReservationData({
      chambre: selectedChambre,
      dateArrivee,
      dateDepart,
      nbrPersonnes: Number(nbrPersonnes),
      services: [],
    })

    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirmation = (reservation) => {
    setCreatedReservation(reservation)
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Créer une nouvelle réservation
  const handleNewReservation = () => {
    setSelectedChambre(null)
    setDateArrivee('')
    setDateDepart('')
    setNbrPersonnes(1)

    setReservationData({
      chambre: null,
      dateArrivee: '',
      dateDepart: '',
      nbrPersonnes: 1,
      services: [],
    })

    setCreatedReservation(null)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getTypeLabel = (type) => {
    const types = {
      simple: 'Chambre simple',
      double: 'Chambre double',
      suite: 'Suite',
      familiale: 'Chambre familiale',
    }

    return types[type] || type
  }

  return (
    <div className="reservation-app">

      <div className="reservation-page-container">

        {/* Étapes de réservation */}
        <div className="reservation-steps">
          <div className={currentStep >= 1 ? 'step active' : 'step'}>
            <span>1</span>
            <p>Choix de la chambre</p>
          </div>

          <div className={currentStep >= 2 ? 'step active' : 'step'}>
            <span>2</span>
            <p>Vos informations</p>
          </div>

          <div className={currentStep >= 3 ? 'step active' : 'step'}>
            <span>3</span>
            <p>Confirmation</p>
          </div>
        </div>

        {/* Étape 1 : Choix de la chambre */}
        {currentStep === 1 && (
          <section className="room-selection-section">

            <div className="reservation-page-heading">
              <span className="reservation-eyebrow">AUBERGE</span>
              <h1>Réservez votre séjour</h1>
              <p>
                Choisissez vos dates, indiquez le nombre de personnes
                et sélectionnez la chambre qui vous convient.
              </p>
            </div>

            {/* Formulaire de recherche */}
            <div className="booking-card">
              <div className="booking-fields">

                <div className="form-group">
                  <label htmlFor="dateArrivee">Date d'arrivée</label>
                  <input
                    id="dateArrivee"
                    type="date"
                    min={minDate}
                    value={dateArrivee}
                    onChange={(e) => setDateArrivee(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateDepart">Date de départ</label>
                  <input
                    id="dateDepart"
                    type="date"
                    min={dateArrivee || minDate}
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nbrPersonnes">Nombre de personnes</label>
                  <input
                    id="nbrPersonnes"
                    type="number"
                    min="1"
                    max="20"
                    value={nbrPersonnes}
                    onChange={(e) => {
                      const value = Math.max(1, Number(e.target.value))
                      setNbrPersonnes(value)
                      setSelectedChambre(null)
                    }}
                  />
                </div>

              </div>
            </div>

            {/* Liste des chambres */}
            <div className="available-rooms-heading">
              <h2>Nos chambres disponibles</h2>
              <p>
                Découvrez nos chambres et choisissez celle qui correspond
                à vos besoins.
              </p>
            </div>

            {loading && (
              <p className="loading-message">
                Chargement des chambres...
              </p>
            )}

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </button>
              </div>
            )}

            {!loading && !error && chambresDisponibles.length === 0 && (
              <p className="empty-message">
                Aucune chambre ne correspond au nombre de personnes sélectionné.
              </p>
            )}

            <div className="room-selection-grid">
              {chambresDisponibles.map((chambre) => (
                <article
                  key={chambre.id}
                  className={`room-selection-card ${
                    selectedChambre?.id === chambre.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectChambre(chambre)}
                >

                  {chambre.image ? (
                    <img
                      src={chambre.image}
                      alt={`Chambre ${chambre.numChambre}`}
                      className="room-image"
                    />
                  ) : (
                    <div className="room-image-placeholder">
                      Image non disponible
                    </div>
                  )}

                  <div className="room-card-content">

                    <h3>Chambre {chambre.numChambre}</h3>

                    <p>{getTypeLabel(chambre.type)}</p>

                    <p>
                      Capacité : {chambre.capacite} personne(s)
                    </p>

                    <p className="room-price">
                      {Number(chambre.prix).toFixed(2)} DH / nuit
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectChambre(chambre)
                      }}
                    >
                      {selectedChambre?.id === chambre.id
                        ? 'Chambre sélectionnée'
                        : 'Choisir cette chambre'}
                    </button>

                  </div>
                </article>
              ))}
            </div>

            {selectedChambre && (
              <p className="selected-room-message">
                Chambre sélectionnée : {selectedChambre.numChambre}
              </p>
            )}

            <div className="reservation-actions">
              <button
                type="button"
                className="continue-button"
                onClick={handleNext}
                disabled={loading || !!error}
              >
                Continuer
              </button>
            </div>

          </section>
        )}

        {/* Étape 2 : Informations du client */}
        {currentStep === 2 && (
          <ReservationFormPage
            reservationData={reservationData}
            onBack={handleBack}
            onConfirm={handleConfirmation}
          />
        )}

        {/* Étape 3 : Confirmation */}
        {currentStep === 3 && (
          <ReservationConfirmationPage
            reservation={createdReservation}
            onNewReservation={handleNewReservation}
          />
        )}

      </div>
    </div>
  )
}

export default ReservationPage
