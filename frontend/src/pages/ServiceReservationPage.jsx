
import { useEffect, useMemo, useState } from 'react'
import './ServiceReservationPage.css'

const PAGE_SIZE = 3

const money = value =>
  `${Number(value || 0).toFixed(2)} DH`

function ServiceReservationPage() {

  const serviceId = window.location.pathname
    .split('/')
    .filter(Boolean)
    .pop()

  const [service, setService] = useState(null)
  const [allServices, setAllServices] = useState([])

  // Services attribués individuellement à chaque personne
  const [assignments, setAssignments] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [date, setDate] = useState('')
  const [persons, setPersons] = useState(1)

  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [notes, setNotes] = useState('')

  const [category, setCategory] = useState('Toutes')
  const [page, setPage] = useState(0)

  const today = new Date().toLocaleDateString('en-CA')

  // =====================================
  // CHARGEMENT DES SERVICES
  // =====================================

  useEffect(() => {

    let active = true

    async function loadServices() {

      try {

        const [selectedResponse, allResponse] =
          await Promise.all([
            fetch(`/api/services/${serviceId}/`),
            fetch('/api/services/')
          ])

        if (!selectedResponse.ok || !allResponse.ok) {
          throw new Error('Impossible de charger les services.')
        }

        const selectedData = await selectedResponse.json()
        const allData = await allResponse.json()

        const list = Array.isArray(allData)
          ? allData
          : allData.results || []

        if (!active) return

        if (Number(selectedData.prix) <= 0) {
          throw new Error(
            'Seuls les services payants peuvent être réservés.'
          )
        }

        const paidServices = list.filter(
          item => Number(item.prix) > 0
        )

        // Ajouter le service sélectionné s'il manque dans la liste
        const completeList = [
          ...paidServices.filter(
            item => String(item.id) !== String(selectedData.id)
          ),
          selectedData
        ]

        setService(selectedData)
        setAllServices(completeList)

        // Le service initial est attribué à la personne 1
        setAssignments({
          1: [String(selectedData.id)]
        })

      } catch (err) {

        if (active) {
          setError(err.message)
        }

      } finally {

        if (active) {
          setLoading(false)
        }

      }

    }

    loadServices()

    return () => {
      active = false
    }

  }, [serviceId])

  // =====================================
  // CATÉGORIES
  // =====================================

  const categories = useMemo(() => {

    const types = allServices
      .map(item => item.type)
      .filter(Boolean)

    return ['Toutes', ...new Set(types)]

  }, [allServices])

  // =====================================
  // SERVICES SUPPLÉMENTAIRES
  // =====================================

  const otherServices = useMemo(() => {

    return allServices.filter(item => {

      const sameService =
        String(item.id) === String(service?.id)

      const sameCategory =
        category === 'Toutes' || item.type === category

      return !sameService && sameCategory

    })

  }, [allServices, service, category])

  // =====================================
  // PAGINATION
  // =====================================

  const pageCount = Math.max(
    1,
    Math.ceil(otherServices.length / PAGE_SIZE)
  )

  const visibleServices = otherServices.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  )

  // =====================================
  // PERSONNES
  // =====================================

  const people = Array.from(
    { length: Number(persons) || 1 },
    (_, index) => index + 1
  )

  // =====================================
  // ATTRIBUTION DES SERVICES
  // =====================================

  function isAssigned(person, serviceId) {

    return (assignments[person] || []).includes(
      String(serviceId)
    )

  }

  function toggleAssignment(person, serviceId) {

    const id = String(serviceId)

    setAssignments(previous => {

      const current = previous[person] || []

      const alreadySelected = current.includes(id)

      const updated = alreadySelected
        ? current.filter(item => item !== id)
        : [...current, id]

      return {
        ...previous,
        [person]: updated
      }

    })

    setError('')

  }

  // =====================================
  // MODIFICATION DU NOMBRE DE PERSONNES
  // =====================================

  function handlePersonsChange(value) {

    if (value === '') {
      setPersons('')
      return
    }

    const number = Number(value)

    if (!Number.isInteger(number) || number < 1 || number > 20) {
      return
    }

    setPersons(number)

    setAssignments(previous => {

      const updated = {}

      for (let i = 1; i <= number; i++) {
        updated[i] = previous[i] || []
      }

      return updated

    })

  }

  // =====================================
  // SERVICES D'UNE PERSONNE
  // =====================================

  function getPersonServices(person) {

    const ids = assignments[person] || []

    return allServices.filter(item =>
      ids.includes(String(item.id))
    )

  }

  // =====================================
  // TOTAL PAR PERSONNE
  // =====================================

  function getPersonTotal(person) {

    return getPersonServices(person).reduce(
      (sum, item) => sum + Number(item.prix || 0),
      0
    )

  }

  // =====================================
  // TOTAL GENERAL
  // =====================================

  const total = people.reduce(
    (sum, person) => sum + getPersonTotal(person),
    0
  )

  const totalSelected = people.reduce(
    (sum, person) =>
      sum + getPersonServices(person).length,
    0
  )

  // =====================================
  // VALIDATION
  // =====================================

  function handleSubmit(event) {

    event.preventDefault()
    setError('')

    if (!date || date < today) {
      setError('Veuillez choisir une date valide.')
      return
    }

    if (
      !Number.isInteger(Number(persons)) ||
      Number(persons) < 1 ||
      Number(persons) > 20
    ) {
      setError('Veuillez indiquer un nombre de personnes valide.')
      return
    }

    if (totalSelected === 0) {
      setError('Veuillez attribuer au moins un service à une personne.')
      return
    }

    if (!nom.trim() || !email.trim() || !telephone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    // Structure des données préparées pour Django
    const reservationData = {
      servicePrincipal: service.id,
      dateService: date,
      nbrPersonnes: Number(persons),

      client: {
        nom,
        email,
        telephone
      },

      notes,

      personnes: people.map(person => ({
        numero: person,
        services: assignments[person] || [],
        total: getPersonTotal(person)
      })),

      total
    }

    console.log(
      'Réservation personnalisée :',
      reservationData
    )

    setError(
      "La répartition est prête. L'enregistrement dans Django reste à connecter."
    )

  }

  // =====================================
  // CHARGEMENT
  // =====================================

  if (loading) {

    return (
      <div className="service-loading">
        Chargement des services...
      </div>
    )

  }

  if (!service) {

    return (
      <div className="service-loading">

        {error || 'Service introuvable.'}

        <p>
          <a href="/services/">
            Retour aux services
          </a>
        </p>

      </div>
    )

  }

  // =====================================
  // AFFICHAGE
  // =====================================

  return (

    <div className="service-page">

      {/* ÉTAPES */}

      <div className="service-progress">

        <div className="progress-step completed">
          <span>1</span>
          <p>Choix du service</p>
        </div>

        <div className="progress-step active">
          <span>2</span>
          <p>Vos informations</p>
        </div>

        <div className="progress-step">
          <span>3</span>
          <p>Confirmation</p>
        </div>

      </div>

      {/* TITRE */}

      <header className="service-heading">

        <span>ÉTAPE 02 — VOTRE SERVICE</span>

        <h1>Finalisez votre réservation</h1>

        <p>
          Vérifiez les détails de votre réservation et
          personnalisez votre expérience.
        </p>

      </header>

      <form onSubmit={handleSubmit}>

        <div className="service-layout">

          {/* PARTIE GAUCHE */}

          <main className="service-main">

            {/* DÉTAILS */}

            <section className="service-card">

              <h2>Détails de votre réservation</h2>

              <p className="service-description">
                Choisissez la date et le nombre de personnes.
              </p>

              <div className="service-fields">

                <div className="service-field">

                  <label htmlFor="serviceDate">
                    Date du service *
                  </label>

                  <input
                    id="serviceDate"
                    type="date"
                    min={today}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />

                </div>

                <div className="service-field">

                  <label htmlFor="servicePersons">
                    Nombre de personnes *
                  </label>

                  <input
                    id="servicePersons"
                    type="number"
                    min="1"
                    max="20"
                    value={persons}
                    onChange={e =>
                      handlePersonsChange(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

            </section>

            {/* SERVICE PRINCIPAL */}

            <section className="service-card">

              <h2>Votre service sélectionné</h2>

              <p className="service-description">
                Choisissez les personnes qui souhaitent profiter
                de ce service.
              </p>

              <div className="chosen-service">

                {service.image && (
                  <img
                    src={service.image}
                    alt={service.nom}
                  />
                )}

                <div className="chosen-service-info">

                  <span className="service-category">
                    {service.type || 'SERVICE'}
                  </span>

                  <h3>{service.nom}</h3>

                  <p>{service.description}</p>

                  <strong>
                    {money(service.prix)} / personne
                  </strong>

                </div>

              </div>

              <div className="person-assignment">

                <h3>Qui souhaite ce service ?</h3>

                <div className="person-checkboxes">

                  {people.map(person => (

                    <label
                      className="person-option"
                      key={person}
                    >

                      <input
                        type="checkbox"
                        checked={isAssigned(person, service.id)}
                        onChange={() =>
                          toggleAssignment(person, service.id)
                        }
                      />

                      Personne {person}

                    </label>

                  ))}

                </div>

              </div>

            </section>

            {/* INFORMATIONS CLIENT */}

            <section className="service-card">

              <h2>Informations personnelles</h2>

              <p className="service-description">
                Veuillez saisir vos coordonnées.
              </p>

              <div className="service-field">

                <label htmlFor="clientName">
                  Nom complet *
                </label>

                <input
                  id="clientName"
                  type="text"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />

              </div>

              <div className="service-fields">

                <div className="service-field">

                  <label htmlFor="clientEmail">
                    Adresse email *
                  </label>

                  <input
                    id="clientEmail"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                  />

                </div>

                <div className="service-field">

                  <label htmlFor="clientPhone">
                    Téléphone *
                  </label>

                  <input
                    id="clientPhone"
                    type="tel"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="+212..."
                    required
                  />

                </div>

              </div>

              <div className="service-field">

                <label htmlFor="clientNotes">
                  Demandes particulières
                </label>

                <textarea
                  id="clientNotes"
                  rows="3"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Votre demande particulière..."
                />

              </div>

            </section>

          </main>

          {/* RÉCAPITULATIF */}

          <aside className="service-summary">

            <span className="service-category">
              VOTRE RÉSERVATION
            </span>

            <h2>Récapitulatif</h2>

            <div className="summary-line">
              <span>Date</span>
              <strong>{date || 'Non définie'}</strong>
            </div>

            <div className="summary-line">
              <span>Personnes</span>
              <strong>{persons || 1}</strong>
            </div>

            <hr />

            {/* RÉCAPITULATIF PAR PERSONNE */}

            {people.map(person => {

              const personServices =
                getPersonServices(person)

              const personTotal =
                getPersonTotal(person)

              return (

                <div
                  className="person-summary"
                  key={person}
                >

                  <h3>Personne {person}</h3>

                  {personServices.length === 0 ? (

                    <p className="empty-person">
                      Aucun service sélectionné.
                    </p>

                  ) : (

                    personServices.map(item => (

                      <div
                        className="summary-service"
                        key={item.id}
                      >

                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.nom}
                          />
                        )}

                        <div>

                          <h4>{item.nom}</h4>

                          <p>{money(item.prix)}</p>

                        </div>

                        <button
                          type="button"
                          className="remove-service"
                          onClick={() =>
                            toggleAssignment(person, item.id)
                          }
                          aria-label={`Retirer ${item.nom} de la personne ${person}`}
                        >
                          ×
                        </button>

                      </div>

                    ))

                  )}

                  <div className="person-total">

                    <span>Total personne {person}</span>

                    <strong>{money(personTotal)}</strong>

                  </div>

                </div>

              )

            })}

            <hr />

            <div className="summary-total">

              <span>Total estimé</span>

              <strong>{money(total)}</strong>

            </div>

            <p className="summary-note">
              Le total correspond aux services réellement
              attribués à chaque personne.
            </p>

          </aside>

        </div>

        {/* SERVICES SUPPLÉMENTAIRES */}

        <section className="service-card additional-services">

          <div className="additional-heading">

            <div className="additional-title">

              <span className="service-category">
                PERSONNALISEZ VOTRE SÉJOUR
              </span>

              <h2>Services supplémentaires</h2>

              <p className="service-description">
                Choisissez les services et attribuez-les
                aux personnes concernées.
              </p>

            </div>

            <div className="additional-filters">

              <label htmlFor="serviceCategory">
                Catégorie
              </label>

              <select
                id="serviceCategory"
                value={category}
                onChange={e => {
                  setCategory(e.target.value)
                  setPage(0)
                }}
              >

                {categories.map(item => (

                  <option key={item} value={item}>
                    {item}
                  </option>

                ))}

              </select>

              <span className="paid-only-badge">
                Payants uniquement
              </span>

            </div>

          </div>

          {otherServices.length === 0 ? (

            <p className="service-description">
              Aucun autre service payant disponible dans cette catégorie.
            </p>

          ) : (

            <div className="additional-services-grid">

              {visibleServices.map(item => {

                const selectedForSomeone =
                  people.some(person =>
                    isAssigned(person, item.id)
                  )

                return (

                  <article
                    className={`additional-service-card ${
                      selectedForSomeone ? 'selected' : ''
                    }`}
                    key={item.id}
                  >

                    <div className="additional-image-wrapper">

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.nom}
                          className="additional-service-image"
                        />

                      ) : (

                        <div className="additional-image-placeholder">
                          Auberge
                        </div>

                      )}

                    </div>

                    <div className="additional-service-content">

                      <h3>{item.nom}</h3>

                      <strong>{money(item.prix)}</strong>

                      <p>{item.description}</p>

                      <span className="service-type">
                        {item.type || 'Service'}
                      </span>

                      {/* ATTRIBUTION PAR PERSONNE */}

                      <div className="service-person-list">

                        <span className="assign-label">
                          Attribuer à :
                        </span>

                        {people.map(person => (

                          <label
                            className="person-option"
                            key={person}
                          >

                            <input
                              type="checkbox"
                              checked={isAssigned(person, item.id)}
                              onChange={() =>
                                toggleAssignment(person, item.id)
                              }
                            />

                            Personne {person}

                          </label>

                        ))}

                      </div>

                    </div>

                  </article>

                )

              })}

            </div>

          )}

          {/* PAGINATION */}

          {pageCount > 1 && (

            <div className="service-pagination">

              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage(value => value - 1)
                }
              >
                ← Précédent
              </button>

              <span>
                {page + 1} / {pageCount}
              </span>

              <button
                type="button"
                disabled={page >= pageCount - 1}
                onClick={() =>
                  setPage(value => value + 1)
                }
              >
                Suivant →
              </button>

            </div>

          )}

        </section>

        {/* ERREUR */}

        {error && (

          <div
            className="service-error"
            role="alert"
          >
            {error}
          </div>

        )}

        {/* ACTIONS */}

        <div className="service-actions">

          <button
            type="button"
            onClick={() =>
              window.location.href = '/services/'
            }
          >
            ← Retour aux services
          </button>

          <button
            type="submit"
            className="service-submit"
          >
            Confirmer ma réservation →
          </button>

        </div>

      </form>

    </div>

  )

}

export default ServiceReservationPage
