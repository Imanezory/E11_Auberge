# E11_Auberge

## Présentation du projet

E11_Auberge est une application web de gestion d'une auberge, réalisée dans le cadre du module Web Services.

L'application permet de centraliser la gestion des chambres, des services, des réservations et de la facturation à travers une interface moderne et intuitive.


## Technologies utilisées

- **Frontend :** React, JavaScript, HTML, CSS et Tailwind CSS.
- **Backend :** Python, Django et Django REST Framework.
- **Base de données :** MySQL 8.0.
- **Accès aux données :** Django ORM.
- **Conteneurisation :** Docker et Docker Compose.
- **Gestion des versions :** Git et GitHub.

## Fonctionnalités principales

- Présentation générale de l'auberge.
- Inscription, connexion et réinitialisation du mot de passe.
- Consultation, recherche et filtrage des chambres.
- Consultation , recherche et filrage des services gratuits et payants.
- Réservation des chambres avec des services complémentaires.
- Réservation indépendante des services.
- Calcul automatique des montants à payer.
- Simulation du paiement.
- Génération et téléchargement des factures au format PDF.
- Consultation des réservations et des factures depuis l'espace client.

## Prérequis

Avant de lancer le projet, il est nécessaire d'installer :

- Git.
- Docker Desktop.
- Docker Compose.

Docker Desktop doit être démarré avant l'exécution des commandes suivantes.

## Installation et lancement du projet

### 1. Cloner le dépôt GitHub

```bash
git clone https://github.com/Imanezory/E11_Auberge.git
cd E11_Auberge
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à partir du fichier `.env.example`.

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Sous Linux ou macOS :

```bash
cp .env.example .env
```

Renseigner les paramètres nécessaires dans le fichier `.env`.

### 3. Construire et démarrer les conteneurs Docker

```bash
docker compose up -d --build
```

### 4. Vérifier l'état des conteneurs

```bash
docker compose ps
```

### 5. Appliquer les migrations Django

```bash
docker compose exec web python manage.py migrate
```

### 6. Importer les données initiales

Cette étape est importante pour retrouver les chambres et les services préconfigurés, ainsi que leurs descriptions, tarifs et chemins d'accès aux images.

```bash
docker compose exec web python manage.py loaddata fixtures/initial_data.json
```

Les fichiers images correspondants doivent également être présents dans le répertoire `media` du projet.

Cette commande est destinée à l'initialisation d'une nouvelle base de données.

### 7. Accéder à l'application

Ouvrir un navigateur et accéder à l'adresse suivante :

http://localhost:9000

## Interface d'administration

Pour créer un compte administrateur :

```bash
docker compose exec web python manage.py createsuperuser
```

Accéder ensuite à l'interface d'administration :

http://localhost:9000/admin/

## Principaux endpoints REST

| Endpoint | Description |
|---|---|
| `/api/services/` | Consultation des services |
| `/api/chambres/` | Consultation des chambres |
| `/api/reservation/` | Gestion des réservations|
| `/api/factures/` | Consultation des factures avec authentification |

## Persistance des données

Les données MySQL sont conservées dans un volume Docker nommé `mysql_data`, permettant leur conservation après l'arrêt des conteneurs.

## Arrêt de l'application

```bash
docker compose down
```

## Sécurité

Les paramètres confidentiels sont configurés dans le fichier `.env`, qui est exclu du dépôt GitHub.

Le paiement proposé dans l'application est uniquement une simulation à des fins pédagogiques. Aucune transaction bancaire réelle n'est effectuée.



Université Ibn Zohr – Faculté des Sciences – Centre d'Excellence IT.

Année universitaire 2026–2027.
