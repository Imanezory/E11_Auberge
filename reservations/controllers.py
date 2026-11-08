
from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import Reservation


def validate_reservation_data(data, instance=None):
    """
    Validate the business rules of a reservation.
    """

    date_arrivee = data.get(
        'dateArrivee',
        getattr(instance, 'dateArrivee', None)
    )

    date_depart = data.get(
        'dateDepart',
        getattr(instance, 'dateDepart', None)
    )

    nbr_personnes = data.get(
        'nbrPersonnes',
        getattr(instance, 'nbrPersonnes', None)
    )

    if 'chambres' in data:
        chambres = data['chambres']
    elif instance:
        chambres = list(instance.chambres.all())
    else:
        chambres = []

    # 1. At least one room
    if not chambres:
        raise ValidationError({
            'chambres': 'At least one room must be selected.'
        })

    # 2. Validate dates
    if date_arrivee and date_depart:
        if date_depart <= date_arrivee:
            raise ValidationError({
                'dateDepart': 'Departure must be after arrival.'
            })

    # 3. Check room maintenance
    for chambre in chambres:
        if chambre.statut == 'maintenance':
            raise ValidationError({
                'chambres': f'Room {chambre.numChambre} is under maintenance.'
            })

    # 4. Check total room capacity
    if nbr_personnes is not None:
        capacite_totale = sum(
            chambre.capacite for chambre in chambres
        )

        if nbr_personnes < 1 or nbr_personnes > capacite_totale:
            raise ValidationError({
                'nbrPersonnes': (
                    f'Number of guests must be between 1 '
                    f'and {capacite_totale}.'
                )
            })

    # 5. Check overlapping confirmed reservations
    statut = data.get(
        'statut',
        getattr(instance, 'statut', 'en_attente')
    )

    if statut == 'confirmee' and date_arrivee and date_depart:

        existing = Reservation.objects.filter(
            chambres__in=chambres,
            statut='confirmee',
            dateArrivee__lt=date_depart,
            dateDepart__gt=date_arrivee,
        ).distinct()

        if instance:
            existing = existing.exclude(pk=instance.pk)

        if existing.exists():
            raise ValidationError({
                'chambres': (
                    'One or more rooms are already reserved '
                    'during this period.'
                )
            })

    return True


@transaction.atomic
def confirm_reservation(reservation):
    """
    Confirm a pending reservation after validating its information.
    """

    if reservation.statut != 'en_attente':
        raise ValidationError(
            'Only pending reservations can be confirmed.'
        )

    validate_reservation_data(
        {'statut': 'confirmee'},
        instance=reservation
    )

    reservation.statut = 'confirmee'
    reservation.save(update_fields=['statut'])

    return reservation


@transaction.atomic
def cancel_reservation(reservation):
    """
    Cancel a pending or confirmed reservation.
    """

    if reservation.statut not in ['en_attente', 'confirmee']:
        raise ValidationError(
            'This reservation cannot be cancelled.'
        )

    reservation.statut = 'annulee'
    reservation.save(update_fields=['statut'])

    return reservation


@transaction.atomic
def finish_reservation(reservation):
    """
    Finish a confirmed reservation.
    """

    if reservation.statut != 'confirmee':
        raise ValidationError(
            'Only confirmed reservations can be finished.'
        )

    reservation.statut = 'terminee'
    reservation.save(update_fields=['statut'])

    return reservation
