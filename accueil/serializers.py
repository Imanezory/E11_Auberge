
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

Utilisateur = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = Utilisateur
        fields = [
            'id',
            'username',
            'nom',
            'prenom',
            'email',
            'numTelephone',
            'password',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')

        utilisateur = Utilisateur.objects.create_user(
            password=password,
            **validated_data
        )

        return utilisateur
