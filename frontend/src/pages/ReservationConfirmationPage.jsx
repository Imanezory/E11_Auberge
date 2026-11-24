
import { useEffect, useState } from 'react'

import {
  getReservations,
  getServices,
  getChambres,
} from '../services/reservationService'


function ReservationConfirmationPage({
  reservation,
  onNewReservation,
}) {

  const [history, setHistory] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [roomsList, setRoomsList] = useState([])
  const [loading, setLoading] = useState(true)


  // =====================================
  // CHARGEMENT DES DONNEES
  // =====================================

  useEffect(() => {

    const loadData = async () => {

      try {

        const [reservations, services, rooms] =
          await Promise.all([
            getReservations(),
            getServices(),
            getChambres(),
          ])

        setHistory(
          Array.isArray(reservations)
            ? reservations
            : reservations.results || []
        )

        setServicesList(
          Array.isArray(services)
            ? services
            : services.results || []
        )

        setRoomsList(
          Array.isArray(rooms)
            ? rooms
            : rooms.results || []
        )

      } catch (error) {

        console.error(
          'Erreur de chargement :',
          error
        )

      } finally {

        setLoading(false)

      }
    }

    loadData()

  }, [])


  // =====================================
  // VERIFICATION RESERVATION
  // =====================================

  if (!reservation) {

    return (
      <section className="confirmation-page">

        <p>
          Aucune information de réservation disponible.
        </p>

        <button onClick={onNewReservation}>
          Nouvelle réservation
        </button>

      </section>
    )
  }


  // =====================================
  // FORMATAGE DES DATES
  // =====================================

  const formatDate = (date) => {

    if (!date) return 'Non renseignée'

    return new Date(date).toLocaleDateString('fr-FR')
  }


  // =====================================
  // CHAMBRE SELECTIONNEE
  // =====================================

  const selectedRoom =
    reservation.chambre ||
    reservation.chambres?.[0] ||
    roomsList.find(
      room => room.id === reservation.chambres?.[0]
    )


  // =====================================
  // SERVICES SELECTIONNES
  // =====================================

  const selectedServices = (
    reservation.services || []
  )
    .map(item => {

      if (typeof item === 'object') {
        return item
      }

      return servicesList.find(
        service => service.id === item
      )

    })
    .filter(Boolean)


  // =====================================
  // CALCUL DES PRIX
  // =====================================

  const roomPrice = Number(
    selectedRoom?.prix || 0
  )

  const nights =
    reservation.dateArrivee &&
    reservation.dateDepart
      ? Math.max(
          0,
          Math.round(
            (
              new Date(reservation.dateDepart) -
              new Date(reservation.dateArrivee)
            ) / (1000 * 60 * 60 * 24)
          )
        )
      : 0


  const servicesTotal = selectedServices.reduce(
    (total, service) =>
      total + Number(service.prix || 0),
    0
  )


  const total =
    reservation.total ??
    reservation.totalPrice ??
    (roomPrice * nights + servicesTotal)


  // =====================================
  // NOM DE LA CHAMBRE
  // =====================================

  const getRoomName = () => {

    if (!selectedRoom) {
      return 'Non sélectionnée'
    }

    return selectedRoom.numChambre
      ? `Chambre ${selectedRoom.numChambre}`
      : selectedRoom.nom ||
        `Chambre ${selectedRoom.id}`
  }


  // =====================================
  // STATUT RESERVATION
  // =====================================

  const getStatus = (status) => {

    const statuses = {
      en_attente: 'En attente',
      confirmee: 'Confirmée',
      payee: 'Payée',
      annulee: 'Annulée',
      terminee: 'Terminée',
    }

    return statuses[status] || status || 'En attente'
  }


  // =====================================
  // REDIRECTION VERS VISA
  // =====================================

  const goToPayment = () => {

    if (!reservation?.id) {

      alert(
        'Identifiant de réservation introuvable.'
      )

      return
    }

    // IMPORTANT :
    // On utilise directement ID de réservation.
    // Aucune facture préalable n'est nécessaire.

    window.location.href =
      `/factures/payment/${reservation.id}/`
  }


  // =====================================
  // AFFICHAGE
  // =====================================

  return (

    <section className="confirmation-page">


      {/* CONFIRMATION */}

      <div className="confirmation-success">

        <div className="confirmation-icon">
          ✓
        </div>

        <p className="eyebrow">
          CONFIRMATION DE RÉSERVATION
        </p>

        <h1>
          Merci {reservation.clientName || ''} !
        </h1>

        <p className="confirmation-message">
          Votre demande de réservation a été
          enregistrée avec succès.
        </p>

        <span className="reservation-status">
          {getStatus(reservation.statut)}
        </span>

      </div>


      {/* RECAPITULATIF */}

      <div className="confirmation-card">

        <h2>
          Récapitulatif de votre réservation
        </h2>

        <div className="summary-grid">

          <div>
            <span>Nom complet</span>
            <strong>
              {reservation.clientName || 'Non renseigné'}
            </strong>
          </div>

          <div>
            <span>Adresse e-mail</span>
            <strong>
              {reservation.email || 'Non renseignée'}
            </strong>
          </div>

          <div>
            <span>Téléphone</span>
            <strong>
              {reservation.phone || 'Non renseigné'}
            </strong>
          </div>

          <div>
            <span>Date d'arrivée</span>
            <strong>
              {formatDate(reservation.dateArrivee)}
            </strong>
          </div>

          <div>
            <span>Date de départ</span>
            <strong>
              {formatDate(reservation.dateDepart)}
            </strong>
          </div>

          <div>
            <span>Nombre de nuits</span>
            <strong>{nights}</strong>
          </div>

          <div>
            <span>Nombre de personnes</span>
            <strong>{reservation.nbrPersonnes}</strong>
          </div>

          <div>
            <span>Chambre réservée</span>
            <strong>{getRoomName()}</strong>
          </div>

        </div>


        {/* SERVICES */}

        <div className="confirmation-services">

          <h3>
            Services supplémentaires
          </h3>

          {selectedServices.length > 0 ? (

            selectedServices.map(service => (

              <div
                className="confirmation-service-item"
                key={service.id}
              >

                <span>{service.nom}</span>

                <strong>
                  {Number(service.prix).toFixed(2)} DH
                </strong>

              </div>

            ))

          ) : (

            <p>
              Aucun service supplémentaire sélectionné.
            </p>

          )}

        </div>


        {/* PRIX */}

        <div className="confirmation-total">

          <div>
            <span>
              Prix de la chambre ({nights} nuits)
            </span>

            <strong>
              {(roomPrice * nights).toFixed(2)} DH
            </strong>
          </div>

          <div>
            <span>Total des services</span>

            <strong>
              {servicesTotal.toFixed(2)} DH
            </strong>
          </div>

          <div className="total-final">

            <span>Montant total</span>

            <strong>
              {Number(total).toFixed(2)} DH
            </strong>

          </div>

        </div>


        {/* NOTES */}

        {reservation.notes && (

          <div className="confirmation-notes">

            <span>Demandes particulières</span>

            <p>{reservation.notes}</p>

          </div>

        )}

      </div>


      {/* HISTORIQUE */}

      <div className="history-section">

        <h2>
          Historique de mes réservations
        </h2>

        {loading ? (

          <p>
            Chargement de votre historique...
          </p>

        ) : history.length > 0 ? (

          <div className="history-list">

            {history.map(item => {

              const room = roomsList.find(
                r =>
                  r.id === (
                    item.chambres?.[0]?.id ||
                    item.chambres?.[0]
                  )
              )

              return (

                <div
                  className="history-item"
                  key={item.id}
                >

                  <div>

                    <strong>
                      Réservation #{item.id}
                    </strong>

                    <p>
                      Arrivée : {formatDate(item.dateArrivee)}
                    </p>

                    <p>
                      Départ : {formatDate(item.dateDepart)}
                    </p>

                    <p>
                      Chambre : {room?.numChambre || 'Non renseignée'}
                    </p>

                  </div>

                  <span
                    className={`history-status ${item.statut}`}
                  >
                    {getStatus(item.statut)}
                  </span>

                </div>

              )

            })}

          </div>

        ) : (

          <p>
            Aucune réservation dans votre historique.
          </p>

        )}

      </div>


      {/* BOUTONS */}

      <div className="confirmation-actions">

        <button
          className="new-reservation-button"
          onClick={onNewReservation}
        >
          Nouvelle réservation
        </button>

        <button
          className="pay-button"
          onClick={goToPayment}
        >
          Payer maintenant →
        </button>

      </div>

    </section>

  )

}

export default ReservationConfirmationPage
