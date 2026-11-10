from django.db import models


class Facture(models.Model):

    STATUT_CHOICES = [
        ("non_payee", "Non payée"),
        ("payee", "Payée"),
    ]

    reservation_id = models.PositiveIntegerField(unique=True)
    client_id = models.PositiveIntegerField()

    date_emission = models.DateTimeField(auto_now_add=True)

    montant_chambres = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    montant_services = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    montant_total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default="non_payee"
    )

    pdf_file = models.FileField(
        upload_to="factures/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Facture {self.id} - Réservation {self.reservation_id}"
