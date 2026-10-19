/* ==========================================================================
   Youssef Dhane — Artiste 3D
   Tout le contenu (images, vidéos, coordonnées) vient des fichiers du
   dossier /data. Ce script n'a normalement pas besoin d'être modifié.
   ========================================================================== */

(() => {
  "use strict";

  const ROOT = document.body.dataset.root || "./";
  const PAGE = document.body.dataset.page || "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LANG = document.documentElement.lang.startsWith("en") ? "en" : "fr";
  const PAGES = LANG === "en" ? `${ROOT}en/` : ROOT; // racine des pages dans la langue courante

  /* Textes de l'interface, en français et en anglais */
  const T = {
    fr: {
      errLocal: "Le contenu ne peut pas se charger en ouvrant le fichier directement. Lancez un petit serveur local (voir le fichier README.md).",
      errData: "Le contenu n'a pas pu être chargé. Vérifiez que les fichiers du dossier <code>data/</code> sont valides.",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      play: "Lire la vidéo : ",
      show: "Afficher : ",
      enlarge: "Agrandir : ",
      all: "Tout",
      renders: (n) => `${n} rendu${n > 1 ? "s" : ""}`,
      viewer: "Visionneuse d'images",
      close: "Fermer",
      prev: "Image précédente",
      next: "Image suivante",
      noVideos: "Aucune vidéo pour le moment.",
      video: "Vidéo",
      blurbs: {
        environnement: "Paysages, ruines, forêts et villes : des mondes entiers, du terrain au moindre détail.",
        personnage: "Visages et personnages réalistes, MetaHuman, sculpt et lookdev.",
        "hard-surface": "Véhicules, objets et produits modélisés avec précision.",
        espace: "Planètes, orbites et horizons lointains.",
      },
    },
    en: {
      errLocal: "Content can't load when the file is opened directly. Start a small local server (see README.md).",
      errData: "The content could not be loaded. Check that the files in the <code>data/</code> folder are valid.",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      play: "Play video: ",
      show: "Show: ",
      enlarge: "Enlarge: ",
      all: "All",
      renders: (n) => `${n} render${n > 1 ? "s" : ""}`,
      viewer: "Image viewer",
      close: "Close",
      prev: "Previous image",
      next: "Next image",
      noVideos: "No videos yet.",
      video: "Video",
      blurbs: {
        environnement: "Landscapes, ruins, forests and cities: entire worlds, from terrain to the smallest detail.",
        personnage: "Realistic faces and characters, MetaHuman, sculpting and lookdev.",
        "hard-surface": "Vehicles, objects and products modeled with precision.",
        espace: "Planets, orbits and distant horizons.",
      },
    },
  }[LANG];

  // En anglais, utilise les champs « _en » des fichiers JSON quand ils existent
  function localize(data) {
    if (LANG !== "en" || !data || typeof data !== "object") return data;
    const swap = (o) => {
      ["titre", "nom", "description"].forEach((k) => {
        if (o[`${k}_en`]) o[k] = o[`${k}_en`];
      });
      return o;
    };
    ["images", "categories", "videos"].forEach((k) => Array.isArray(data[k]) && data[k].forEach(swap));
    return data;
  }

  const ICONS = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>',
  };

  /* ------------------------------------------------------------------------
     Outils
     ------------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const escapeHTML = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const cache = {};
  function loadJSON(name) {
    if (!cache[name]) {
      cache[name] = fetch(`${ROOT}data/${name}.json`, { cache: "no-cache" }).then((r) => {
        if (!r.ok) throw new Error(`data/${name}.json introuvable`);
        return r.json();
      }).then(localize);
    }
    return cache[name];
  }

  function showDataError(container, err) {
    console.error(err);
    if (!container) return;
    const local = location.protocol === "file:";
    container.innerHTML = `<p class="empty-state">${local ? T.errLocal : T.errData}</p>`;
  }

  // Images : chemin complet et miniature (la miniature est facultative)
  const baseName = (file) => file.replace(/\.[^.]+$/, "");
  const imageSrc = (img) => `${ROOT}images/portfolio/${img.fichier}`;
  const thumbSrc = (img) =>
    img.miniature ? `${ROOT}images/portfolio/miniatures/${img.miniature}` : `${ROOT}images/portfolio/miniatures/${baseName(img.fichier)}.webp`;

  function imgTag(img, { cls = "", sizes = "100vw", eager = false, full = false } = {}) {
    const dims = img.largeur && img.hauteur ? ` width="${img.largeur}" height="${img.hauteur}"` : "";
    const src = full ? imageSrc(img) : thumbSrc(img);
    return `<img src="${src}" data-fallback="${imageSrc(img)}" alt="${escapeHTML(img.titre || "")}"${dims} sizes="${sizes}" class="${cls}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
  }

  // Fondu à l'arrivée de chaque image + repli sur l'image pleine taille si la miniature manque
  function wireImages(ctx = document) {
    $$("img[data-fallback]", ctx).forEach((el) => {
      if (el.dataset.wired) return;
      el.dataset.wired = "1";
      const ready = () => el.classList.add("is-ready");
      if (el.complete && el.naturalWidth) ready();
      el.addEventListener("load", ready);
      el.addEventListener("error", () => {
        if (el.src.endsWith(el.dataset.fallback)) return;
        el.src = el.dataset.fallback;
      });
    });
  }

  /* ------------------------------------------------------------------------
     En-tête : fond au défilement, masquage en descendant, menu mobile
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const menuOpen = document.body.classList.contains("menu-open");
      header.classList.toggle("is-scrolled", y > 24);
      const hide = !menuOpen && y > 400 && y > lastY + 4;
      const show = y < lastY - 4 || y < 400;
      if (hide) {
        header.classList.add("is-hidden");
        document.body.classList.add("is-header-hidden");
      } else if (show) {
        header.classList.remove("is-hidden");
        document.body.classList.remove("is-header-hidden");
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();

    const toggle = $(".menu-toggle");
    const nav = $("#nav");
    if (!toggle || !nav) return;
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? T.closeMenu : T.openMenu);
    };
    toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  // Le sélecteur de langue garde le filtre ou l'image en cours
  function initLangSwitch() {
    $$(".lang-switch a").forEach((a) => {
      a.addEventListener("click", () => {
        if (a.getAttribute("aria-current")) return;
        a.href = a.href.split(/[?#]/)[0] + location.search + location.hash;
      });
    });
  }

  /* ------------------------------------------------------------------------
     Révélations au défilement
     ------------------------------------------------------------------------ */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
            } else {
              const w = document.createElement("span");
              w.className = "word";
              w.innerHTML = `<span style="--i:${i++}">${escapeHTML(part)}</span>`;
              frag.appendChild(w);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(el);
  }

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;

  function observeReveals(ctx = document) {
    $$(".split", ctx).forEach(splitWords);
    $$(".reveal, .split", ctx).forEach((el) => {
      if (el.classList.contains("is-visible") || el.closest(".hero")) return; // le hero a sa propre entrée
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------------------
     Coordonnées (site.json) injectées dans la page
     ------------------------------------------------------------------------ */
  async function fillSiteInfo() {
    try {
      const site = await loadJSON("site");
      $$("[data-site]").forEach((el) => {
        const key = el.dataset.site;
        if (site[key] == null) return;
        if (key === "email") {
          el.textContent = site.email;
          if (el.tagName === "A") el.href = `mailto:${site.email}`;
        } else if (key === "telephone") {
          el.textContent = site.telephone;
          if (el.tagName === "A") el.href = `tel:${site.telephone.replace(/[^\d+]/g, "")}`;
        } else {
          el.textContent = site[key];
        }
      });
      // Liens externes (IMDb…) : la version anglaise du site ouvre IMDb en anglais
      $$("[data-site-link]").forEach((el) => {
        let url = site[el.dataset.siteLink];
        if (!url) return;
        if (LANG === "en") url = url.replace("imdb.com/fr/", "imdb.com/");
        el.href = url;
      });
      $$("[data-copy-from]").forEach((btn) => {
        const val = site[btn.dataset.copyFrom];
        if (val) btn.dataset.copy = val;
      });
      return site;
    } catch (err) {
      console.warn(err);
      return {};
    }
  }

  /* ------------------------------------------------------------------------
     Lecteur vidéo léger : vignette, puis lecteur Vimeo/YouTube au clic
     ------------------------------------------------------------------------ */
  // Métadonnées Vimeo (vignette, date, durée) via oEmbed
  const metaCache = {};
  function vimeoMeta(id) {
    if (!metaCache[id]) {
      metaCache[id] = fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=1280`)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({}));
    }
    return metaCache[id];
  }

  function videoThumb(video) {
    if (video.vignette) return Promise.resolve(video.vignette);
    if (video.youtube) return Promise.resolve(`https://i.ytimg.com/vi/${video.youtube}/hqdefault.jpg`);
    if (!video.vimeo) return Promise.resolve("");
    return vimeoMeta(video.vimeo).then((d) => d.thumbnail_url || "");
  }

  // Données structurées VideoObject pour Google (générées depuis videos.json)
  async function addVideoSchema(videos) {
    const items = await Promise.all(
      videos.filter((v) => v.vimeo).map(async (v) => {
        const m = await vimeoMeta(v.vimeo);
        if (!m.upload_date || !m.thumbnail_url) return null;
        const secs = Number(m.duration) || 0;
        return {
          "@type": "VideoObject",
          name: v.titre || m.title,
          description: v.description || v.titre || m.title,
          thumbnailUrl: m.thumbnail_url,
          uploadDate: m.upload_date.replace(" ", "T"),
          ...(secs ? { duration: `PT${Math.floor(secs / 60)}M${secs % 60}S` } : {}),
          embedUrl: `https://player.vimeo.com/video/${v.vimeo}`,
          url: `https://vimeo.com/${v.vimeo}`,
          inLanguage: LANG,
          creator: { "@type": "Person", name: "Youssef Dhane" },
        };
      })
    );
    const list = items.filter(Boolean);
    if (!list.length) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: list.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
    });
    document.head.appendChild(el);
  }

  function embedURL(video) {
    if (video.youtube) return `https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0`;
    return `https://player.vimeo.com/video/${video.vimeo}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
  }

  function playerHTML(video) {
    return `
      <div class="player" data-video>
        <img alt="" loading="lazy" decoding="async">
        <button class="player-btn" type="button" aria-label="${T.play}${escapeHTML(video.titre || "")}">
          <span class="play">${ICONS.play}</span>
        </button>
      </div>`;
  }

  function wirePlayer(el, video) {
    const img = $("img", el);
    videoThumb(video).then((url) => {
      if (!url) return;
      img.addEventListener("load", () => img.classList.add("is-ready"), { once: true });
      img.src = url;
    });
    $(".player-btn", el).addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = embedURL(video);
      iframe.title = video.titre || T.video;
      iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
      iframe.allowFullscreen = true;
      el.appendChild(iframe);
      el.classList.add("is-playing");
      iframe.focus();
    });
  }

  /* ------------------------------------------------------------------------
     ACCUEIL
     ------------------------------------------------------------------------ */
  async function initHome() {
    let data;
    try {
      data = await loadJSON("portfolio");
    } catch (err) {
      showDataError($("#featured"), err);
      document.documentElement.classList.add("is-loaded");
      return;
    }
    const images = data.images || [];
    const featured = images.filter((i) => i.vedette);
    const pool = featured.length ? featured : images.slice(0, 6);

    initHeroSlides(pool);
    renderFeatured(pool, Object.fromEntries((data.categories || []).map((c) => [c.id, c.nom])));
    renderDisciplines(data.categories || [], images);
    initDemoReel();
    initCtaParallax(images);
  }

  function initHeroSlides(pool) {
    const hero = $(".hero");
    const wrap = $(".hero-slides");
    const progress = $(".hero-progress");
    const caption = $(".hero-caption");
    if (!hero || !wrap || !pool.length) {
      document.documentElement.classList.add("is-loaded");
      return;
    }
    const slides = pool.slice(0, 6);
    const SLIDE_MS = 6500;
    hero.style.setProperty("--slide-ms", `${SLIDE_MS}ms`);

    wrap.innerHTML = slides
      .map((img, i) => `<div class="hero-slide"><img ${i === 0 ? 'fetchpriority="high"' : ""} src="${i === 0 ? imageSrc(img) : ""}" data-src="${imageSrc(img)}" alt=""></div>`)
      .join("");
    progress.innerHTML = slides
      .map((img, i) => `<button type="button" aria-label="${T.show}${escapeHTML(img.titre)}" data-i="${i}"></button>`)
      .join("");

    const slideEls = $$(".hero-slide", wrap);
    const dots = $$("button", progress);
    let current = -1;
    let timer = null;

    const load = (i) => {
      const im = $("img", slideEls[i]);
      if (!im.getAttribute("src")) im.src = im.dataset.src;
      return im;
    };

    const go = (i) => {
      i = (i + slides.length) % slides.length;
      if (i === current) return;
      const im = load(i);
      const show = () => {
        slideEls.forEach((s, k) => s.classList.toggle("is-active", k === i));
        dots.forEach((d, k) => {
          d.classList.remove("is-active");
          d.classList.toggle("is-done", k < i);
          d.setAttribute("aria-current", String(k === i));
        });
        // Relance l'animation de la barre active
        void dots[i].offsetWidth;
        dots[i].classList.add("is-active");
        if (caption) {
          caption.style.opacity = "0";
          setTimeout(() => {
            caption.textContent = slides[i].titre;
            caption.style.opacity = "1";
          }, 200);
        }
        current = i;
        load((i + 1) % slides.length); // précharge la suivante
        schedule();
      };
      if (im.complete && im.naturalWidth) show();
      else im.addEventListener("load", show, { once: true });
    };

    const schedule = () => {
      clearTimeout(timer);
      if (slides.length < 2 || hero.classList.contains("is-paused")) return;
      timer = setTimeout(() => go(current + 1), SLIDE_MS);
    };

    dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.i))));
    document.addEventListener("visibilitychange", () => {
      hero.classList.toggle("is-paused", document.hidden);
      if (document.hidden) clearTimeout(timer);
      else {
        // Repart proprement de la diapo en cours
        const i = current;
        current = -1;
        go(i);
      }
    });

    // Le premier visuel apparaît, puis le texte entre en scène
    const first = load(0);
    const start = () => {
      go(0);
      requestAnimationFrame(() => document.documentElement.classList.add("is-loaded"));
    };
    if (first.complete && first.naturalWidth) start();
    else {
      first.addEventListener("load", start, { once: true });
      first.addEventListener("error", start, { once: true });
      setTimeout(() => document.documentElement.classList.add("is-loaded"), 1800);
    }
  }

  function renderFeatured(pool, catName = {}) {
    const grid = $("#featured");
    if (!grid) return;
    grid.innerHTML = pool
      .slice(0, 8)
      .map((img, i) => `
        <a class="tile reveal" style="--delay:${(i % 3) * 80}ms" href="${PAGES}portfolios/?image=${encodeURIComponent(baseName(img.fichier))}">
          ${imgTag(img, { sizes: i === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 50vw, 33vw", full: i === 0 })}
          <span class="tile-label"><span>${escapeHTML(img.titre)}</span><small>${escapeHTML(catName[img.categorie] || "")}</small></span>
        </a>`)
      .join("");
    wireImages(grid);
    observeReveals(grid);
  }

  function renderDisciplines(categories, images) {
    const wrap = $("#disciplines");
    if (!wrap) return;
    const blurbs = T.blurbs;
    wrap.innerHTML = categories
      .map((cat, i) => {
        const list = images.filter((im) => im.categorie === cat.id);
        const bg = list[0];
        return `
          <a class="discipline reveal" style="--delay:${i * 90}ms" href="${PAGES}portfolios/?categorie=${encodeURIComponent(cat.id)}">
            ${bg ? `<span class="discipline-bg" aria-hidden="true">${imgTag(bg, { sizes: "25vw" })}</span>` : ""}
            <span>
              <span class="discipline-num">0${i + 1}</span>
              <h3>${escapeHTML(cat.nom)}</h3>
              ${blurbs[cat.id] ? `<p>${blurbs[cat.id]}</p>` : ""}
            </span>
            <span class="discipline-count">${T.renders(list.length)} ${ICONS.arrow}</span>
          </a>`;
      })
      .join("");
    wireImages(wrap);
    observeReveals(wrap);
  }

  async function initDemoReel() {
    const slot = $("#demo-reel");
    if (!slot) return;
    const [site, vids] = await Promise.all([loadJSON("site").catch(() => ({})), loadJSON("videos").catch(() => ({ videos: [] }))]);
    const id = site.demoReelVimeo;
    const video = (vids.videos || []).find((v) => v.vimeo === id) || (id ? { vimeo: id, titre: "Demo Reel" } : (vids.videos || [])[0]);
    if (!video) return;
    slot.innerHTML = playerHTML(video);
    wirePlayer($(".player", slot), video);
  }

  function initCtaParallax(images) {
    const cta = $(".cta");
    const bg = $(".cta-bg");
    if (!cta || !bg) return;
    const pick = images.find((i) => i.fichier.startsWith("au-dessus")) || images[images.length - 1];
    if (!pick) return;
    bg.innerHTML = `<img src="${imageSrc(pick)}" alt="" loading="lazy" decoding="async">`;
    if (reduceMotion) return;
    const img = $("img", bg);
    let inView = false;
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(cta);
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!inView || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = cta.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1 → 1
        img.style.transform = `translate3d(0, ${(-10 + p * 10).toFixed(2)}%, 0)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     PORTFOLIO
     ------------------------------------------------------------------------ */
  async function initPortfolio() {
    const gallery = $("#gallery");
    const chipsWrap = $("#chips");
    let data;
    try {
      data = await loadJSON("portfolio");
    } catch (err) {
      showDataError(gallery, err);
      return;
    }
    const images = data.images || [];
    const categories = data.categories || [];
    const catName = Object.fromEntries(categories.map((c) => [c.id, c.nom]));

    // Filtres
    const params = new URLSearchParams(location.search);
    let active = params.get("categorie") || "tout";
    if (active !== "tout" && !catName[active]) active = "tout";

    const chipData = [{ id: "tout", nom: T.all, n: images.length }].concat(
      categories.map((c) => ({ ...c, n: images.filter((i) => i.categorie === c.id).length })).filter((c) => c.n > 0)
    );
    chipsWrap.innerHTML =
      '<span class="chip-indicator" aria-hidden="true"></span>' +
      chipData
        .map((c) => `<button class="chip" type="button" data-cat="${escapeHTML(c.id)}" aria-pressed="${c.id === active}">${escapeHTML(c.nom)} <sup>${c.n}</sup></button>`)
        .join("");
    const indicator = $(".chip-indicator", chipsWrap);
    const chips = $$(".chip", chipsWrap);

    const moveIndicator = () => {
      const btn = chips.find((c) => c.dataset.cat === active) || chips[0];
      indicator.style.width = `${btn.offsetWidth}px`;
      indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
    };
    moveIndicator();
    requestAnimationFrame(() => chipsWrap.classList.add("is-ready"));
    window.addEventListener("resize", moveIndicator);
    if (document.fonts) document.fonts.ready.then(moveIndicator);

    // Galerie
    gallery.innerHTML = images
      .map((img, i) => `
        <a class="gallery-item" href="${imageSrc(img)}" data-index="${i}" data-cat="${escapeHTML(img.categorie || "")}" aria-label="${T.enlarge}${escapeHTML(img.titre)}">
          ${imgTag(img, { sizes: "(max-width: 520px) 100vw, (max-width: 1100px) 50vw, 33vw" })}
          <span class="tile-label"><span>${escapeHTML(img.titre)}</span><small>${escapeHTML(catName[img.categorie] || "")}</small></span>
        </a>`)
      .join("");
    wireImages(gallery);
    const items = $$(".gallery-item", gallery);

    // Apparition en cascade, par vagues à mesure qu'on défile
    let batch = [];
    let flushQueued = false;
    const flush = () => {
      batch.forEach((el, k) => {
        el.style.setProperty("--delay", `${Math.min(k, 8) * 60}ms`);
        el.classList.add("is-visible");
      });
      batch = [];
      flushQueued = false;
    };
    const itemObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        itemObserver.unobserve(e.target);
        batch.push(e.target);
      });
      if (batch.length && !flushQueued) {
        flushQueued = true;
        requestAnimationFrame(flush);
      }
    }, { rootMargin: "0px 0px -5% 0px" });

    const visibleItems = () => items.filter((el) => !el.classList.contains("is-hidden"));

    const applyFilter = (animate) => {
      items.forEach((el) => {
        const match = active === "tout" || el.dataset.cat === active;
        el.classList.toggle("is-hidden", !match);
        if (animate) {
          el.classList.remove("is-visible");
          el.style.removeProperty("--delay");
        }
      });
      visibleItems().forEach((el) => itemObserver.observe(el));
    };

    applyFilter(false);

    chips.forEach((chip) =>
      chip.addEventListener("click", () => {
        if (chip.dataset.cat === active) return;
        active = chip.dataset.cat;
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        moveIndicator();
        chip.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
        const url = new URL(location.href);
        if (active === "tout") url.searchParams.delete("categorie");
        else url.searchParams.set("categorie", active);
        url.searchParams.delete("image");
        history.replaceState(null, "", url);
        applyFilter(true);
        const top = $(".filters").getBoundingClientRect().top + window.scrollY - 8;
        if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      })
    );

    // Visionneuse
    const lb = createLightbox(images, catName);
    gallery.addEventListener("click", (e) => {
      const a = e.target.closest(".gallery-item");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const list = visibleItems().map((el) => Number(el.dataset.index));
      lb.open(list, Number(a.dataset.index), a);
    });

    // Lien direct vers une image : /portfolios/?image=nom
    const deep = params.get("image");
    if (deep) {
      const idx = images.findIndex((i) => baseName(i.fichier) === deep);
      if (idx > -1) {
        const list = visibleItems().map((el) => Number(el.dataset.index));
        lb.open(list.includes(idx) ? list : images.map((_, k) => k), idx, items[idx]);
      }
    }
  }

  function createLightbox(images, catName) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", T.viewer);
    lb.innerHTML = `
      <div class="lb-top">
        <span class="lb-count" aria-live="polite"></span>
        <button class="lb-btn lb-close" type="button" aria-label="${T.close}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="lb-stage"><img alt=""></div>
      <div class="lb-bottom">
        <div><div class="lb-title"></div><div class="lb-cat"></div></div>
        <div class="lb-nav">
          <button class="lb-btn lb-prev" type="button" aria-label="${T.prev}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
          </button>
          <button class="lb-btn lb-next" type="button" aria-label="${T.next}">${ICONS.arrow}</button>
        </div>
      </div>`;
    document.body.appendChild(lb);

    const stage = $(".lb-stage", lb);
    const img = $(".lb-stage img", lb);
    const title = $(".lb-title", lb);
    const cat = $(".lb-cat", lb);
    const count = $(".lb-count", lb);
    let list = [];
    let pos = 0;
    let opener = null;
    let scrollY = 0;

    const preload = (k) => {
      const im = images[list[(k + list.length) % list.length]];
      if (im) new Image().src = imageSrc(im);
    };

    const render = (dir = 0) => {
      const data = images[list[pos]];
      const apply = () => {
        img.classList.add("is-loading");
        img.alt = data.titre || "";
        // Affiche d'abord la miniature (déjà en cache), puis la pleine résolution
        img.src = thumbSrc(data);
        const full = new Image();
        full.onload = () => {
          if (images[list[pos]] !== data) return;
          img.src = full.src;
          img.classList.remove("is-loading");
        };
        full.onerror = () => img.classList.remove("is-loading");
        full.src = imageSrc(data);
        img.onerror = () => { if (!img.src.endsWith(imageSrc(data))) img.src = imageSrc(data); };
        img.classList.remove("is-swapping-next", "is-swapping-prev");
        title.textContent = data.titre || "";
        cat.textContent = catName[data.categorie] || "";
        count.textContent = `${String(pos + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
        preload(pos + 1);
        preload(pos - 1);
      };
      if (dir && !reduceMotion) {
        img.classList.add(dir > 0 ? "is-swapping-next" : "is-swapping-prev");
        setTimeout(apply, 140);
      } else apply();
    };

    const step = (d) => {
      if (list.length < 2) return;
      pos = (pos + d + list.length) % list.length;
      render(d);
    };

    const open = (l, index, from) => {
      list = l;
      pos = Math.max(0, list.indexOf(index));
      opener = from || null;
      render();
      scrollY = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      lb.classList.add("is-open");
      if (!reduceMotion && from) {
        // L'image grandit depuis la vignette cliquée
        const r = from.getBoundingClientRect();
        requestAnimationFrame(() => {
          const t = img.getBoundingClientRect();
          if (!t.width) return;
          const sx = r.width / t.width;
          const sy = r.height / t.height;
          const dx = r.left + r.width / 2 - (t.left + t.width / 2);
          const dy = r.top + r.height / 2 - (t.top + t.height / 2);
          img.animate(
            [{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.6 }, { transform: "none", opacity: 1 }],
            { duration: 480, easing: "cubic-bezier(0.32, 0.72, 0, 1)" }
          );
        });
      }
      $(".lb-close", lb).focus({ preventScroll: true });
    };

    const close = () => {
      lb.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      window.scrollTo(0, scrollY);
      const url = new URL(location.href);
      if (url.searchParams.has("image")) {
        url.searchParams.delete("image");
        history.replaceState(null, "", url);
      }
      if (opener) opener.focus({ preventScroll: true });
    };

    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-next", lb).addEventListener("click", () => step(1));
    $(".lb-prev", lb).addEventListener("click", () => step(-1));
    stage.addEventListener("click", (e) => { if (e.target === stage) close(); });

    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        // Garde le focus dans la visionneuse
        const f = $$("button", lb);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });

    // Balayage sur mobile (un rapide coup de doigt suffit)
    let sx = 0, sy = 0, st = 0, tracking = false;
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { tracking = false; return; }
      tracking = true;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = performance.now();
    }, { passive: true });
    stage.addEventListener("touchmove", (e) => {
      if (!tracking || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - sx;
      const dy = e.touches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy)) img.style.transform = `translateX(${dx * 0.6}px)`;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      const v = Math.abs(dx) / (performance.now() - st);
      img.style.transform = "";
      if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 60 || v > 0.3)) step(dx < 0 ? 1 : -1);
      else if (dy > 100 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
    });

    return { open, close };
  }

  /* ------------------------------------------------------------------------
     VIDÉOS
     ------------------------------------------------------------------------ */
  async function initVideos() {
    const feature = $("#video-feature");
    const grid = $("#video-grid");
    let data;
    try {
      data = await loadJSON("videos");
    } catch (err) {
      showDataError(grid, err);
      return;
    }
    const videos = (data.videos || []).filter((v) => v.vimeo || v.youtube);
    if (!videos.length) {
      grid.innerHTML = `<p class="empty-state">${T.noVideos}</p>`;
      return;
    }
    const [first, ...rest] = videos;

    const info = (v, tag) => `
      <div class="video-info">
        <${tag}>${escapeHTML(v.titre || "")}</${tag}>
        ${v.annee ? `<span class="meta">${escapeHTML(String(v.annee))}</span>` : ""}
      </div>`;

    feature.innerHTML = `<div class="reveal">${playerHTML(first)}${info(first, "h2")}</div>`;
    wirePlayer($(".player", feature), first);

    grid.innerHTML = rest
      .map((v, i) => `<article class="reveal" style="--delay:${(i % 2) * 100}ms">${playerHTML(v)}${info(v, "h3")}</article>`)
      .join("");
    $$(".player", grid).forEach((el, i) => wirePlayer(el, rest[i]));
    observeReveals(feature);
    observeReveals(grid);
    addVideoSchema(videos);
  }

  /* ------------------------------------------------------------------------
     CONTACT
     ------------------------------------------------------------------------ */
  function initCopyButtons() {
    $$(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        btn.classList.add("is-copied");
        clearTimeout(btn._t);
        btn._t = setTimeout(() => btn.classList.remove("is-copied"), 1800);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Démarrage
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", async () => {
    initHeader();
    initLangSwitch();
    $$(".split").forEach(splitWords);
    const sitePromise = fillSiteInfo();
    $$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

    if (PAGE !== "home") requestAnimationFrame(() => document.documentElement.classList.add("is-loaded"));

    if (PAGE === "home") await initHome();
    if (PAGE === "portfolio") await initPortfolio();
    if (PAGE === "videos") await initVideos();
    if (PAGE === "contact") {
      await sitePromise;
      initCopyButtons();
    }
    observeReveals();
  });
})();
