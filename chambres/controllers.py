
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status

from .models import Chambre
from .controllers import (
    get_all_chambres,
    get_chambre_by_id,
    create_chambre,
    update_chambre,
    delete_chambre,
    get_chambres_disponibles
)


# Conversion d'une chambre en dictionnaire JSON
def chambre_to_dict(chambre, request=None):
    return {
        'id': chambre.id,
        'numChambre': chambre.numChambre,
        'type': chambre.type,
        'capacite': chambre.capacite,
        'prix': str(chambre.prix),
        'statut': chambre.statut,
        'image': (
            request.build_absolute_uri(chambre.image.url)
            if chambre.image and request
            else chambre.image.url if chambre.image
            else None
        )
    }


# 1. Liste des chambres et ajout
@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def chambres_list(request):

    # GET : récupérer toutes les chambres
    if request.method == 'GET':
        chambres = get_all_chambres()

        data = [
            chambre_to_dict(chambre, request)
            for chambre in chambres
        ]

        return Response(data, status=status.HTTP_200_OK)

    # POST : ajouter une chambre
    if request.method == 'POST':

        data = request.data

        champs_obligatoires = [
            'numChambre',
            'type',
            'capacite',
            'prix'
        ]

        for champ in champs_obligatoires:
            if champ not in data:
                return Response(
                    {'error': f'Le champ {champ} est obligatoire'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if Chambre.objects.filter(
            numChambre=data['numChambre']
        ).exists():
            return Response(
                {'error': 'Ce numéro de chambre existe déjà'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            chambre = create_chambre(data)

            return Response(
                chambre_to_dict(chambre, request),
                status=status.HTTP_201_CREATED
            )

        except (ValueError, TypeError, KeyError):
            return Response(
                {'error': 'Données invalides'},
                status=status.HTTP_400_BAD_REQUEST
            )


# 2. Détail, modification et suppression
@api_view(['GET', 'PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def chambre_detail(request, chambre_id):

    chambre = get_chambre_by_id(chambre_id)

    if chambre is None:
        return Response(
            {'error': 'Chambre introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET : récupérer une chambre
    if request.method == 'GET':
        return Response(
            chambre_to_dict(chambre, request),
            status=status.HTTP_200_OK
        )

    # PUT : modifier une chambre
    elif request.method == 'PUT':

        data = request.data

        if 'numChambre' in data:
            numero_existe = Chambre.objects.filter(
                numChambre=data['numChambre']
            ).exclude(id=chambre_id).exists()

            if numero_existe:
                return Response(
                    {'error': 'Ce numéro de chambre existe déjà'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            chambre = update_chambre(chambre_id, data)

            return Response(
                chambre_to_dict(chambre, request),
                status=status.HTTP_200_OK
            )

        except (ValueError, TypeError, KeyError):
            return Response(
                {'error': 'Données invalides'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # DELETE : supprimer une chambre
    elif request.method == 'DELETE':

        delete_chambre(chambre_id)

        return Response(
            {'message': 'Chambre supprimée avec succès'},
            status=status.HTTP_200_OK
        )


# 3. Récupérer les chambres disponibles
@api_view(['GET'])
def chambres_disponibles(request):

    chambres = get_chambres_disponibles()

    data = [
        chambre_to_dict(chambre, request)
        for chambre in chambres
    ]

    return Response(data, status=status.HTTP_200_OK)
