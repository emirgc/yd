# Site de Youssef Dhane — guide de mise à jour

Pas besoin de toucher au code. Tout le contenu se modifie dans les 3 fichiers du dossier `data/`.

Le site existe en **français** (`/`) et en **anglais** (`/en/`), avec un bouton FR / EN en haut de chaque page.
Les deux versions lisent les mêmes fichiers `data/` : une image ajoutée apparaît dans les deux langues.

| Je veux…                         | Fichier à modifier      |
| -------------------------------- | ----------------------- |
| Ajouter / retirer une image      | `data/portfolio.json`   |
| Ajouter / retirer une vidéo      | `data/videos.json`      |
| Changer courriel, téléphone, ville | `data/site.json`      |

Ouvre ces fichiers avec un éditeur de texte (TextEdit en mode « texte brut », ou mieux : VS Code).

---

## Ajouter une image au portfolio

1. Copie ton image (JPG, idéalement 2400 px de large maximum) dans `images/portfolio/`.
   Donne-lui un nom simple, sans espaces ni accents : `foret-nocturne.jpg`.
2. Ouvre `data/portfolio.json` et ajoute une ligne dans la liste `"images"` :

```json
{"fichier": "foret-nocturne.jpg", "titre": "Forêt nocturne", "titre_en": "Night Forest", "categorie": "environnement", "vedette": false},
```

- **fichier** : le nom exact du fichier.
- **titre** : ce qui s'affiche sous l'image (accents permis).
- **titre_en** : le titre en anglais (facultatif — sans lui, le titre français s'affiche aussi sur le site anglais).
- **categorie** : `environnement`, `personnage`, `hard-surface` ou `espace`.
- **vedette** : `true` pour que l'image apparaisse dans le diaporama et la sélection de l'accueil.

L'ordre des lignes est l'ordre d'affichage : mets les nouveautés en haut.

> ⚠️ Attention aux virgules : chaque ligne se termine par une virgule, **sauf la dernière** de la liste.
> En cas de doute, colle le contenu du fichier sur https://jsonlint.com pour vérifier.

*Facultatif :* une miniature légère `images/portfolio/miniatures/foret-nocturne.webp` (960 px de large) rend la galerie plus rapide. Sans elle, le site utilise l'image complète automatiquement.

### Ajouter une catégorie
Ajoute une ligne dans `"categories"` en haut de `portfolio.json` :
```json
{"id": "vehicule", "nom": "Véhicules", "nom_en": "Vehicles"},
```
puis utilise `"categorie": "vehicule"` sur les images.

---

## Ajouter une vidéo

Mets la vidéo sur Vimeo (ou YouTube), puis ajoute une ligne dans `data/videos.json` :

```json
{"vimeo": "1072597168", "titre": "Demo Reel", "titre_en": "Demo Reel", "annee": 2025, "description": "Courte description.", "description_en": "Short description."},
```

- Le numéro Vimeo est la fin de l'adresse : `vimeo.com/`**`1072597168`**.
- Pour YouTube, remplace `"vimeo"` par `"youtube"` avec l'identifiant (`youtube.com/watch?v=`**`XXXXXXXX`**).
- `titre_en` et `description_en` sont facultatifs (version anglaise).
- La vignette est récupérée automatiquement.
- **La première vidéo de la liste** est affichée en grand en haut de la page Vidéos.

Le demo reel de la page d'accueil se règle dans `data/site.json` (`"demoReelVimeo"`).

---

## Voir le site sur son ordinateur avant de le publier

Double-clique sur **`apercu.command`** (Mac). Le site s'ouvre dans le navigateur.
(La première fois, si macOS bloque le fichier : clic droit → Ouvrir.)

Ouvrir directement `index.html` ne suffit pas : le navigateur refuse de lire les fichiers `data/` sans petit serveur.

---

## Structure

```
index.html              Accueil
portfolios/index.html   Portfolio
videos/index.html       Vidéos
contact/index.html      Contact
en/                     Les mêmes pages, en anglais
data/                   ← le contenu (à modifier)
images/portfolio/       ← les rendus
assets/css, assets/js   Style et animations (pas besoin d'y toucher)
```
