from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Reservation
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):

    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Reservation.objects.select_related(
            'utilisateur'
        ).prefetch_related(
            'chambres',
            'services'
        )

        # Staff can consult all reservations
        if self.request.user.is_staff:
            pass
        else:
            # A client can only consult their own reservations
            queryset = queryset.filter(
                utilisateur=self.request.user
            )

        # Optional filtering by status
        statut = self.request.query_params.get('statut')

        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset.order_by('-id')

    def perform_create(self, serializer):
        # The connected user becomes the reservation's client
        serializer.save(utilisateur=self.request.user)

    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        reservation = self.get_object()

        serializer = self.get_serializer(
            reservation,
            data={'statut': 'confirmee'},
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()

        reservation.statut = 'annulee'
        reservation.save(update_fields=['statut'])

        return Response({
            'message': 'Réservation annulée avec succès.'
        })

    @action(detail=True, methods=['patch'])
    def finish(self, request, pk=None):
        reservation = self.get_object()

        reservation.statut = 'terminee'
        reservation.save(update_fields=['statut'])

        return Response({
            'message': 'Réservation terminée avec succès.'
        })