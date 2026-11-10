
from decimal import Decimal
from .models import Facture


class FactureController:

    def calculer_montant_chambres(self, reservation_data):
        montant = Decimal(str(reservation_data["montant_chambres"]))

        if montant < 0:
            raise ValueError("Le montant des chambres ne peut pas être négatif.")

        return montant

    def calculer_montant_services(self, services_data):
        total = Decimal("0")

        for service in services_data:
            prix = Decimal(str(service["prix"]))
            quantite = Decimal(str(service.get("quantite", 1)))

            if prix < 0 or quantite < 0:
                raise ValueError("Prix et quantité doivent être positifs ou nuls.")

            total += prix * quantite

        return total

    def calculer_montant_total(self, montant_chambres, montant_services):
        chambres = Decimal(str(montant_chambres))
        services = Decimal(str(montant_services))

        if chambres < 0 or services < 0:
            raise ValueError("Les montants ne peuvent pas être négatifs.")

        return chambres + services

    def creer_facture(self, reservation_data, services_data):
        montant_chambres = self.calculer_montant_chambres(reservation_data)
        montant_services = self.calculer_montant_services(services_data)

        montant_total = self.calculer_montant_total(
            montant_chambres,
            montant_services
        )

        return Facture.objects.create(
            reservation_id=reservation_data["id"],
            client_id=reservation_data["client_id"],
            montant_chambres=montant_chambres,
            montant_services=montant_services,
            montant_total=montant_total,
            statut="non_payee"
        )
