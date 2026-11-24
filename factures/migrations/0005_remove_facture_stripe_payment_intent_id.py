from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('factures', '0004_facture_payment_session_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='facture',
            name='stripe_payment_intent_id',
        ),
    ]