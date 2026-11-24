
from datetime import date
from decimal import Decimal

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from chambres.models import Chambre
from services.models import Service
from .models import Reservation

from .controllers import (
    validate_reservation_data,
    confirm_reservation,
    cancel_reservation,
    finish_reservation,
)


Utilisateur = get_user_model()


class ReservationControllerTests(TestCase):

    def setUp(self):
        """
        Prepare test data before each test.
        """

        # Create a test user
        self.user = Utilisateur.objects.create_user(
            username='testclient',
            password='Test12345!',
            nom='Test',
            prenom='Client',
            email='test@example.com',
            numTelephone='0600000000'
        )

        # Create available rooms
        self.chambre1 = Chambre.objects.create(
            numChambre='101',
            type='Simple',
            capacite=2,
            prix=Decimal('200.00'),
            statut='disponible'
        )

        self.chambre2 = Chambre.objects.create(
            numChambre='102',
            type='Double',
            capacite=3,
            prix=Decimal('300.00'),
            statut='disponible'
        )

        # Create a room under maintenance
        self.chambre_maintenance = Chambre.objects.create(
            numChambre='103',
            type='Simple',
            capacite=2,
            prix=Decimal('150.00'),
            statut='maintenance'
        )

        # Create an optional service
        self.service = Service.objects.create(
            nom='Petit dejeuner',
            prix=Decimal('50.00'),
            description='Breakfast service',
            type='Restauration'
        )

        # Reservation dates
        self.arrivee = date(2026, 12, 10)
        self.depart = date(2026, 12, 15)

    def create_reservation(
        self,
        chambres=None,
        statut='en_attente',
        date_arrivee=None,
        date_depart=None,
        nbr_personnes=2
    ):
        """
        Helper method to create a reservation.
        """

        reservation = Reservation.objects.create(
            utilisateur=self.user,
            dateArrivee=date_arrivee or self.arrivee,
            dateDepart=date_depart or self.depart,
            nbrPersonnes=nbr_personnes,
            statut=statut
        )

        reservation.chambres.set(
            chambres if chambres is not None else [self.chambre1]
        )

        return reservation

    # ==========================================
    # TEST 1: VALIDATION
    # ==========================================

    def test_valid_reservation(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.depart,
            'nbrPersonnes': 2,
            'chambres': [self.chambre1],
        }

        result = validate_reservation_data(data)

        self.assertTrue(result)

    def test_reservation_without_room(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.depart,
            'nbrPersonnes': 2,
            'chambres': [],
        }

        with self.assertRaises(ValidationError):
            validate_reservation_data(data)

    def test_invalid_departure_date(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.arrivee,
            'nbrPersonnes': 2,
            'chambres': [self.chambre1],
        }

        with self.assertRaises(ValidationError):
            validate_reservation_data(data)

    def test_zero_persons(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.depart,
            'nbrPersonnes': 0,
            'chambres': [self.chambre1],
        }

        with self.assertRaises(ValidationError):
            validate_reservation_data(data)

    def test_exceed_room_capacity(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.depart,
            'nbrPersonnes': 3,
            'chambres': [self.chambre1],
        }

        with self.assertRaises(ValidationError):
            validate_reservation_data(data)

    def test_multiple_rooms_capacity(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.depart,
            'nbrPersonnes': 5,
            'chambres': [self.chambre1, self.chambre2],
        }

        self.assertTrue(validate_reservation_data(data))

    def test_room_under_maintenance(self):
        data = {
            'dateArrivee': self.arrivee,
            'dateDepart': self.depart,
            'nbrPersonnes': 2,
            'chambres': [self.chambre_maintenance],
        }

        with self.assertRaises(ValidationError):
            validate_reservation_data(data)

    # ==========================================
    # TEST 2: ROOM AVAILABILITY
    # ==========================================

    def test_overlapping_confirmed_reservation(self):
        self.create_reservation(statut='confirmee')

        data = {
            'dateArrivee': date(2026, 12, 12),
            'dateDepart': date(2026, 12, 18),
            'nbrPersonnes': 2,
            'chambres': [self.chambre1],
            'statut': 'confirmee',
        }

        with self.assertRaises(ValidationError):
            validate_reservation_data(data)

    def test_non_overlapping_reservation(self):
        self.create_reservation(statut='confirmee')

        data = {
            'dateArrivee': date(2026, 12, 15),
            'dateDepart': date(2026, 12, 20),
            'nbrPersonnes': 2,
            'chambres': [self.chambre1],
            'statut': 'confirmee',
        }

        self.assertTrue(validate_reservation_data(data))

    def test_cancelled_reservation_does_not_block_room(self):
        self.create_reservation(statut='annulee')

        data = {
            'dateArrivee': date(2026, 12, 12),
            'dateDepart': date(2026, 12, 18),
            'nbrPersonnes': 2,
            'chambres': [self.chambre1],
            'statut': 'confirmee',
        }

        self.assertTrue(validate_reservation_data(data))

    def test_update_does_not_conflict_with_itself(self):
        reservation = self.create_reservation(
            statut='confirmee'
        )

        data = {
            'statut': 'confirmee',
        }

        self.assertTrue(
            validate_reservation_data(data, instance=reservation)
        )

    # ==========================================
    # TEST 3: CONFIRMATION
    # ==========================================

    def test_confirm_pending_reservation(self):
        reservation = self.create_reservation()

        result = confirm_reservation(reservation)

        self.assertEqual(result.statut, 'confirmee')

    def test_cannot_confirm_cancelled_reservation(self):
        reservation = self.create_reservation(
            statut='annulee'
        )

        with self.assertRaises(ValidationError):
            confirm_reservation(reservation)

    def test_cannot_confirm_overlapping_reservation(self):
        self.create_reservation(statut='confirmee')

        reservation = self.create_reservation(
            chambres=[self.chambre1],
            statut='en_attente',
            date_arrivee=date(2026, 12, 12),
            date_depart=date(2026, 12, 18)
        )

        with self.assertRaises(ValidationError):
            confirm_reservation(reservation)

    # ==========================================
    # TEST 4: CANCELLATION
    # ==========================================

    def test_cancel_pending_reservation(self):
        reservation = self.create_reservation()

        result = cancel_reservation(reservation)

        self.assertEqual(result.statut, 'annulee')

    def test_cancel_confirmed_reservation(self):
        reservation = self.create_reservation(
            statut='confirmee'
        )

        result = cancel_reservation(reservation)

        self.assertEqual(result.statut, 'annulee')

    def test_cannot_cancel_finished_reservation(self):
        reservation = self.create_reservation(
            statut='terminee'
        )

        with self.assertRaises(ValidationError):
            cancel_reservation(reservation)

    # ==========================================
    # TEST 5: FINISHING
    # ==========================================

    def test_finish_confirmed_reservation(self):
        reservation = self.create_reservation(
            statut='confirmee'
        )

        result = finish_reservation(reservation)

        self.assertEqual(result.statut, 'terminee')

    def test_cannot_finish_pending_reservation(self):
        reservation = self.create_reservation()

        with self.assertRaises(ValidationError):
            finish_reservation(reservation)
