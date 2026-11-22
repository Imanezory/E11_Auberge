
from decimal import Decimal
class ServiceController:
    def __init__(self):
        self.services = {}
        self.prochain_id = 1

    def ajouter_service(self, nom, prix, description, type_service):
        if not nom or not nom.strip():
            raise ValueError("Le nom est obligatoire")

        prix = Decimal(str(prix))
        if not prix.is_finite() or prix < 0:
            raise ValueError("Le prix doit etre positif ou nul")

        service = {
            "id": self.prochain_id,
            "nom": nom,
            "prix": prix,
            "description": description,
            "type": type_service
        }

        self.services[self.prochain_id] = service
        self.prochain_id += 1
        return service

    def rechercher_service(self, id_service):
        return self.services.get(id_service)

    def modifier_service(self, id_service, nouveau_nom, nouveau_prix):
        service = self.rechercher_service(id_service)

        if service is None:
            return False

        if not nouveau_nom or not nouveau_nom.strip():
            raise ValueError("Le nom est obligatoire")

        nouveau_prix = Decimal(str(nouveau_prix))
        if not nouveau_prix.is_finite() or nouveau_prix < 0:
            raise ValueError("Le prix doit etre positif ou nul")

        service["nom"] = nouveau_nom
        service["prix"] = nouveau_prix
        return True
