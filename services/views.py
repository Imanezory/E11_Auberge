
from django.shortcuts import render, get_object_or_404, redirect
from .models import Service
from .forms import ReservationServiceForm


# ===== IMAGES DES SERVICES =====
IMAGES_SERVICES = {
   "Wi-Fi haut débit": "wifi.jpg",
        "Réception 24h/24": "reception.jpg",
        "Parking sécurisé": "parking.jpg",
        "Petit-déjeuner": "breakfast.jpg",
        "Restauration": "restauration.jpg",
        "Navette aéroport": "transport.jpg",
        "Blanchisserie": "blanchisserie.png",
}


# ===== AFFICHAGE DES SERVICES =====
def liste_services(request):

    services_gratuits = list(
        Service.objects.filter(prix=0)
    )

    services_payants = list(
        Service.objects.filter(prix__gt=0)
    )

    # Associer chaque service à son image
    for service in services_gratuits + services_payants:
        service.image_nom = IMAGES_SERVICES.get(service.nom)

    context = {
        "services_gratuits": services_gratuits,
        "services_payants": services_payants,
    }

    return render(
        request,
        "services/services.html",
        context
    )


# ===== RESERVATION DIRECTE D'UN SERVICE =====
def reserver_service(request, service_id):

    # Récupérer le service choisi
    service = get_object_or_404(
        Service,
        id=service_id,
        prix__gt=0
    )

    if request.method == "POST":

        form = ReservationServiceForm(request.POST)

        if form.is_valid():

            reservation = form.save(commit=False)

            # Associer le service
            reservation.service = service

            # Confirmation automatique
            reservation.statut = "confirmee"

            # Enregistrement dans MySQL
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


# ===== PAGE DE CONFIRMATION =====
def confirmation_service(request):

    return render(
        request,
        "services/confirmation_service.html"
    )
