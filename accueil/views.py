
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

import secrets
import re
from datetime import timedelta
from chambres.models import Chambre
from django.shortcuts import render, redirect
from django.contrib.auth import login, get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import SetPasswordForm, PasswordChangeForm
from django.contrib import messages
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.crypto import salted_hmac, constant_time_compare

from django.core.paginator import Paginator

from .forms import InscriptionForm

from reservations.models import Reservation
from factures.models import Facture


# =====================================
# CSRF TOKEN FOR REACT
# =====================================

@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({
        "csrfToken": get_token(request)
    })


# =====================================
# PAGE D'ACCUEIL
# =====================================

# =====================================
# PAGE D'ACCUEIL
# =====================================

def accueil(request):
    chambres = Chambre.objects.filter(
        statut='disponible'
    ).order_by('id')

    return render(
        request,
        'accueil/index.html',
        {'chambres': chambres}
    )

# =====================================
# INSCRIPTION
# =====================================

def inscription(request):

    if request.user.is_authenticated:
        return redirect("accueil")

    if request.method == "POST":

        form = InscriptionForm(request.POST)

        if form.is_valid():

            user = form.save()
            login(request, user)

            messages.success(
                request,
                "Votre compte a été créé avec succès !"
            )

            return redirect("accueil")

    else:
        form = InscriptionForm()

    return render(
        request,
        "accueil/inscription.html",
        {"form": form}
    )


# =====================================
# MON ESPACE CLIENT
# PROFIL + HISTORIQUE + PAGINATION
# =====================================

@login_required(login_url='/login/')
def mon_espace_client(request):

    utilisateur = request.user

    # =====================================
    # MODIFICATION DU MOT DE PASSE
    # =====================================

    password_form = PasswordChangeForm(
        utilisateur
    )

    if (
        request.method == "POST"
        and request.POST.get("action") == "change_password"
    ):

        password_form = PasswordChangeForm(
            utilisateur,
            request.POST
        )

        if password_form.is_valid():

            user = password_form.save()

            # Garder le client connecté
            update_session_auth_hash(request, user)

            messages.success(
                request,
                "Votre mot de passe a été modifié avec succès !"
            )

            return redirect("mon_espace_client")

        else:

            messages.error(
                request,
                "Veuillez corriger les erreurs du formulaire."
            )

    # =====================================
    # HISTORIQUE DES RESERVATIONS
    # =====================================

    reservations_queryset = (
        Reservation.objects.filter(
            utilisateur=utilisateur
        )
        .prefetch_related(
            'chambres',
            'services'
        )
        .order_by('-dateArrivee', '-id')
    )

    # Années disponibles
    annees = sorted(
        set(
            reservations_queryset.values_list(
                'dateArrivee__year',
                flat=True
            )
        ),
        reverse=True
    )

    # Filtre par année
    annee_selectionnee = request.GET.get(
        'annee', ''
    ).strip()

    if annee_selectionnee:

        if (
            annee_selectionnee.isdigit()
            and int(annee_selectionnee) in annees
        ):

            reservations_queryset = (
                reservations_queryset.filter(
                    dateArrivee__year=int(annee_selectionnee)
                )
            )

        else:
            annee_selectionnee = ''

    # =====================================
    # PAGINATION : 1 RESERVATION PAR PAGE
    # =====================================

    paginator = Paginator(
        reservations_queryset,
        1
    )

    page_obj = paginator.get_page(
        request.GET.get('page', 1)
    )

    reservations = list(page_obj.object_list)

    # =====================================
    # FACTURES DES RESERVATIONS AFFICHÉES
    # =====================================

    reservation_ids = [
        reservation.id
        for reservation in reservations
    ]

    factures = Facture.objects.filter(
        reservation_id__in=reservation_ids
    ).order_by('-date_emission', '-id')

    factures_par_reservation = {}

    for facture in factures:

        # Garder la facture la plus récente
        if facture.reservation_id not in factures_par_reservation:

            factures_par_reservation[
                facture.reservation_id
            ] = facture

    for reservation in reservations:

        reservation.facture_client = (
            factures_par_reservation.get(
                reservation.id
            )
        )

    # =====================================
    # STATISTIQUES
    # =====================================

    nombre_reservations = Reservation.objects.filter(
        utilisateur=utilisateur
    ).count()

    nombre_payees = Facture.objects.filter(
        reservation__utilisateur=utilisateur,
        statut='payee'
    ).count()

    # =====================================
    # CONTEXTE
    # =====================================

    context = {

        'utilisateur': utilisateur,

        'reservations': reservations,

        'page_obj': page_obj,

        'annees': annees,

        'annee_selectionnee': annee_selectionnee,

        'nombre_reservations': nombre_reservations,

        'nombre_payees': nombre_payees,

        'password_form': password_form,
    }

    return render(
        request,
        'accueil/mon_espace_client.html',
        context
    )


# =====================================
# MOT DE PASSE OUBLIE
# =====================================

def password_reset_request(request):

    if request.method == "POST":

        email = request.POST.get(
            "email", ""
        ).strip().lower()

        # Limiter les demandes répétées
        attempts = request.session.get(
            "reset_requests", 0
        )

        if attempts >= 3:

            messages.error(
                request,
                "Trop de demandes. Réessayez plus tard."
            )

            return redirect("password_reset_request")

        request.session["reset_requests"] = attempts + 1
        request.session.set_expiry(600)

        User = get_user_model()

        user = User.objects.filter(
            email__iexact=email
        ).first()

        request.session.pop(
            "password_reset", None
        )

        if user:

            code = f"{secrets.randbelow(1000000):06d}"

            code_hash = salted_hmac(
                "auberge-password-reset",
                code
            ).hexdigest()

            request.session["password_reset"] = {

                "user_id": str(user.pk),

                "code_hash": code_hash,

                "expires_at": (
                    timezone.now() + timedelta(minutes=10)
                ).timestamp(),

                "attempts": 0,

                "verified": False,
            }

            send_mail(

                subject="Auberge - Code de vérification",

                message=(
                    "Bonjour,\n\n"
                    f"Votre code de vérification est : {code}\n\n"
                    "Ce code expire dans 10 minutes.\n\n"
                    "Si vous n'avez pas demandé ce code, "
                    "ignorez ce message.\n\n"
                    "L'équipe Auberge."
                ),

                from_email=settings.DEFAULT_FROM_EMAIL,

                recipient_list=[user.email],

                fail_silently=False,
            )

        # Ne pas révéler si l'e-mail existe
        messages.info(
            request,
            "Si cette adresse est enregistrée, "
            "un code de vérification a été envoyé."
        )

        return redirect("password_reset_verify")

    return render(
        request,
        "accueil/password_reset_request.html"
    )


# =====================================
# VERIFICATION DU CODE
# =====================================

def password_reset_verify(request):

    reset_data = request.session.get(
        "password_reset"
    )

    if not reset_data:

        messages.error(
            request,
            "Aucune demande active. Veuillez demander un code."
        )

        return redirect("password_reset_request")

    if timezone.now().timestamp() > reset_data["expires_at"]:

        request.session.pop(
            "password_reset", None
        )

        messages.error(
            request,
            "Le code a expiré."
        )

        return redirect("password_reset_request")

    if reset_data.get("verified"):

        return redirect("password_reset_confirm")

    if reset_data.get("attempts", 0) >= 5:

        request.session.pop(
            "password_reset", None
        )

        messages.error(
            request,
            "Nombre maximal de tentatives atteint."
        )

        return redirect("password_reset_request")

    if request.method == "POST":

        code = request.POST.get(
            "code", ""
        ).strip()

        reset_data["attempts"] += 1

        request.session["password_reset"] = reset_data

        if (
            len(code) != 6
            or not code.isascii()
            or not code.isdigit()
        ):

            messages.error(
                request,
                "Saisissez un code valide à 6 chiffres."
            )

        else:

            code_hash = salted_hmac(
                "auberge-password-reset",
                code
            ).hexdigest()

            if constant_time_compare(
                code_hash,
                reset_data["code_hash"]
            ):

                reset_data["verified"] = True

                reset_data.pop(
                    "code_hash", None
                )

                request.session["password_reset"] = reset_data

                return redirect("password_reset_confirm")

            messages.error(
                request,
                "Code incorrect."
            )

        if reset_data["attempts"] >= 5:

            request.session.pop(
                "password_reset", None
            )

            messages.error(
                request,
                "Nombre maximal de tentatives atteint."
            )

            return redirect("password_reset_request")

    return render(
        request,
        "accueil/password_reset_verify.html"
    )


# =====================================
# NOUVEAU MOT DE PASSE APRES OUBLI
# =====================================

def password_reset_confirm(request):

    reset_data = request.session.get(
        "password_reset"
    )

    if not reset_data or not reset_data.get("verified"):

        messages.error(
            request,
            "Veuillez d'abord vérifier votre code."
        )

        return redirect("password_reset_request")

    if timezone.now().timestamp() > reset_data["expires_at"]:

        request.session.pop(
            "password_reset", None
        )

        messages.error(
            request,
            "Votre session a expiré."
        )

        return redirect("password_reset_request")

    User = get_user_model()

    try:

        user = User.objects.get(
            pk=reset_data["user_id"]
        )

    except (User.DoesNotExist, ValueError, TypeError):

        request.session.pop(
            "password_reset", None
        )

        return redirect("password_reset_request")

    if request.method == "POST":

        form = SetPasswordForm(
            user,
            request.POST
        )

        if form.is_valid():

            password = form.cleaned_data["new_password1"]

            errors = []

            if len(password) < 8:
                errors.append("Minimum 8 caractères.")

            if not re.search(r"[A-Z]", password):
                errors.append("Ajoutez une majuscule.")

            if not re.search(r"[a-z]", password):
                errors.append("Ajoutez une minuscule.")

            if not re.search(r"[0-9]", password):
                errors.append("Ajoutez un chiffre.")

            if not re.search(r"[^A-Za-z0-9]", password):
                errors.append("Ajoutez un caractère spécial.")

            if errors:

                for error in errors:
                    messages.error(request, error)

            else:

                form.save()

                request.session.pop(
                    "password_reset", None
                )

                messages.success(
                    request,
                    "Votre mot de passe a été modifié avec succès !"
                )

                return redirect("login")

    else:

        form = SetPasswordForm(user)

    return render(
        request,
        "accueil/password_reset_confirm.html",
        {"form": form}
    )
