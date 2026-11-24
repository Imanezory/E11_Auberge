
from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Chambre


# =====================================
# LISTE DES CHAMBRES DISPONIBLES
# =====================================

def liste_chambres(request):

    # Afficher uniquement les chambres disponibles
    chambres = Chambre.objects.filter(
        statut='disponible'
    ).order_by('numChambre')

    # Recherche
    recherche = request.GET.get(
        'recherche', ''
    ).strip()

    if recherche:
        chambres = chambres.filter(
            Q(numChambre__icontains=recherche) |
            Q(type__icontains=recherche)
        )

    # Filtrage par type
    type_chambre = request.GET.get('type', '')

    if type_chambre:
        chambres = chambres.filter(
            type=type_chambre
        )

    # Types des chambres disponibles uniquement
    types_chambres = (
        Chambre.objects
        .filter(statut='disponible')
        .values_list('type', flat=True)
        .distinct()
    )

    return render(
        request,
        'chambres/liste.html',
        {
            'chambres': chambres,
            'types_chambres': types_chambres,
        }
    )


# =====================================
# DETAILS D'UNE CHAMBRE DISPONIBLE
# =====================================

def detail_chambre(request, pk):

    chambre = get_object_or_404(
        Chambre,
        pk=pk,
        statut='disponible'
    )

    return render(
        request,
        'chambres/detail.html',
        {
            'chambre': chambre
        }
    )
