
from django.shortcuts import render, get_object_or_404, redirect

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Service
from .forms import ReservationServiceForm
from .serializers import ServiceSerializer


# ==========================================
# AFFICHAGE DES SERVICES
# ==========================================

def liste_services(request):

    services_gratuits = Service.objects.filter(
        prix=0
    )

    services_payants = Service.objects.filter(
        prix__gt=0
    )

    context = {
        "services_gratuits": services_gratuits,
        "services_payants": services_payants,
    }

    return render(
        request,
        "services/services.html",
        context
    )


# ==========================================
# DETAILS D'UN SERVICE + CAROUSEL
# ==========================================

def detail_service(request, service_id):

    # Récupérer le service sélectionné
    service = get_object_or_404(
        Service,
        id=service_id
    )

    # Sélectionner 8 services aléatoires
    # sans afficher le service actuel
    autres_services = (
        Service.objects
        .exclude(id=service.id)
        .order_by("?")[:8]
    )

    context = {
        "service": service,
        "autres_services": autres_services,
    }

    return render(
        request,
        "services/detail_service.html",
        context
    )


# ==========================================
# RESERVATION DIRECTE D'UN SERVICE
# ==========================================

def reserver_service(request, service_id):

    service = get_object_or_404(
        Service,
        id=service_id,
        prix__gt=0
    )

    if request.method == "POST":

        form = ReservationServiceForm(request.POST)

        if form.is_valid():

            reservation = form.save(commit=False)

            reservation.service = service

            reservation.statut = "confirmee"

            reservation.save()

            return redirect("confirmation_service")

    else:
        form = ReservationServiceForm()

    context = {
        "service": service,
        "form": form,
    }

    return render(
        request,
        "services/reserver_service.html",
        context
    )


# ==========================================
# CONFIRMATION DE RESERVATION
# ==========================================

def confirmation_service(request):

    return render(
        request,
        "services/confirmation_service.html"
    )


# ==========================================
# REST API - SERVICES
# ==========================================

class ServiceViewSet(viewsets.ModelViewSet):

    queryset = Service.objects.all().order_by("id")

    serializer_class = ServiceSerializer

    permission_classes = [IsAuthenticatedOrReadOnly]
