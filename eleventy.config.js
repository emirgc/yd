// Génère le site à partir des gabarits (src/) et du contenu (data/).
// Le contenu se modifie dans le CMS (/admin) : pas besoin de toucher à ce fichier.
import fs from "node:fs";
import path from "node:path";

const lireJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true, trimBlocks: true, lstripBlocks: true });

  // Contenu éditable : data/*.json et data/textes/*.json
  eleventyConfig.addGlobalData("site", () => lireJSON("data/site.json"));
  eleventyConfig.addGlobalData("portfolio", () => lireJSON("data/portfolio.json"));
  eleventyConfig.addGlobalData("textes", () => {
    const dir = "data/textes";
    return Object.fromEntries(
      fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => [path.basename(f, ".json"), lireJSON(path.join(dir, f))])
    );
  });
  eleventyConfig.addGlobalData("langues", ["fr", "en"]);
  eleventyConfig.addGlobalData("urlSite", "https://youssefdhane.net");
  eleventyConfig.addGlobalData("annee", new Date().getFullYear());
  eleventyConfig.addGlobalData("aujourdhui", new Date().toISOString().slice(0, 10));

  // {{ textes.accueil.cta_titre | tr(lang) }} → le texte dans la langue de la page
  eleventyConfig.addFilter("tr", (v, lang) => {
    if (v && typeof v === "object") return v[lang] || v.fr || "";
    return v ?? "";
  });
  // Tous les textes d'un groupe dans une langue : { cle: "texte" }
  eleventyConfig.addFilter("traduire", (obj, lang) =>
    Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, v && typeof v === "object" ? v[lang] || v.fr : v]))
  );
  // Sérialisation sûre pour <script type="application/json"> et JSON-LD
  eleventyConfig.addFilter("json", (v, indent) =>
    JSON.stringify(v, null, indent || 0).replace(/</g, "\\u003c").replace(/\n/g, "\n  ")
  );
  // Remplace {cle} dans un texte : "{n} rendus" | remplace({n: 3})
  eleventyConfig.addFilter("remplace", (str, vals) =>
    String(str).replace(/\{(\w+)\}/g, (m, k) => (vals[k] != null ? vals[k] : m))
  );

  // Données structurées (JSON-LD) d'une page
  eleventyConfig.addFilter("jsonld", function (cle, lang, schema) {
    const { site, textes, urlSite, portfolio } = this.ctx;
    const tr = (v) => (v && typeof v === "object" ? v[lang] || v.fr : v);
    const T = textes[cle];
    const C = textes.commun;
    const chemins = { accueil: "", portfolio: "portfolios/", videos: "videos/", contact: "contact/" };
    const url = `${urlSite}/${lang === "en" ? "en/" : ""}${chemins[cle]}`;
    const vedette = (portfolio.images || []).find((i) => i.vedette) || (portfolio.images || [])[0];
    const page = {
      "@type": schema.type,
      "@id": `${url}#webpage`,
      url,
      name: tr(T.seo_titre),
      description: tr(T.seo_description),
      inLanguage: lang,
      isPartOf: { "@id": `${urlSite}/#website` },
      [schema.rel]: { "@id": `${urlSite}/#person` },
    };
    if (vedette)
      page.primaryImageOfPage = { "@type": "ImageObject", url: `${urlSite}/images/portfolio/${vedette.fichier.split("/").pop()}` };
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": `${urlSite}/#website`, url: `${urlSite}/`, name: site.nom, inLanguage: ["fr", "en"], publisher: { "@id": `${urlSite}/#person` } },
        {
          "@type": "Person",
          "@id": `${urlSite}/#person`,
          name: site.nom,
          jobTitle: tr(C.metier),
          description: tr(C.description_personne),
          url: `${urlSite}/${lang === "en" ? "en/" : ""}`,
          email: `mailto:${site.email}`,
          telephone: site.telephone.replace(/[^\d+]/g, ""),
          address: { "@type": "PostalAddress", addressLocality: site.adresse?.ville, addressRegion: site.adresse?.region, addressCountry: site.adresse?.pays },
          knowsAbout: site.competences || [],
          sameAs: [site.vimeo_profil, site.imdb_en || site.imdb].filter(Boolean),
        },
        page,
      ],
    };
    return JSON.stringify(graph, null, 2).replace(/</g, "\\u003c").replace(/\n/g, "\n  ");
  });

  ["assets", "images", "data", "admin", "CNAME", "robots.txt"].forEach((p) => eleventyConfig.addPassthroughCopy(p));
  eleventyConfig.addWatchTarget("data/");

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    htmlTemplateEngine: "njk",
    templateFormats: ["njk"],
  };
}
