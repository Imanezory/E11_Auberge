from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'utilisateur',
        'dateArrivee',
        'dateDepart',
        'nbrPersonnes',
        'statut',
    )

    list_filter = ('statut', 'dateArrivee', 'dateDepart')

    search_fields = (
        'utilisateur__username',
        'utilisateur__email',
    )