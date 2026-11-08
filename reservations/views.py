
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Reservation
from .serializers import ReservationSerializer
from .controllers import (
    confirm_reservation,
    cancel_reservation,
    finish_reservation,
)


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
        if not self.request.user.is_staff:
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

    # Confirm reservation
    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        reservation = self.get_object()

        confirm_reservation(reservation)

        return Response(
            self.get_serializer(reservation).data,
            status=status.HTTP_200_OK
        )

    # Cancel reservation
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()

        cancel_reservation(reservation)

        return Response({
            'message': 'Reservation cancelled successfully.'
        }, status=status.HTTP_200_OK)

    # Finish reservation
    @action(detail=True, methods=['patch'])
    def finish(self, request, pk=None):
        reservation = self.get_object()

        finish_reservation(reservation)

        return Response({
            'message': 'Reservation finished successfully.'
        }, status=status.HTTP_200_OK)
