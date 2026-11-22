# Site de Youssef Dhane - guide de mise à jour

Tout le site se modifie depuis une interface web, sans toucher au code :

## 👉 https://youssefdhane.net/admin/

Images, vidéos, catégories, coordonnées et **tous les textes** (titres, boutons, menu, pied de page, descriptions Google…), en français et en anglais.
Après « Enregistrer », le site en ligne est mis à jour en 1 à 2 minutes.

---

## Première connexion (une seule fois)

1. Avoir un compte GitHub et avoir accepté l'invitation au dépôt `emirgc/yd` (courriel de GitHub).
2. Créer un jeton d'accès (classique) : https://github.com/settings/tokens/new
   - **Note** : `Site youssefdhane.net`
   - **Expiration** : la plus longue proposée (à renouveler ensuite de la même façon)
   - **Scopes** : cocher seulement **public_repo**
   - Cliquer **Generate token** et copier le code (`ghp_…`).
   - (Le propriétaire du dépôt, `emirgc`, peut aussi utiliser un jeton « fine-grained » limité à `yd` ;
     les collaborateurs invités ne le peuvent pas, GitHub ne leur proposant pas ce dépôt.)
3. Sur https://youssefdhane.net/admin/, cliquer **Se connecter avec un jeton d'accès** et coller le code.
   Le navigateur s'en souvient : pas besoin de le refaire à chaque fois.

---

## Ce qu'on trouve dans l'interface

| Menu                 | Contenu |
| -------------------- | ------- |
| **Portfolio**        | Les images (titre FR/EN, catégorie, « en vedette ») et les catégories. Glisser une image pour changer l'ordre d'affichage. |
| **Vidéos**           | Les vidéos Vimeo ou YouTube. La première de la liste est affichée en grand. |
| **Coordonnées**      | Nom, courriel, téléphone, ville, liens IMDb et Vimeo, demo reel de l'accueil. |
| **Textes du site**   | Chaque page et chaque petit texte, avec le français et l'anglais côte à côte. |

### Ajouter une image
Portfolio → Images et catégories → **Ajouter image** (elle se place en haut).
Glisser le fichier JPG (idéalement 2400 px de large maximum), donner un titre et une catégorie.
Les versions légères (WebP) pour mobile sont fabriquées automatiquement à la publication.

### Ajouter une vidéo
Vidéos → **Ajouter vidéo**. Le numéro Vimeo est la fin de l'adresse : `vimeo.com/`**`1072597168`**.
Pour YouTube, remplir plutôt le champ YouTube avec l'identifiant (`youtube.com/watch?v=`**`XXXXXXXX`**).

### Textes avec `{titre}` ou `{n}`
Certains petits textes contiennent `{titre}` ou `{n}` : ils sont remplacés automatiquement par le titre de l'image/vidéo ou par un nombre. Il faut les laisser tels quels.

---

## Pour le développeur

Le site est généré par [Eleventy](https://www.11ty.dev/) puis publié sur GitHub Pages par GitHub Actions (`.github/workflows/deploy.yml`) à chaque push sur `main`.

```
src/_includes/base.njk   Gabarit commun (head, SEO, menu, pied de page)
src/pages/*.njk          Les 4 pages, générées en FR (/) et en EN (/en/)
src/404.njk              Page 404 (bilingue)
data/                    ← le contenu, modifié par le CMS
  portfolio.json  videos.json  site.json
  textes/*.json          Tous les textes : {"fr": "...", "en": "..."}
admin/                   CMS (Sveltia CMS, compatible Decap). config.yml est généré.
scripts/config-cms.mjs   Génère admin/config.yml à partir de data/textes/ (npm run config-cms)
scripts/images.mjs       Crée les WebP (miniatures 960 px, grandes 1920 px) et les dimensions, dans _site
assets/css, assets/js    Style et animations
```

- **Aperçu local** : double-cliquer sur `apercu.command` (Mac, nécessite Node.js) ou `npm install && npm run dev`, puis http://localhost:8080.
- **CMS en local** (sans GitHub) : avec l'aperçu lancé, ouvrir http://localhost:8080/admin/ dans **Chrome, Edge ou Brave** (Safari et Firefox ne permettent pas d'accéder à un dossier), cliquer le bouton du dépôt local (« Work with Local Repository ») et choisir le dossier **racine** du projet (celui qui contient `.git`, pas `data/`). Les modifications sont écrites directement dans `data/` (visibles dans `git status`) et l'aperçu se met à jour ; rien n'est publié tant qu'on ne fait pas de commit et de push.
- **Ajouter un texte dans un gabarit** : l'ajouter dans `data/textes/<page>.json`, l'utiliser avec `{{ textes.<page>.<cle> | tr(lang) }}`, puis lancer `npm run config-cms` (et ajouter un libellé dans `scripts/config-cms.mjs`).
- Les petits textes de l'interface JavaScript (`data/textes/interface.json`) sont injectés dans chaque page (`#textes-interface`) et lus par `assets/js/main.js`.
