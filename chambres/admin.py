from django.contrib import admin
from .models import Chambre

@admin.register(Chambre)
class ChambreAdmin(admin.ModelAdmin):
    list_display = ('numChambre', 'typeChambre', 'prix', 'disponible')
    list_filter = ('typeChambre', 'disponible')
    search_fields = ('numChambre',)
# Register your models here.
