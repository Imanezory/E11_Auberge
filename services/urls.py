
from django.urls import path
from . import views

urlpatterns = [

    # Liste des services
    path(
        "",
        views.liste_services,
        name="liste_services"
    ),

    # Réserver un service sans chambre
    path(
        "reserver/<int:service_id>/",
        views.reserver_service,
        name="reserver_service"
    ),

    # Confirmation automatique
    path(
        "confirmation/",
        views.confirmation_service,
        name="confirmation_service"
    ),

]
