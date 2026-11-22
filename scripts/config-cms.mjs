// Génère admin/config.yml (configuration du CMS) à partir des fichiers data/textes/*.json.
// À relancer (npm run config-cms) seulement si un développeur ajoute un nouveau texte dans un gabarit.
// Le YAML produit est du JSON (le JSON est du YAML valide).
import fs from "node:fs";
import path from "node:path";

const sections = {
  commun: { label: "Commun (menu, pied de page, partage)", ordre: 1 },
  accueil: { label: "Page Accueil", ordre: 2 },
  portfolio: { label: "Page Portfolio", ordre: 3 },
  videos: { label: "Page Vidéos", ordre: 4 },
  contact: { label: "Page Contact", ordre: 5 },
  erreur404: { label: "Page 404 (introuvable)", ordre: 6 },
  interface: { label: "Petits textes de l'interface", ordre: 7 },
};

const libelles = {
  seo_titre: ["Titre de la page (onglet du navigateur, Google, partage)"],
  seo_description: ["Description (Google, partage)"],
  metier: ["Métier (données Google)"],
  description_personne: ["Description de l'artiste (données Google)"],
  partage_image: ["Image de partage (réseaux sociaux, 1200 × 630 px)"],
  partage_alt: ["Description de l'image de partage"],
  passer_au_contenu: ["Lien « aller au contenu » (lecteurs d'écran)"],
  marque_aria: ["Lien du logo (lecteurs d'écran)"],
  menu_aria: ["Nom du menu (lecteurs d'écran)"],
  menu_accueil: ["Menu : Accueil"],
  menu_portfolio: ["Menu : Portfolio"],
  menu_videos: ["Menu : Vidéos"],
  menu_contact: ["Menu : Contact"],
  langue_aria: ["Nom du sélecteur de langue (lecteurs d'écran)"],
  pied_texte: ["Pied de page : texte après « © année »"],
  pied_menu_aria: ["Nom du menu du pied de page (lecteurs d'écran)"],
  nouvel_onglet: ["Mention « nouvel onglet » (lecteurs d'écran)"],
  hero_aria: ["Grande image d'accueil : nom (lecteurs d'écran)"],
  hero_surtitre: ["Grande image d'accueil : petit texte au-dessus du nom"],
  hero_prenom: ["Grande image d'accueil : prénom"],
  hero_nom: ["Grande image d'accueil : nom (en couleur)"],
  bouton_portfolio: ["Bouton « Voir le portfolio »"],
  bouton_reel: ["Bouton « Demo reel »"],
  pause: ["Diaporama : bouton Pause"],
  lecture: ["Diaporama : bouton Lecture"],
  choisir_image_aria: ["Diaporama : points de navigation (lecteurs d'écran)"],
  selection_surtitre: ["Section Sélection : surtitre"],
  selection_titre: ["Section Sélection : titre"],
  selection_lien: ["Section Sélection : lien"],
  reel_surtitre: ["Section Demo reel : surtitre"],
  reel_titre: ["Section Demo reel : titre"],
  reel_lien: ["Section Demo reel : lien"],
  disciplines_surtitre: ["Section Disciplines : surtitre"],
  disciplines_titre: ["Section Disciplines : titre"],
  cta_surtitre: ["Bas de page : surtitre"],
  cta_titre: ["Bas de page : grand titre"],
  cta_texte: ["Bas de page : phrase"],
  cta_bouton: ["Bas de page : bouton contact"],
  cta_imdb: ["Bas de page : bouton IMDb"],
  surtitre: ["Surtitre (petit texte au-dessus du titre)"],
  titre: ["Titre"],
  intro: ["Phrase d'introduction"],
  filtre_aria: ["Filtres de catégories (lecteurs d'écran)"],
  courriel_label: ["Libellé : courriel"],
  courriel_copier_aria: ["Bouton copier le courriel (lecteurs d'écran)"],
  telephone_label: ["Libellé : téléphone"],
  telephone_copier_aria: ["Bouton copier le téléphone (lecteurs d'écran)"],
  copier: ["Bouton « Copier »"],
  copie: ["Bouton après copie (« Copié »)"],
  imdb_label: ["Libellé : IMDb"],
  imdb_lien: ["Texte du lien IMDb"],
  localisation_label: ["Libellé : localisation"],
  intro_fr: ["Phrase (français)"],
  intro_en: ["Phrase (anglais)"],
  bouton_fr: ["Bouton retour (français)"],
  bouton_en: ["Bouton retour (anglais)"],
  ouvrir_menu: ["Bouton du menu mobile : ouvrir"],
  fermer_menu: ["Bouton du menu mobile : fermer"],
  lire_video: ["Bouton lecture vidéo ({titre} = titre de la vidéo)"],
  afficher: ["Point du diaporama ({titre} = titre de l'image)"],
  agrandir: ["Image de la galerie ({titre} = titre de l'image)"],
  tout: ["Filtre « Tout »"],
  rendu_un: ["Nombre de rendus, singulier ({n} = nombre)"],
  rendu_plusieurs: ["Nombre de rendus, pluriel ({n} = nombre)"],
  visionneuse: ["Visionneuse d'images (lecteurs d'écran)"],
  fermer: ["Visionneuse : fermer"],
  precedente: ["Visionneuse : image précédente"],
  suivante: ["Visionneuse : image suivante"],
  aucune_video: ["Message quand il n'y a aucune vidéo"],
  video: ["Mot « Vidéo » (vignettes)"],
  copie_presse_papiers: ["Message après copie"],
  images_affichees_un: ["Filtre : images affichées, singulier ({n} = nombre)"],
  images_affichees_plusieurs: ["Filtre : images affichées, pluriel ({n} = nombre)"],
  erreur_local: ["Message d'erreur (fichier ouvert sans serveur)"],
  erreur_donnees: ["Message d'erreur (contenu illisible)"],
};

const humain = (k) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const label = (k) => (libelles[k] || [humain(k)])[0];

function champ(nom, valeur) {
  const long = (v) => String(v).length > 70;
  if (nom === "partage_image") {
    const img = (l) => ({ name: l, label: l === "fr" ? "Français" : "English", widget: "image", media_folder: "/images/site", public_folder: "/images/site" });
    return { name: nom, label: label(nom), widget: "object", collapsed: false, fields: [img("fr"), img("en")] };
  }
  if (valeur && typeof valeur === "object") {
    const w = long(valeur.fr) || long(valeur.en) ? "text" : "string";
    return {
      name: nom,
      label: label(nom),
      widget: "object",
      collapsed: false,
      fields: [
        { name: "fr", label: "Français", widget: w },
        { name: "en", label: "English", widget: w, required: false },
      ],
    };
  }
  return { name: nom, label: label(nom), widget: long(valeur) ? "text" : "string" };
}

const dir = "data/textes";
const fichiersTextes = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.basename(f, ".json"))
  .sort((a, b) => (sections[a]?.ordre || 99) - (sections[b]?.ordre || 99))
  .map((nom) => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, `${nom}.json`), "utf8"));
    return {
      name: nom,
      label: sections[nom]?.label || humain(nom),
      file: `data/textes/${nom}.json`,
      fields: Object.entries(data).map(([k, v]) => champ(k, v)),
    };
  });

const config = {
  backend: {
    name: "github",
    repo: "emirgc/yd",
    branch: "main",
    commit_messages: {
      create: "CMS : ajout de {{collection}} « {{slug}} »",
      update: "CMS : modification de {{collection}} « {{slug}} »",
      delete: "CMS : suppression de {{collection}} « {{slug}} »",
      uploadMedia: "CMS : ajout du fichier {{path}}",
      deleteMedia: "CMS : suppression du fichier {{path}}",
    },
  },
  site_url: "https://youssefdhane.net",
  display_url: "https://youssefdhane.net",
  logo: { src: "/images/site/favicon.svg" },
  media_folder: "/images/portfolio",
  public_folder: "/images/portfolio",
  media_libraries: { default: { config: { slugify_filename: true } } },
  collections: [
    {
      name: "portfolio",
      label: "Portfolio",
      description: "Images et catégories du portfolio. L'ordre de la liste est l'ordre d'affichage : glissez les images pour les réordonner.",
      files: [
        {
          name: "portfolio",
          label: "Images et catégories",
          file: "data/portfolio.json",
          fields: [
            {
              name: "images",
              label: "Images",
              label_singular: "image",
              widget: "list",
              add_to_top: true,
              summary: "{{fields.titre}}",
              fields: [
                { name: "fichier", label: "Image (JPG, 2400 px de large maximum)", widget: "image", media_folder: "/images/portfolio", public_folder: "/images/portfolio" },
                { name: "titre", label: "Titre (français)", widget: "string" },
                { name: "titre_en", label: "Titre (anglais)", widget: "string", required: false, hint: "Facultatif : sans lui, le titre français s'affiche aussi sur le site anglais." },
                {
                  name: "categorie",
                  label: "Catégorie",
                  widget: "relation",
                  collection: "portfolio",
                  file: "portfolio",
                  search_fields: ["categories.*.nom"],
                  display_fields: ["categories.*.nom"],
                  value_field: "categories.*.id",
                },
                { name: "vedette", label: "En vedette (diaporama et sélection de l'accueil)", widget: "boolean", default: false, required: false },
                { name: "largeur", label: "Largeur", widget: "hidden" },
                { name: "hauteur", label: "Hauteur", widget: "hidden" },
              ],
            },
            {
              name: "categories",
              label: "Catégories",
              label_singular: "catégorie",
              widget: "list",
              summary: "{{fields.nom}}",
              fields: [
                { name: "id", label: "Identifiant (minuscules, sans espaces ni accents, ex. vehicule)", widget: "string", pattern: ["^[a-z0-9-]+$", "Minuscules, chiffres et tirets seulement"] },
                { name: "nom", label: "Nom (français)", widget: "string" },
                { name: "nom_en", label: "Nom (anglais)", widget: "string", required: false },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "videos",
      label: "Vidéos",
      description: "La première vidéo de la liste est affichée en grand en haut de la page Vidéos.",
      files: [
        {
          name: "videos",
          label: "Liste des vidéos",
          file: "data/videos.json",
          fields: [
            {
              name: "videos",
              label: "Vidéos",
              label_singular: "vidéo",
              widget: "list",
              add_to_top: true,
              summary: "{{fields.titre}} ({{fields.annee}})",
              fields: [
                { name: "vimeo", label: "Numéro Vimeo (fin de l'adresse vimeo.com/123456789)", widget: "string", required: false },
                { name: "youtube", label: "Ou identifiant YouTube (youtube.com/watch?v=XXXXXXXX)", widget: "string", required: false },
                { name: "titre", label: "Titre (français)", widget: "string" },
                { name: "titre_en", label: "Titre (anglais)", widget: "string", required: false },
                { name: "annee", label: "Année", widget: "number", value_type: "int", required: false },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "coordonnees",
      label: "Coordonnées",
      files: [
        {
          name: "site",
          label: "Coordonnées et liens",
          file: "data/site.json",
          fields: [
            { name: "nom", label: "Nom affiché (logo, onglet)", widget: "string" },
            { name: "email", label: "Courriel", widget: "string" },
            { name: "telephone", label: "Téléphone", widget: "string" },
            { name: "ville", label: "Ville (pied de page et contact)", widget: "string" },
            { name: "demoReelVimeo", label: "Demo reel de l'accueil : numéro Vimeo", widget: "string" },
            { name: "imdb", label: "Lien IMDb (français)", widget: "string" },
            { name: "imdb_en", label: "Lien IMDb (anglais)", widget: "string", required: false },
            { name: "vimeo_profil", label: "Lien du profil Vimeo", widget: "string", required: false },
            { name: "competences", label: "Compétences (données Google)", widget: "list", required: false },
            {
              name: "adresse",
              label: "Adresse (données Google)",
              widget: "object",
              fields: [
                { name: "ville", label: "Ville", widget: "string" },
                { name: "region", label: "Province / région", widget: "string" },
                { name: "pays", label: "Code du pays (ex. CA)", widget: "string" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "textes",
      label: "Textes du site",
      description: "Tous les textes des pages, en français et en anglais.",
      files: fichiersTextes,
    },
  ],
};

fs.mkdirSync("admin", { recursive: true });
fs.writeFileSync(
  "admin/config.yml",
  "# Fichier généré par scripts/config-cms.mjs - ne pas modifier à la main (npm run config-cms).\n" + JSON.stringify(config, null, 2) + "\n"
);
const nb = fichiersTextes.reduce((n, f) => n + f.fields.length, 0);
console.log(`admin/config.yml écrit (${fichiersTextes.length} sections de textes, ${nb} champs).`);
