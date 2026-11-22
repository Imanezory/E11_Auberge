from django.test import TestCase
import unittest
from decimal import Decimal
from services.controllers import ServiceController


class ServiceControllerTest(unittest.TestCase):

    def setUp(self):
        self.controller = ServiceController()

    # TEST 1 : Ajouter un service valide
    def test_ajouter_service_valide(self):
        service = self.controller.ajouter_service(
            "Petit déjeuner", 50,
            "Petit déjeuner complet", "Restauration"
        )

        self.assertEqual(service["nom"], "Petit déjeuner")
        self.assertEqual(service["prix"], Decimal("50"))
        self.assertEqual(len(self.controller.services), 1)

    # TEST 2 : Refuser un prix négatif
    def test_ajouter_service_prix_negatif(self):
        with self.assertRaises(ValueError):
            self.controller.ajouter_service(
                  "Déjeuner",
                -200,
                "Service de déjeuner",
                "Restauration"
            )
        self.assertEqual(len(self.controller.services), 0)

    # TEST 3 : Rechercher un service inexistant
    def test_rechercher_service_inexistant(self):
        resultat = self.controller.rechercher_service(99)

        self.assertIsNone(resultat)

    # TEST 4 : Modifier un service existant
    def test_modifier_service_existant(self):
        service = self.controller.ajouter_service(
            "Petit déjeuner", 50,
            "Petit déjeuner", "Restauration"
        )

        resultat = self.controller.modifier_service(
            service["id"], "Petit déjeuner VIP", 80
        )

        self.assertTrue(resultat)
        self.assertEqual(service["nom"], "Petit déjeuner VIP")
        self.assertEqual(service["prix"], Decimal("80"))


if __name__ == "__main__":
    unittest.main()
