
from django.contrib import admin
from .models import Facture


@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "reservation_id",
        "client_id",
        "montant_total",
        "statut",
        "date_emission",
    )

    list_filter = (
        "statut",
        "date_emission",
    )

    search_fields = (
        "id",
        "reservation_id",
        "client_id",
    )

    readonly_fields = (
        "reservation_id",
        "client_id",
        "date_emission",
        "montant_chambres",
        "montant_services",
        "montant_total",
        "pdf_file",
    )

    ordering = ("-date_emission",)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
