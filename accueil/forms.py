
import uuid
import re

from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


class InscriptionForm(UserCreationForm):
    first_name = forms.CharField(
        label="Prénom",
        max_length=150,
        required=True
    )

    last_name = forms.CharField(
        label="Nom",
        max_length=150,
        required=True
    )

    email = forms.EmailField(
        label="Adresse e-mail",
        required=True
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2"
        )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError(
                "Cette adresse e-mail est déjà utilisée."
            )

        return email

    # VALIDATION DU MOT DE PASSE
    def clean_password1(self):
        password = self.cleaned_data.get("password1")

        if not password:
            return password

        errors = []

        if len(password) < 8:
            errors.append(
                "Le mot de passe doit contenir au moins 8 caractères."
            )

        if not re.search(r"[A-Z]", password):
            errors.append(
                "Ajoutez au moins une lettre majuscule."
            )

        if not re.search(r"[a-z]", password):
            errors.append(
                "Ajoutez au moins une lettre minuscule."
            )

        if not re.search(r"[0-9]", password):
            errors.append(
                "Ajoutez au moins un chiffre."
            )

        if not re.search(r"[^A-Za-z0-9]", password):
            errors.append(
                "Ajoutez au moins un caractère spécial."
            )

        if errors:
            raise forms.ValidationError(errors)

        return password

    def save(self, commit=True):
        user = super().save(commit=False)

        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.email = self.cleaned_data["email"]

        # Identifiant unique interne
        user.username = uuid.uuid4().hex

        if commit:
            user.save()

        return user
