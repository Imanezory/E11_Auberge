from django.contrib import admin
from .models import Chambre

@admin.register(Chambre)
class ChambreAdmin(admin.ModelAdmin):
    list_display = ('numChambre',)
# Register your models here.
