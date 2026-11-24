
from decimal import Decimal

from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer

from reservations.models import Reservation

from .models import Facture
from .serializers import FactureSerializer
from .controllers import FactureController
from .pdf_service import generer_pdf_facture


# ==================================================
# LISTE DES FACTURES
# ==================================================

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


# ==================================================
# DETAIL D'UNE FACTURE
# ==================================================

class FactureDetailAPIView(generics.RetrieveAPIView):

    serializer_class = FactureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.is_staff:
            return Facture.objects.all()

        return Facture.objects.filter(
            client_id=self.request.user.id
        )


# ==================================================
# CREATION MANUELLE D'UNE FACTURE (ADMIN)
# ==================================================

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


# ==================================================
# PAIEMENT D'UNE FACTURE EXISTANTE
# ==================================================

class FacturePaymentAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        if request.user.is_staff:

            facture = get_object_or_404(
                Facture,
                pk=pk
            )

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

        facture.statut = "payee"
        facture.date_paiement = timezone.now()

        facture.save(
            update_fields=["statut", "date_paiement"]
        )

        return Response(
            {
                "message": "Paiement simulé effectué avec succès.",
                "facture_id": facture.id,
                "statut": facture.statut,
                "date_paiement": facture.date_paiement,
            },
            status=status.HTTP_200_OK
        )


# ==================================================
# TELECHARGEMENT PDF
# ==================================================

class FacturePDFAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        if request.user.is_staff:

            facture = get_object_or_404(
                Facture,
                pk=pk
            )

        else:

            facture = get_object_or_404(
                Facture,
                pk=pk,
                client_id=request.user.id
            )

        if facture.statut != "payee":

            return Response(
                {
                    "error": "Veuillez payer votre facture avant de télécharger le PDF."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        fichier_existe = (
            facture.pdf_file
            and facture.pdf_file.name
            and facture.pdf_file.storage.exists(
                facture.pdf_file.name
            )
        )

        if not fichier_existe:

            generer_pdf_facture(facture)
            facture.refresh_from_db()

        if (
            not facture.pdf_file
            or not facture.pdf_file.name
            or not facture.pdf_file.storage.exists(
                facture.pdf_file.name
            )
        ):

            return Response(
                {
                    "error": "Le PDF n'a pas pu être généré."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return FileResponse(
            facture.pdf_file.open("rb"),
            as_attachment=True,
            filename=f"facture_{facture.id}.pdf",
            content_type="application/pdf"
        )


# ==================================================
# VERIFICATION DU PAIEMENT
# ==================================================

class FacturePaymentStatusAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        if request.user.is_staff:

            facture = get_object_or_404(
                Facture,
                pk=pk
            )

        else:

            facture = get_object_or_404(
                Facture,
                pk=pk,
                client_id=request.user.id
            )

        return Response(
            {
                "facture_id": facture.id,
                "statut": facture.statut,
                "date_paiement": facture.date_paiement,
            }
        )


# ==================================================
# ESPACE CLIENT
# ==================================================

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

        return Response(
            {
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
            }
        )


# ==================================================
# CALCUL DU MONTANT AVANT PAIEMENT
# ==================================================

class ReservationCheckoutAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, reservation_id):

        reservation = get_object_or_404(
            Reservation.objects.prefetch_related(
                "chambres",
                "services"
            ),
            pk=reservation_id,
            utilisateur=request.user
        )

        if reservation.statut in ["annulee", "terminee"]:

            return Response(
                {
                    "error": "Cette réservation ne peut pas être payée."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si une facture existe déjà
        facture = Facture.objects.filter(
            reservation=reservation
        ).first()

        if facture and facture.statut == "payee":

            return Response(
                {
                    "error": "Cette réservation est déjà payée.",
                    "facture_id": facture.id,
                    "statut": "payee"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        nuits = (
            reservation.dateDepart - reservation.dateArrivee
        ).days

        if nuits <= 0:

            return Response(
                {"error": "Les dates de réservation sont invalides."},
                status=status.HTTP_400_BAD_REQUEST
            )

        montant_chambres = sum(
            (
                Decimal(str(ch.prix))
                for ch in reservation.chambres.all()
            ),
            Decimal("0.00")
        ) * nuits

        montant_services = sum(
            (
                Decimal(str(service.prix))
                for service in reservation.services.all()
            ),
            Decimal("0.00")
        )

        montant_total = montant_chambres + montant_services

        return Response(
            {
                "reservation_id": reservation.id,
                "statut": reservation.statut,
                "nuits": nuits,
                "montant_chambres": str(montant_chambres),
                "montant_services": str(montant_services),
                "montant_total": str(montant_total),
                "devise": "MAD",
            }
        )


# ==================================================
# PAIEMENT ET CREATION AUTOMATIQUE DE FACTURE
# ==================================================

class ReservationPaymentAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):

        # Confirmation explicite du mode démonstration
        if request.data.get("demo_confirmed") is not True:

            return Response(
                {
                    "error": "Confirmation du paiement de démonstration requise."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            reservation = get_object_or_404(
                Reservation.objects.select_for_update().prefetch_related(
                    "chambres",
                    "services"
                ),
                pk=reservation_id,
                utilisateur=request.user
            )

            if reservation.statut in ["annulee", "terminee"]:

                return Response(
                    {"error": "Cette réservation ne peut pas être payée."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            nuits = (
                reservation.dateDepart - reservation.dateArrivee
            ).days

            if nuits <= 0:

                return Response(
                    {"error": "Dates de réservation invalides."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            montant_chambres = sum(
                (
                    Decimal(str(ch.prix))
                    for ch in reservation.chambres.all()
                ),
                Decimal("0.00")
            ) * nuits

            montant_services = sum(
                (
                    Decimal(str(service.prix))
                    for service in reservation.services.all()
                ),
                Decimal("0.00")
            )

            montant_total = montant_chambres + montant_services

            if montant_total <= 0:

                return Response(
                    {"error": "Montant de réservation invalide."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            facture, created = Facture.objects.get_or_create(
                reservation=reservation,
                defaults={
                    "client_id": request.user.id,
                    "montant_chambres": montant_chambres,
                    "montant_services": montant_services,
                    "montant_total": montant_total,
                    "devise": "MAD",
                    "statut": "non_payee",
                }
            )

            if facture.client_id != request.user.id:

                return Response(
                    {"error": "Facture non autorisée."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Si le paiement a déjà été effectué,
            # ne pas créer une deuxième facture.
            if facture.statut != "payee":

                facture.montant_chambres = montant_chambres
                facture.montant_services = montant_services
                facture.montant_total = montant_total

                facture.statut = "payee"
                facture.date_paiement = timezone.now()

                facture.save()

                reservation.statut = "payee"

                reservation.save(
                    update_fields=["statut"]
                )

            # Génération du PDF après confirmation
            fichier_existe = (
                facture.pdf_file
                and facture.pdf_file.name
                and facture.pdf_file.storage.exists(
                    facture.pdf_file.name
                )
            )

            if not fichier_existe:

                generer_pdf_facture(facture)
                facture.refresh_from_db()

            if not facture.pdf_file or not facture.pdf_file.name:

                return Response(
                    {"error": "Impossible de générer la facture PDF."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {
                    "message": "Paiement de démonstration confirmé.",
                    "reservation_id": reservation.id,
                    "facture_id": facture.id,
                    "statut_reservation": reservation.statut,
                    "statut_facture": facture.statut,
                    "montant_total": str(facture.montant_total),
                    "pdf_url": facture.pdf_file.url,
                },
                status=status.HTTP_200_OK
            )
