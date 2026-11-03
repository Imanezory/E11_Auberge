from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser


class Utilisateur(AbstractUser):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    numTelephone = models.CharField(max_length=20)

    def __str__(self):
        return self.username