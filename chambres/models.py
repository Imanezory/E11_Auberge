from django.db import models

# Create your models here.
from django.db import models


class Chambre(models.Model):
    numChambre = models.CharField(max_length=10, unique=True)
    type = models.CharField(max_length=50)
    capacite = models.PositiveIntegerField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)

    STATUT_CHOICES = [
        ('disponible', 'Disponible'),
        ('occupee', 'Occupée'),
        ('maintenance', 'Maintenance'),
    ]

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='disponible'
    )

    def __str__(self):
        return self.numChambre