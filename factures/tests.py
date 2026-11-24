
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase

from .controllers import FactureController


class CalculFactureTests(TestCase):

    def setUp(self):
        self.controller = FactureController()

    # Test 1 : Calcul du montant des chambres
    def test_calcul_montant_chambres(self):
        reservation = {"montant_chambres": 500}

        resultat = self.controller.calculer_montant_chambres(
            reservation
        )

        self.assertEqual(resultat, Decimal("500"))

    # Test 2 : Calcul du montant des services
    def test_calcul_montant_services(self):
        services = [
            {"prix": 100, "quantite": 2},
            {"prix": 50, "quantite": 1}
        ]

        resultat = self.controller.calculer_montant_services(
            services
        )

        self.assertEqual(resultat, Decimal("250"))

    # Test 3 : Calcul du montant total
    def test_calcul_montant_total(self):
        resultat = self.controller.calculer_montant_total(
            500, 250
        )

        self.assertEqual(resultat, Decimal("750"))

    # Test 4 : Refuser un montant négatif
    def test_refuser_montant_negatif(self):
        with self.assertRaises(ValueError):
            self.controller.calculer_montant_total(500, -100)

    # Test 5 : Création d'une facture
    @patch("factures.controllers.Facture.objects.get_or_create")
    def test_creer_facture(self, mock_get_or_create):

        mock_get_or_create.return_value = (None, True)

        reservation = {
            "id": 15,
            "client_id": 8,
            "montant_chambres": 500
        }

        services = [
            {"prix": 100, "quantite": 2}
        ]

        self.controller.creer_facture(reservation, services)

        mock_get_or_create.assert_called_once_with(
            reservation_id=15,
            defaults={
                "client_id": 8,
                "montant_chambres": Decimal("500"),
                "montant_services": Decimal("200"),
                "montant_total": Decimal("700"),
                "statut": "non_payee",
            }
        )


class CreationFactureTests(TestCase):

    def setUp(self):
        self.controller = FactureController()

    # Test 6 : Vérifier la création d'une facture
    @patch("factures.controllers.Facture.objects.get_or_create")
    def test_creer_facture(self, mock_get_or_create):

        mock_get_or_create.return_value = (None, True)

        reservation = {
            "id": 15,
            "client_id": 8,
            "montant_chambres": 500
        }

        services = [
            {"prix": 100, "quantite": 2}
        ]

        self.controller.creer_facture(reservation, services)

        mock_get_or_create.assert_called_once_with(
            reservation_id=15,
            defaults={
                "client_id": 8,
                "montant_chambres": Decimal("500"),
                "montant_services": Decimal("200"),
                "montant_total": Decimal("700"),
                "statut": "non_payee",
            }
        )
