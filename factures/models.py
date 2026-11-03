from django.db import models

# Create your models here.
from django.db import models
from django.core.exceptions import ValidationError


class Facture(models.Model):

    reservation = models.OneToOneField(
        'reservations.Reservation',
        on_delete=models.PROTECT,
        related_name='facture'
    )

    dateEmission = models.DateField(auto_now_add=True)

    montantChambres = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    montantServices = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    montantTotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    STATUT_CHOICES = [
        ('non_payee', 'Non payée'),
        ('payee', 'Payée'),
    ]

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='non_payee'
    )

    paymentMode = models.CharField(
        max_length=20,
        choices=[
            ('especes', 'Espèces'),
            ('carte', 'Carte bancaire'),
            ('virement', 'Virement'),
        ],
        blank=True
    )

    pdfFile = models.FileField(
        upload_to='factures/',
        blank=True,
        null=True
    )

    def calculer_total(self):
        nombre_nuits = (
            self.reservation.dateDepart -
            self.reservation.dateArrivee
        ).days

        if nombre_nuits <= 0:
            raise ValidationError(
                "La date de départ doit être après la date d'arrivée."
            )

        self.montantChambres = sum(
            (chambre.prix * nombre_nuits
             for chambre in self.reservation.chambres.all()),
            0
        )

        self.montantServices = sum(
            (service.prix
             for service in self.reservation.services.all()),
            0
        )

        self.montantTotal = (
            self.montantChambres + self.montantServices
        )

        self.save()

    def __str__(self):
        return f"Facture {self.id}"