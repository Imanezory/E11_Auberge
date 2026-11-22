
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views


# ===== REST API =====
router = DefaultRouter()
router.register(
    r"services",
    views.ServiceViewSet,
    basename="service-api"
)


urlpatterns = [

    # ===== LISTE DES SERVICES =====
    path(
        "",
        views.liste_services,
        name="liste_services"
    ),

    # ===== DETAILS D'UN SERVICE =====
    path(
        "details/<int:service_id>/",
        views.detail_service,
        name="detail_service"
    ),

    # ===== RESERVATION D'UN SERVICE =====
    path(
        "reserver/<int:service_id>/",
        views.reserver_service,
        name="reserver_service"
    ),

    # ===== CONFIRMATION =====
    path(
        "confirmation/",
        views.confirmation_service,
        name="confirmation_service"
    ),

    # ===== REST API =====
    path(
        "api/",
        include(router.urls)
    ),

]
