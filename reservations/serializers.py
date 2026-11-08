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

        # Get values from request or existing reservation
        date_arrivee = data.get(
            'dateArrivee',
            getattr(self.instance, 'dateArrivee', None)
        )

        date_depart = data.get(
            'dateDepart',
            getattr(self.instance, 'dateDepart', None)
        )

        nbr_personnes = data.get(
            'nbrPersonnes',
            getattr(self.instance, 'nbrPersonnes', None)
        )

        if 'chambres' in data:
            chambres = data['chambres']
        elif self.instance:
            chambres = list(self.instance.chambres.all())
        else:
            chambres = []

        # Check that at least one room is selected
        if not chambres:
            raise serializers.ValidationError({
                'chambres': 'Vous devez sélectionner au moins une chambre.'
            })

        # Check dates
        if date_arrivee and date_depart:
            if date_depart <= date_arrivee:
                raise serializers.ValidationError({
                    'dateDepart':
                        "La date de départ doit être postérieure à la date d'arrivée."
                })

        # Check room maintenance status
        for chambre in chambres:
            if chambre.statut == 'maintenance':
                raise serializers.ValidationError({
                    'chambres':
                        f"La chambre {chambre.numChambre} est en maintenance."
                })

        # Check total capacity
        if nbr_personnes is not None:
            capacite_totale = sum(
                chambre.capacite for chambre in chambres
            )

            if nbr_personnes < 1 or nbr_personnes > capacite_totale:
                raise serializers.ValidationError({
                    'nbrPersonnes':
                        f"Le nombre de personnes doit être compris entre 1 et {capacite_totale}."
                })

        # Check overlapping confirmed reservations
        statut = data.get(
            'statut',
            getattr(self.instance, 'statut', 'en_attente')
        )

        if statut == 'confirmee' and date_arrivee and date_depart:

            reservations_existantes = Reservation.objects.filter(
                chambres__in=chambres,
                statut='confirmee',
                dateArrivee__lt=date_depart,
                dateDepart__gt=date_arrivee,
            ).distinct()

            # Exclude current reservation during update
            if self.instance:
                reservations_existantes = reservations_existantes.exclude(
                    pk=self.instance.pk
                )

            if reservations_existantes.exists():
                raise serializers.ValidationError({
                    'chambres':
                        "Une ou plusieurs chambres sont déjà réservées pendant cette période."
                })

        return data