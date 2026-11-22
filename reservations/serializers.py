from .controllers import validate_reservation_data
from rest_framework import serializers
from .models import Reservation
from chambres.models import Chambre


class ReservationSerializer(serializers.ModelSerializer):

    # Accept room IDs from the frontend
    chambres = serializers.PrimaryKeyRelatedField(
        queryset=Chambre.objects.all(),
        many=True
    )

    # Allow the four statuses from your requirements
    statut = serializers.CharField(required=False)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'utilisateur',
            'chambres',
            'services',
            'dateArrivee',
            'dateDepart',
            'nbrPersonnes',
            'statut',
        ]
        read_only_fields = ['id', 'utilisateur']

    def validate_statut(self, value):
        allowed_statuses = [
            'en_attente',
            'confirmee',
            'annulee',
            'terminee',
        ]

        if value not in allowed_statuses:
            raise serializers.ValidationError(
                "Statut invalide."
            )

        return value

    def validate(self, data):
        validate_reservation_data(data, instance=self.instance)
        return data