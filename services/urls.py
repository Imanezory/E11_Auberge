
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views


# ==========================================
# REST API
# ==========================================

router = DefaultRouter()

router.register(
    r"services",
    views.ServiceViewSet,
    basename="service-api"
)


# ==========================================
# URLS SERVICES
# ==========================================

urlpatterns = [

    # Liste des services
    path(
        "",
        views.liste_services,
        name="liste_services"
    ),

    # Détails d'un service
    path(
        "details/<int:service_id>/",
        views.detail_service,
        name="detail_service"
    ),

    # Réservation d'un service
    path(
        "reserver/<int:service_id>/",
        views.reserver_service,
        name="reserver_service"
    ),

    # Confirmation
    path(
        "confirmation/",
        views.confirmation_service,
        name="confirmation_service"
    ),

    # API
    path(
        "api/",
        include(router.urls)
    ),

]
