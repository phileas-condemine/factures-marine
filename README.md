# Factures – Marine Olivari

App React de génération de factures avec export PDF direct.

## Installation et lancement

Prérequis : **Node.js** installé (https://nodejs.org, version 16+)

```bash
# 1. Installer les dépendances (une seule fois)
npm install

# 2. Lancer l'app
npm start
```

L'app s'ouvre automatiquement sur http://localhost:3000

## Export PDF

Le bouton "Télécharger la facture PDF" génère et télécharge directement le fichier
`facture_<salle>_<mois>.pdf` dans votre dossier Téléchargements.

## Ajouter / modifier un cours

Éditez le fichier `src/data.js` :
- Ajouter une salle : ajouter une entrée dans l'objet `SALLES`
- Modifier un tarif : changer la valeur `paie` dans `jours`
- Modifier les infos prestataire : changer l'objet `PRESTATAIRE`
