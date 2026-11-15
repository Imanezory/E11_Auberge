
from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase

from rest_framework import status
from rest_framework.test import APIClient

from chambres.models import Chambre
from services.models import Service
from reservations.models import Reservation


Utilisateur = get_user_model()


class ReservationAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Create first user
        self.user = Utilisateur.objects.create_user(
            username="api_client",
            password="Test12345!",
            nom="Test",
            prenom="Client",
            email="api@example.com",
            numTelephone="0600000000",
        )

        # Create another user
        self.other_user = Utilisateur.objects.create_user(
            username="other_client",
            password="Test12345!",
            nom="Other",
            prenom="Client",
            email="other@example.com",
            numTelephone="0611111111",
        )

        # Create staff user
        self.staff = Utilisateur.objects.create_user(
            username="api_staff",
            password="Test12345!",
            nom="Admin",
            prenom="Staff",
            email="staff@example.com",
            numTelephone="0622222222",
            is_staff=True,
        )

        # Create rooms
        self.room = Chambre.objects.create(
            numChambre="201",
            type="Simple",
            capacite=2,
            prix=Decimal("200.00"),
            statut="disponible",
        )

        self.maintenance_room = Chambre.objects.create(
            numChambre="202",
            type="Simple",
            capacite=2,
            prix=Decimal("150.00"),
            statut="maintenance",
        )

        # Create service
        self.service = Service.objects.create(
            nom="Petit dejeuner",
            prix=Decimal("50.00"),
            description="Breakfast service",
            type="Restauration",
        )

        self.arrivee = date(2026, 12, 10)
        self.depart = date(2026, 12, 15)

        self.list_url = reverse("reservation-list")

        self.client.force_authenticate(user=self.user)

    def reservation_data(self):
        return {
            "chambres": [self.room.id],
            "services": [],
            "dateArrivee": str(self.arrivee),
            "dateDepart": str(self.depart),
            "nbrPersonnes": 2,
            "statut": "en_attente",
        }

    def create_reservation(self, user=None):
        reservation = Reservation.objects.create(
            utilisateur=user or self.user,
            dateArrivee=self.arrivee,
            dateDepart=self.depart,
            nbrPersonnes=2,
            statut="en_attente",
        )
        reservation.chambres.add(self.room)
        return reservation

    # -------------------------------
    # Authentication tests
    # -------------------------------

    def test_unauthenticated_user_cannot_list_reservations(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.list_url)

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED,
             status.HTTP_403_FORBIDDEN],
        )

    # -------------------------------
    # List and retrieve tests
    # -------------------------------

    def test_user_can_list_own_reservations(self):
        self.create_reservation()

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_user_cannot_see_other_users_reservations(self):
        self.create_reservation(user=self.other_user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_staff_can_see_all_reservations(self):
        self.create_reservation(user=self.user)
        self.create_reservation(user=self.other_user)

        self.client.force_authenticate(user=self.staff)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_user_can_retrieve_own_reservation(self):
        reservation = self.create_reservation()

        url = reverse(
            "reservation-detail",
            args=[reservation.id],
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], reservation.id)

    def test_user_cannot_retrieve_other_users_reservation(self):
        reservation = self.create_reservation(user=self.other_user)

        url = reverse(
            "reservation-detail",
            args=[reservation.id],
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # -------------------------------
    # Create and update tests
    # -------------------------------

    def test_user_can_create_reservation(self):
        response = self.client.post(
            self.list_url,
            self.reservation_data(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        reservation = Reservation.objects.get(
            id=response.data["id"]
        )

        self.assertEqual(reservation.utilisateur, self.user)
        self.assertEqual(reservation.statut, "en_attente")

    def test_user_cannot_create_reservation_with_maintenance_room(self):
        data = self.reservation_data()
        data["chambres"] = [self.maintenance_room.id]

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_cannot_create_reservation_with_invalid_dates(self):
        data = self.reservation_data()
        data["dateDepart"] = "2026-12-09"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_update_own_reservation(self):
        reservation = self.create_reservation()

        url = reverse(
            "reservation-detail",
            args=[reservation.id],
        )

        response = self.client.patch(
            url,
            {"nbrPersonnes": 1},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        reservation.refresh_from_db()
        self.assertEqual(reservation.nbrPersonnes, 1)

    # -------------------------------
    # Reservation action tests
    # -------------------------------

    def test_user_can_confirm_reservation(self):
        reservation = self.create_reservation()

        url = reverse(
            "reservation-confirm",
            args=[reservation.id],
        )

        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        reservation.refresh_from_db()
        self.assertEqual(reservation.statut, "confirmee")

    def test_user_can_cancel_reservation(self):
        reservation = self.create_reservation()

        url = reverse(
            "reservation-cancel",
            args=[reservation.id],
        )

        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        reservation.refresh_from_db()
        self.assertEqual(reservation.statut, "annulee")

    def test_user_can_finish_confirmed_reservation(self):
        reservation = self.create_reservation()
        reservation.statut = "confirmee"
        reservation.save()

        url = reverse(
            "reservation-finish",
            args=[reservation.id],
        )

        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        reservation.refresh_from_db()
        self.assertEqual(reservation.statut, "terminee")

    def test_cannot_finish_pending_reservation(self):
        reservation = self.create_reservation()

        url = reverse(
            "reservation-finish",
            args=[reservation.id],
        )

        response = self.client.patch(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        reservation.refresh_from_db()
        self.assertEqual(reservation.statut, "en_attente")
