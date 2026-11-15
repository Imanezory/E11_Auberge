
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib import messages

from .forms import InscriptionForm


# Page d'accueil
def accueil(request):
    return render(request, 'accueil/index.html')


# Page de création de compte
def inscription(request):

    # Si l'utilisateur est déjà connecté
    if request.user.is_authenticated:
        return redirect('accueil')

    if request.method == 'POST':
        form = InscriptionForm(request.POST)

        if form.is_valid():
            # Enregistrer l'utilisateur dans MySQL
            user = form.save()

            # Connecter automatiquement l'utilisateur
            login(request, user)

            messages.success(
                request,
                "Votre compte a été créé avec succès !"
            )

            # Retour à l'accueil
            return redirect('accueil')

    else:
        form = InscriptionForm()

    return render(
        request,
        'accueil/inscription.html',
        {'form': form}
    )
