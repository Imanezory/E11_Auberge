from django.db import models


class Chambre(models.Model):

    numChambre = models.CharField(
        max_length=10,
        unique=True
    )

    TYPE_CHOICES = [
        ('simple', 'Chambre simple'),
        ('double', 'Chambre double'),
        ('suite', 'Suite'),
        ('familiale', 'Chambre familiale'),
    ]

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='simple'
    )

    capacite = models.PositiveIntegerField()

    prix = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to='chambres/',
        null=True,
        blank=True
    )

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