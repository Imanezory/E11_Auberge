
from django.db import models
from django.conf import settings


class Reservation(models.Model):

    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='reservations'
    )

    chambres = models.ManyToManyField(
        'chambres.Chambre',
        related_name='reservations'
    )

    services = models.ManyToManyField(
        'services.Service',
        related_name='reservations',
        blank=True
    )

    dateArrivee = models.DateField()
    dateDepart = models.DateField()

    nbrPersonnes = models.PositiveIntegerField()

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('payee', 'Payée'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
    ]

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )

    def __str__(self):
        return f"Reservation {self.id}"
