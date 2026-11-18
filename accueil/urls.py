
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Page d'accueil
    path('', views.accueil, name='accueil'),

    # Page Se connecter
    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='accueil/login.html',
            next_page='/'
        ),
        name='login'
    ),

    # Page Créer un compte
    path(
        'inscription/',
        views.inscription,
        name='inscription'
    ),
    # CSRF token for React
    path('api/csrf/',
          views.csrf_token_view,
          name='csrf_token'
    ),
]
