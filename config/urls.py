from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Accueil
    path('', include('accueil.urls')),

    # Services
    path('services/', include('services.urls')),

    # API REST - Réservations
    path('api/', include('reservations.urls')),
]
