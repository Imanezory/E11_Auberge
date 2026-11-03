from django.db import models

class Service(models.Model):
    nom = models.CharField(max_length=100)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.nom
