
from django import forms
from django.utils import timezone
from .models import ReservationService


class ReservationServiceForm(forms.ModelForm):

    class Meta:
        model = ReservationService

        fields = [
            "nom_client",
            "email",
            "telephone",
            "date",
            "heure",
            "nombre_personnes",
        ]

        labels = {
            "nom_client": "Nom complet",
            "email": "Adresse e-mail",
            "telephone": "Téléphone",
            "date": "Date de réservation",
            "heure": "Heure de réservation",
            "nombre_personnes": "Nombre de personnes",
        }

        widgets = {
            "nom_client": forms.TextInput(
                attrs={"placeholder": "Votre nom complet"}
            ),
            "email": forms.EmailInput(
                attrs={"placeholder": "exemple@gmail.com"}
            ),
            "telephone": forms.TextInput(
                attrs={"placeholder": "06XXXXXXXX"}
            ),
            "date": forms.DateInput(
                format="%Y-%m-%d",
                attrs={"type": "date"}
            ),
            "heure": forms.TimeInput(
                format="%H:%M",
                attrs={"type": "time"}
            ),
            "nombre_personnes": forms.NumberInput(
                attrs={"min": 1, "max": 20}
            ),
        }

    def clean_date(self):
        date = self.cleaned_data["date"]

        if date < timezone.localdate():
            raise forms.ValidationError(
                "Veuillez choisir une date actuelle ou future."
            )

        return date

    def clean_nombre_personnes(self):
        nombre = self.cleaned_data["nombre_personnes"]

        if nombre < 1 or nombre > 20:
            raise forms.ValidationError(
                "Le nombre de personnes doit être entre 1 et 20."
            )

        return nombre
