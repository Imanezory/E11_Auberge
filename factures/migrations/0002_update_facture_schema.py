
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("factures", "0001_initial"),
    ]

    operations = [

        # Renommer les champs existants
        migrations.RenameField(
            model_name="facture",
            old_name="dateEmission",
            new_name="date_emission",
        ),

        migrations.RenameField(
            model_name="facture",
            old_name="montantChambres",
            new_name="montant_chambres",
        ),

        migrations.RenameField(
            model_name="facture",
            old_name="montantServices",
            new_name="montant_services",
        ),

        migrations.RenameField(
            model_name="facture",
            old_name="montantTotal",
            new_name="montant_total",
        ),

        migrations.RenameField(
            model_name="facture",
            old_name="pdfFile",
            new_name="pdf_file",
        ),

        # Modifier la date d'émission
        migrations.AlterField(
            model_name="facture",
            name="date_emission",
            field=models.DateTimeField(auto_now_add=True),
        ),

        # Supprimer l'ancien mode de paiement
        migrations.RemoveField(
            model_name="facture",
            name="paymentMode",
        ),

        # Ajouter les informations du client
        migrations.AddField(
            model_name="facture",
            name="client_id",
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),

        # Ajouter les informations de paiement
        migrations.AddField(
            model_name="facture",
            name="stripe_payment_intent_id",
            field=models.CharField(
                max_length=255,
                blank=True,
                null=True,
                unique=True,
            ),
        ),

        migrations.AddField(
            model_name="facture",
            name="date_paiement",
            field=models.DateTimeField(
                blank=True,
                null=True,
            ),
        ),

        migrations.AddField(
            model_name="facture",
            name="devise",
            field=models.CharField(
                max_length=3,
                default="MAD",
            ),
        ),
    ]
