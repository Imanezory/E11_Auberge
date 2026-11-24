
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [

    # Page d'accueil
    path('', views.accueil, name='accueil'),

    # Connexion
    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='accueil/login.html',
            next_page='/'
        ),
        name='login'
    ),

    # Inscription
    path(
        'inscription/',
        views.inscription,
        name='inscription'
    ),

    # Espace client : profil + historique
    path(
        'mon-espace-client/',
        views.mon_espace_client,
        name='mon_espace_client'
    ),

    # CSRF React
    path(
        'api/csrf/',
        views.csrf_token_view,
        name='csrf_token'
    ),
]
