from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from factures.views import frontend
from services.views import ServiceViewSet
from accueil.controllers import connexion
from accueil.views import (
    password_reset_request,
    password_reset_verify,
    password_reset_confirm,
)


# REST API - SERVICES
router = DefaultRouter()

router.register(
    "services",
    ServiceViewSet,
    basename="service-api"
)


urlpatterns = [
    # Administration
    path("admin/", admin.site.urls),

    # Facturation API
    path(
        "api/factures/",
        include("factures.urls"),
    ),

    # Login
    path("login/", connexion, name="login"),

    # Accueil et inscription
    path("", include("accueil.urls")),

    # Services
    path("services/", include("services.urls")),

    # API Services
    path("api/", include(router.urls)),
    
    path("api/", include("chambres.api_urls")),

    # API Reservations
    path("api/", include("reservations.urls")),

    # Logout
    path(
        "logout/",
        LogoutView.as_view(next_page="/"),
        name="logout"
    ),

    # Password reset
    path(
        "mot-de-passe-oublie/",
        password_reset_request,
        name="password_reset_request"
    ),

    path(
        "verification-code/",
        password_reset_verify,
        name="password_reset_verify"
    ),

    path(
        "nouveau-mot-de-passe/",
        password_reset_confirm,
        name="password_reset_confirm"
    ),
]

# Frontend Facturation - خاصو يكون في الأخير
urlpatterns += [
    re_path(r"^.*$", frontend, name="frontend"),
]

# Media files
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )