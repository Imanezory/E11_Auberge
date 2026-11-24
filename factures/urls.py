
from django.urls import path

from .api_views import (
    FactureListAPIView,
    FactureDetailAPIView,
    FactureCreateAPIView,
    FacturePaymentAPIView,
    FacturePDFAPIView,
    FacturePaymentStatusAPIView,
    EspaceClientAPIView,
    ReservationCheckoutAPIView,
    ReservationPaymentAPIView,
)

urlpatterns = [
    path("", FactureListAPIView.as_view(), name="facture-list"),

    path("create/", FactureCreateAPIView.as_view(), name="facture-create"),

    path("espace-client/", EspaceClientAPIView.as_view(), name="espace-client"),

    path(
        "reservations/<int:reservation_id>/checkout/",
        ReservationCheckoutAPIView.as_view(),
        name="reservation-checkout"
    ),

    path(
        "reservations/<int:reservation_id>/payer/",
        ReservationPaymentAPIView.as_view(),
        name="reservation-payment"
    ),

    path("<int:pk>/payer/", FacturePaymentAPIView.as_view(), name="facture-payer"),

    path("<int:pk>/pdf/", FacturePDFAPIView.as_view(), name="facture-pdf"),

    path(
        "<int:pk>/verifier-paiement/",
        FacturePaymentStatusAPIView.as_view(),
        name="facture-verifier-paiement"
    ),

    path("<int:pk>/", FactureDetailAPIView.as_view(), name="facture-detail"),
]
