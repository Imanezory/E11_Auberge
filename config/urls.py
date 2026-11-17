
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter

from services.views import ServiceViewSet

from accueil.controllers import connexion

from accueil.views import (
    password_reset_request,
    password_reset_verify,
    password_reset_confirm,
)


# ==============================
# REST API - SERVICES
# ==============================
router = DefaultRouter()

router.register(
    "services",
    ServiceViewSet,
    basename="service-api"
)


# ==============================
# URLS PRINCIPALES
# ==============================
urlpatterns = [

    # Administration
    path('admin/', admin.site.urls),

    # Login avec Email + Mot de passe
    path(
        'login/',
        connexion,
        name='login'
    ),

    # Accueil + Inscription
    path('', include('accueil.urls')),

    # Pages Services
    path('services/', include('services.urls')),

    # REST API - Services
    path('api/', include(router.urls)),

    # REST API - Réservations
    path('api/', include('reservations.urls')),

    # Déconnexion
    path(
        'logout/',
        LogoutView.as_view(next_page='/'),
        name='logout'
    ),

    # Mot de passe oublié
    path(
        'mot-de-passe-oublie/',
        password_reset_request,
        name='password_reset_request'
    ),

    # Vérification du code
    path(
        'verification-code/',
        password_reset_verify,
        name='password_reset_verify'
    ),

    # Nouveau mot de passe
    path(
        'nouveau-mot-de-passe/',
        password_reset_confirm,
        name='password_reset_confirm'
    ),

]


# ==============================
# AFFICHAGE DES IMAGES UPLOADÉES
# ==============================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
