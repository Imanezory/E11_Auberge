
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

  // Fetch rooms from Django API
  useEffect(() => {
    const fetchChambres = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getChambres()
        setChambres(data)
      } catch (err) {
        console.error('Erreur:', err)
        setError('Impossible de charger les chambres. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }

    fetchChambres()
  }, [])

  // Get today's date in local format
  const today = new Date()
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const [dateArrivee, setDateArrivee] = useState('')
  const [dateDepart, setDateDepart] = useState('')
  const [nbrPersonnes, setNbrPersonnes] = useState(1)

  // Filter rooms by status and capacity
  const chambresDisponibles = chambres.filter((chambre) => {
    return (
      chambre.statut === 'disponible' &&
      chambre.capacite >= Number(nbrPersonnes)
    )
  })

  const handleSelectChambre = (chambre) => {
    setSelectedChambre(chambre)
  }

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
      alert('La date de départ doit être après la date d’arrivée.')
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
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleConfirmation = (reservation) => {
    setCreatedReservation(reservation)
    setCurrentStep(3)
  }

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

      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="brand-icon">A</span>
          <span>AUBERGE</span>
        </div>
      </header>

      <main className="dashboard-main">

        <div className="reservation-steps">
          <div className={currentStep >= 1 ? 'step active' : 'step'}>
            <span>1</span>
            <p>Choose a room</p>
          </div>

          <div className={currentStep >= 2 ? 'step active' : 'step'}>
            <span>2</span>
            <p>Your details</p>
          </div>

          <div className={currentStep >= 3 ? 'step active' : 'step'}>
            <span>3</span>
            <p>Confirmation</p>
          </div>
        </div>

        {currentStep === 1 && (
          <section className="room-selection-section">

            <h1>Choose your stay</h1>
            <p>Select your dates, guests and room.</p>

            <div className="booking-card">

              <div className="booking-fields">

                <div className="form-group">
                  <label>Check-in</label>
                  <input
                    type="date"
                    min={minDate}
                    value={dateArrivee}
                    onChange={(e) => setDateArrivee(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Check-out</label>
                  <input
                    type="date"
                    min={dateArrivee || minDate}
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Guests</label>
                  <input
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

            <h2>Available rooms</h2>

            {loading && <p>Loading rooms...</p>}

            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && chambresDisponibles.length === 0 && (
              <p>No rooms match the selected guest capacity.</p>
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
                      No image available
                    </div>
                  )}

                  <div className="room-card-content">

                    <h3>Room {chambre.numChambre}</h3>

                    <p>{getTypeLabel(chambre.type)}</p>

                    <p>
                      Capacity: {chambre.capacite} person(s)
                    </p>

                    <p className="room-price">
                      {Number(chambre.prix).toFixed(2)} DH / night
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectChambre(chambre)
                      }}
                    >
                      {selectedChambre?.id === chambre.id
                        ? 'Selected'
                        : 'Select this room'}
                    </button>

                  </div>
                </article>
              ))}

            </div>

            {selectedChambre && (
              <p className="selected-room-message">
                Selected room: {selectedChambre.numChambre}
              </p>
            )}

            <button
              type="button"
              className="continue-button"
              onClick={handleNext}
              disabled={loading || !!error}
            >
              Continue
            </button>

          </section>
        )}

        {currentStep === 2 && (
          <ReservationFormPage
            reservationData={reservationData}
            onBack={handleBack}
            onConfirm={handleConfirmation}
          />
        )}

        {currentStep === 3 && (
          <ReservationConfirmationPage
            reservation={createdReservation}
            onNewReservation={handleNewReservation}
          />
        )}

      </main>
    </div>
  )
}

export default ReservationPage
