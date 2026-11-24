
from rest_framework import serializers
from .models import Facture


class FactureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Facture

        fields = [
            "id",
            "reservation_id",
            "client_id",
            "date_emission",
            "date_paiement",
            "montant_chambres",
            "montant_services",
            "montant_total",
            "devise",
            "statut",
            "pdf_file",
        ]

        read_only_fields = fields
