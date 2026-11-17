
from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Chambre


def liste_chambres(request):

    chambres = Chambre.objects.all()

    recherche = request.GET.get('recherche', '').strip()
    type_chambre = request.GET.get('type', '')
    statut = request.GET.get('statut', '')

    if recherche:
        chambres = chambres.filter(
            Q(numChambre__icontains=recherche) |
            Q(type__icontains=recherche)
        )

    if type_chambre:
        chambres = chambres.filter(type=type_chambre)

    if statut:
        chambres = chambres.filter(statut=statut)

    types_chambres = (
        Chambre.objects
        .values_list('type', flat=True)
        .distinct()
    )

    return render(request, 'chambres/liste.html', {
        'chambres': chambres,
        'types_chambres': types_chambres,
    })


def detail_chambre(request, pk):

    chambre = get_object_or_404(Chambre, pk=pk)

    return render(
        request,
        'chambres/detail.html',
        {'chambre': chambre}
    )
