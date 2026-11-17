
from django.db import models


# ===== MODELE SERVICE =====
class Service(models.Model):
    nom = models.CharField(max_length=100)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.nom


# ===== RESERVATION DIRECTE D'UN SERVICE =====
class ReservationService(models.Model):

    STATUTS = [
        ("confirmee", "Confirmée"),
        ("annulee", "Annulée"),
    ]

    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name="reservations_directes"
    )

    nom_client = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)

    date = models.DateField()
    heure = models.TimeField()

    nombre_personnes = models.PositiveIntegerField(default=1)

    statut = models.CharField(
        max_length=20,
        choices=STATUTS,
        default="confirmee"
    )

    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom_client} - {self.service.nom}"
