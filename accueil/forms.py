
import uuid

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
