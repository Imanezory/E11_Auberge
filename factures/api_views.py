
from rest_framework import generics, status
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from .pdf_service import generer_pdf_facture
from .models import Facture
from .serializers import FactureSerializer
from .controllers import FactureController


class FactureListAPIView(generics.ListAPIView):
    serializer_class = FactureSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer, BrowsableAPIRenderer]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Facture.objects.all().order_by("-date_emission")

        return Facture.objects.filter(
            client_id=self.request.user.id
        ).order_by("-date_emission")

class FactureDetailAPIView(generics.RetrieveAPIView):
    serializer_class = FactureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Facture.objects.all()

        return Facture.objects.filter(
            client_id=self.request.user.id
        )


class FactureCreateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        reservation_data = request.data.get("reservation")
        services_data = request.data.get("services", [])

        if not reservation_data:
            return Response(
                {"error": "Les données de réservation sont obligatoires."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reservation_data.get("statut") != "confirmee":
            return Response(
                {"error": "La réservation doit être confirmée."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            controller = FactureController()
            facture = controller.creer_facture(
                reservation_data,
                services_data
            )

            return Response(
                {
                    "message": "Facture créée avec succès.",
                    "facture_id": facture.id,
                    "montant_total": str(facture.montant_total),
                    "statut": facture.statut,
                },
                status=status.HTTP_201_CREATED
            )

        except (KeyError, ValueError) as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST
            )


class FacturePaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.is_staff:
            facture = get_object_or_404(Facture, pk=pk)
        else:
            facture = get_object_or_404(
                Facture,
                pk=pk,
                client_id=request.user.id
            )

        if facture.statut == "payee":
            return Response(
                {"error": "Cette facture est déjà payée."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simulation de paiement pour la démonstration du projet
        facture.statut = "payee"
        facture.date_paiement = timezone.now()
        facture.save(update_fields=["statut", "date_paiement"])

        return Response(
            {
                "message": "Paiement simulé effectué avec succès.",
                "facture_id": facture.id,
                "statut": facture.statut,
                "date_paiement": facture.date_paiement,
            },
            status=status.HTTP_200_OK
        )



class FacturePDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.is_staff:
            facture = get_object_or_404(Facture, pk=pk)
        else:
            facture = get_object_or_404(
                Facture,
                pk=pk,
                client_id=request.user.id
            )

        if facture.statut != "payee":
            return Response(
                {"error": "Veuillez payer votre facture avant de télécharger le PDF."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier si le PDF existe réellement
        fichier_existe = (
            facture.pdf_file
            and facture.pdf_file.name
            and facture.pdf_file.storage.exists(facture.pdf_file.name)
        )

        # Générer le PDF s'il est absent
        if not fichier_existe:
            generer_pdf_facture(facture)
            facture.refresh_from_db()

        # Vérifier une deuxième fois après la génération
        if (
            not facture.pdf_file
            or not facture.pdf_file.name
            or not facture.pdf_file.storage.exists(facture.pdf_file.name)
        ):
            return Response(
                {"error": "Le PDF n'a pas pu être généré. Vérifiez le service PDF."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return FileResponse(
            facture.pdf_file.open("rb"),
            as_attachment=True,
            filename=f"facture_{facture.id}.pdf",
            content_type="application/pdf"
        )


class FacturePaymentStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.is_staff:
            facture = get_object_or_404(Facture, pk=pk)
        else:
            facture = get_object_or_404(
                Facture,
                pk=pk,
                client_id=request.user.id
            )

        return Response({
            "facture_id": facture.id,
            "statut": facture.statut,
            "date_paiement": facture.date_paiement,
        })


@method_decorator(ensure_csrf_cookie, name="dispatch")
class EspaceClientAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = request.user

        facture = Facture.objects.filter(
            client_id=client.id
        ).order_by("-date_emission").first()

        if not facture:
            return Response(
                {"error": "Aucune facture trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "client": {
                "id": client.id,
                "nom": client.nom,
                "prenom": client.prenom,
                "email": client.email,
                "telephone": client.numTelephone,
            },
            "reservation": {
                "id": facture.reservation_id
            },
            "facture": FactureSerializer(facture).data
        })
