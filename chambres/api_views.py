
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.db.models import Q

from .models import Chambre
from .serializers import ChambreSerializer


class ChambreViewSet(viewsets.ModelViewSet):

    queryset = Chambre.objects.all()
    serializer_class = ChambreSerializer

    # À utiliser pour les tests.
    # À remplacer par une permission adaptée en production.
    permission_classes = [AllowAny]

    def get_queryset(self):

        chambres = Chambre.objects.all()

        # Recherche par numéro ou type
        recherche = self.request.query_params.get(
            'recherche', ''
        ).strip()

        # Filtrage par type
        type_chambre = self.request.query_params.get(
            'type', ''
        )

        # Filtrage par statut
        statut = self.request.query_params.get(
            'statut', ''
        )

        if recherche:
            chambres = chambres.filter(
                Q(numChambre__icontains=recherche) |
                Q(type__icontains=recherche)
            )

        if type_chambre:
            chambres = chambres.filter(type=type_chambre)

        if statut:
            chambres = chambres.filter(statut=statut)

        return chambres
