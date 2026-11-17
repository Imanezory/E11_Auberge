
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # Administration Django
    path('admin/', admin.site.urls),

    # Accueil
    path('', include('accueil.urls')),

    # Services
    path('services/', include('services.urls')),

    # Chambres
    path('chambres/', include('chambres.urls')),
]


# Gestion des images en mode développement
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
