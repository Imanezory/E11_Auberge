from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib import messages


def connexion(request):
    if request.method == "POST":
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")

        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()

        if user:
            user_auth = authenticate(
                request,
                username=user.get_username(),
                password=password
            )

            if user_auth is not None:
                login(request, user_auth)
                return redirect("accueil")

        messages.error(request, "Email ou mot de passe incorrect.")

    return render(request, "accueil/login.html")