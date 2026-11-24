
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'prix', 'type', 'image')
    search_fields = ('nom', 'type')
    list_filter = ('type',)


# Afficher les utilisateurs dans Django Admin
User = get_user_model()

if not admin.site.is_registered(User):
    admin.site.register(User, UserAdmin)
