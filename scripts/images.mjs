// Prépare les images du portfolio pour le site publié.
// Pour chaque image de data/portfolio.json :
//   - crée images/portfolio/miniatures/<nom>.webp (960 px) et grandes/<nom>.webp (1920 px) si elles manquent ;
//   - renseigne largeur / hauteur si elles manquent.
// Usage : node scripts/images.mjs [dossier]   (par défaut : _site, le site généré par Eleventy)
// Le dossier source n'est jamais modifié quand on vise _site : rien n'est commité, pas de boucle.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const racine = process.argv[2] || "_site";
const jsonPath = path.join(racine, "data/portfolio.json");
const dossier = path.join(racine, "images/portfolio");
const tailles = { miniatures: 960, grandes: 1920 };

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let crees = 0;
let manquantes = 0;

for (const img of data.images || []) {
  if (!img.fichier) continue;
  const nom = String(img.fichier).split("/").pop();
  const source = path.join(dossier, nom);
  if (!fs.existsSync(source)) {
    console.warn(`⚠️  Image introuvable : images/portfolio/${nom}`);
    manquantes++;
    continue;
  }
  const base = nom.replace(/\.[^.]+$/, "");
  for (const [sous, largeur] of Object.entries(tailles)) {
    const cible = path.join(dossier, sous, `${base}.webp`);
    if (fs.existsSync(cible)) continue;
    fs.mkdirSync(path.dirname(cible), { recursive: true });
    await sharp(source).rotate().resize({ width: largeur, withoutEnlargement: true }).webp({ quality: 82 }).toFile(cible);
    console.log(`✓ ${sous}/${base}.webp`);
    crees++;
  }
  if (!img.largeur || !img.hauteur) {
    const meta = await sharp(source).rotate().metadata();
    const tourne = (meta.orientation || 1) >= 5;
    img.largeur = tourne ? meta.height : meta.width;
    img.hauteur = tourne ? meta.width : meta.height;
  }
}

const ligne = (o) => "    " + JSON.stringify(o);
const sortie =
  "{\n" +
  Object.entries(data)
    .map(([k, v]) => (Array.isArray(v) ? `  ${JSON.stringify(k)}: [\n${v.map(ligne).join(",\n")}\n  ]` : `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`))
    .join(",\n") +
  "\n}\n";
fs.writeFileSync(jsonPath, sortie);
console.log(`Images : ${crees} version(s) WebP créée(s), ${manquantes} image(s) introuvable(s).`);
