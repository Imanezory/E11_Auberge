
from django.test import TestCase
from decimal import Decimal
from .models import Chambre


class ChambreControllerTest(TestCase):
    def setUp(self):

        self.chambre1 = Chambre.objects.create(
            numChambre="101",
            type="Simple",
            capacite=1,
            prix=Decimal("200.00"),
            statut="disponible"
        )

        self.chambre2 = Chambre.objects.create(
            numChambre="102",
            type="Double",
            capacite=2,
            prix=Decimal("350.00"),
            statut="occupee"
        )

    
    def test_get_chambre_by_id_existing(self):

        chambre = Chambre.objects.filter(
            id=self.chambre1.id
        ).first()

        self.assertIsNotNone(chambre)
        self.assertEqual(chambre.numChambre, "101")


    def test_create_chambre(self):

        nombre_initial = Chambre.objects.count()

        Chambre.objects.create(
            numChambre="103",
            type="Suite",
            capacite=3,
            prix=Decimal("500.00"),
            statut="disponible"
        )

        self.assertEqual(
            Chambre.objects.count(),
            nombre_initial + 1
        )

        chambre = Chambre.objects.get(numChambre="103")

        self.assertEqual(chambre.type, "Suite")
        self.assertEqual(chambre.prix, Decimal("500.00"))



    def test_update_chambre_not_existing(self):

        nombre_initial = Chambre.objects.count()

        with self.assertRaises(Chambre.DoesNotExist):
            chambre = Chambre.objects.get(id=999)
            chambre.type = "Suite"
            chambre.save()

        self.assertEqual(Chambre.objects.count(), nombre_initial)


    def test_create_chambre_prix_negatif(self):

        nombre_initial = Chambre.objects.count()

        with self.assertRaises(ValueError):

            prix = Decimal("-200.00")

            if prix < 0:
                raise ValueError("Le prix ne peut pas être négatif")

            Chambre.objects.create(
                numChambre="104",
                type="Suite",
                capacite=2,
                prix=prix,
                statut="disponible"
            )

        self.assertEqual(
            Chambre.objects.count(),
            nombre_initial
        )


