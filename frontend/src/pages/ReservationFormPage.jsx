
import { useState } from 'react'

function ReservationFormPage({
  reservationData,
  onBack,
  onConfirm,
}) {
  const [clientName, setClientName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!clientName.trim() || !email.trim() || !phone.trim()) {
      setError('Please complete all required fields.')
      return
    }

    onConfirm({
      ...reservationData,
      clientName,
      email,
      phone,
      notes,
    })
  }

  return (
    <section className="reservation-form-page">

      <div className="page-heading">
        <p className="eyebrow">ALMOST THERE</p>
        <h1>Your information</h1>
        <p>Please provide your contact details.</p>
      </div>

      <div className="booking-summary">
        <h2>Your stay details</h2>

        <div className="summary-grid">
          <div>
            <span>Check-in</span>
            <strong>{reservationData.dateArrivee || 'Not selected'}</strong>
          </div>

          <div>
            <span>Check-out</span>
            <strong>{reservationData.dateDepart || 'Not selected'}</strong>
          </div>

          <div>
            <span>Guests</span>
            <strong>{reservationData.nbrPersonnes}</strong>
          </div>

          <div>
            <span>Room</span>
            <strong>
              {reservationData.chambre?.nom || 'Not selected'}
            </strong>
          </div>
        </div>
      </div>

      <form className="client-form" onSubmit={handleSubmit}>
        <h2>Personal information</h2>

        <div className="form-group">
          <label htmlFor="clientName">Full name *</label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone number *</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+212 ..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Special requests (optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests?"
            rows="4"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="form-cancel-button"
            onClick={onBack}
          >
            Back
          </button>

          <button
            type="submit"
            className="new-reservation-button"
          >
            Review reservation
          </button>
        </div>
      </form>
    </section>
  )
}

export default ReservationFormPage
