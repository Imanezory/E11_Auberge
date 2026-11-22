
function ReservationConfirmationPage({
  reservation,
  onNewReservation,
}) {
  if (!reservation) {
    return <p>No reservation details available.</p>
  }

  return (
    <section className="confirmation-page">

      <div className="confirmation-icon">✓</div>

      <p className="eyebrow">RESERVATION DETAILS</p>

      <h1>Thank you, {reservation.clientName}!</h1>

      <p className="confirmation-message">
        Your reservation information has been collected.
      </p>

      <div className="confirmation-card">
        <h2>Reservation summary</h2>

        <div className="summary-grid">
          <div>
            <span>Full name</span>
            <strong>{reservation.clientName}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{reservation.email}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{reservation.phone}</strong>
          </div>

          <div>
            <span>Check-in</span>
            <strong>{reservation.dateArrivee || 'Not selected'}</strong>
          </div>

          <div>
            <span>Check-out</span>
            <strong>{reservation.dateDepart || 'Not selected'}</strong>
          </div>

          <div>
            <span>Guests</span>
            <strong>{reservation.nbrPersonnes}</strong>
          </div>

          <div>
            <span>Room</span>
            <strong>
              {reservation.chambre?.nom || 'Not selected'}
            </strong>
          </div>
        </div>

        {reservation.notes && (
          <div className="confirmation-notes">
            <span>Special requests</span>
            <p>{reservation.notes}</p>
          </div>
        )}
      </div>

      <p className="confirmation-notice">
        This is a reservation preview. Your booking will only be
        confirmed after connecting the reservation API.
      </p>

      <button
        className="new-reservation-button"
        onClick={onNewReservation}
      >
        Create another reservation
      </button>

    </section>
  )
}

export default ReservationConfirmationPage
