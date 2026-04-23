const THEME_STORAGE_KEY = "iamyotto_theme_preference";
const ADMIN_PROJECTS_KEY = "iamyotto_admin_projects";
const TESTIMONIALS_KEY = "iamyotto_testimonials";
const CONTACT_MESSAGES_KEY = "iamyotto_contact_messages";
const DASHBOARD_PROJECT_COUNT_KEY = "iamyotto_dashboard_project_count";
const PORTFOLIO_VISITS_KEY = "iamyotto_portfolio_visits";
const ABOUT_PROFILE_KEY = "iamyotto_about_profile";
const ABOUT_STORY_KEY = "iamyotto_about_story";
const CONTACT_NOTIFY_EMAIL = "yottosotirehospicefredel@gmail.com";
const CONTACT_NOTIFY_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_NOTIFY_EMAIL)}`;

const INITIAL_TESTIMONIALS = [
  {
    name: "Marina K.",
    rating: 5,
    message: "Identite visuelle superbe, delais respectes et resultat tres professionnel.",
    createdAt: "2026-01-09T10:30:00.000Z",
  },
  {
    name: "Joel A.",
    rating: 5,
    message: "Tres satisfait du design, mon image de marque est plus forte qu'avant.",
    createdAt: "2026-01-13T15:00:00.000Z",
  },
  {
    name: "Prudence D.",
    rating: 4,
    message: "Bonne communication, visuels propres et impactants pour mes reseaux.",
    createdAt: "2026-01-17T09:20:00.000Z",
  },
  {
    name: "Kevin S.",
    rating: 5,
    message: "Excellent travail sur mon branding, je recommande sans hesitation.",
    createdAt: "2026-01-22T12:10:00.000Z",
  },
  {
    name: "Nadia T.",
    rating: 5,
    message: "Design premium, execution rapide, et tres bon sens du detail.",
    createdAt: "2026-01-28T11:05:00.000Z",
  },
  {
    name: "Rafael B.",
    rating: 4,
    message: "Le portfolio et les maquettes ont donne une vraie valeur a mon projet.",
    createdAt: "2026-02-03T08:40:00.000Z",
  },
  {
    name: "Evelyne C.",
    rating: 5,
    message: "Service tres pro, mes supports visuels sont coherents et memorables.",
    createdAt: "2026-02-07T17:00:00.000Z",
  },
  {
    name: "Patrick L.",
    rating: 5,
    message: "Le rendu final est moderne et efficace, exactement ce qu'il me fallait.",
    createdAt: "2026-02-12T14:15:00.000Z",
  },
  {
    name: "Sonia F.",
    rating: 4,
    message: "Accompagnement serieux avec de tres bonnes propositions creatives.",
    createdAt: "2026-02-18T16:35:00.000Z",
  },
  {
    name: "Edouard M.",
    rating: 5,
    message: "Merci pour la qualite, les visuels convertissent mieux qu'avant.",
    createdAt: "2026-02-24T13:25:00.000Z",
  },
  {
    name: "Client Test Negatif",
    rating: 1,
    message: "Service nul, arnaque, tres mauvais. Ceci est un avis test a supprimer dans admin.",
    createdAt: "2026-03-01T09:00:00.000Z",
    hiddenOnPortfolio: true,
    moderationTest: true,
  },
];

const projectGrid = document.getElementById("project-grid");
const importStatus = document.getElementById("import-status");
const heroProjectsButton = document.getElementById("hero-projects-btn");
const projectsPagination = document.getElementById("projects-pagination");

const testimonialsGrid = document.getElementById("testimonials-grid");
const testimonialsToggle = document.getElementById("testimonials-toggle");
const testimonialsToggleLess = document.getElementById("testimonials-toggle-less");
const testimonialForm = document.getElementById("testimonial-form");
const testimonialStatus = document.getElementById("testimonial-status");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const contactSubmit = document.getElementById("contact-submit");
const proofProjectCount = document.getElementById("proof-project-count");
const aboutPhoto = document.getElementById("about-photo");
const aboutCaptionText = document.getElementById("about-caption-text");
const aboutCopy = document.getElementById("about-copy");
const whatsappMessage = document.getElementById("whatsapp-message");
const whatsappMessageClose = document.getElementById("whatsapp-message-close");
const themeToggle = document.getElementById("theme-toggle");
const themeMenu = document.getElementById("theme-menu");
const themeOptions = Array.from(document.querySelectorAll(".theme-option"));
const siteHeader = document.querySelector(".site-header");
const siteNav = document.getElementById("site-nav");
const mobileNavToggle = document.getElementById("mobile-nav-toggle");
const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

const PROJECTS_PER_PAGE = 3;
const TESTIMONIAL_INITIAL_COUNT = 4;
const TESTIMONIAL_STEP_COUNT = 4;

let currentProjectPage = 1;
let visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
let testimonialExpanded = false;
let renderedProjects = [];
const previewIntervals = new Map();
const touchPreviewTimeouts = new Map();
const projectBlobUrls = new Set();
let modalBlobUrl = "";
let modalState = null;
let modalAutoSlideInterval = null;
let projectPageTransitionTimeout = null;
let projectPageEnterTimeout = null;
let aboutPhotoBlobUrl = "";
let touchTapState = {
  cardKey: "",
  at: 0,
};
let whatsappMessageDismissed = false;
const cloudSync = window.IamyottoSync || null;

const TRANSLATIONS = {
  en: {
    document_title: "Design Portfolio",
    meta_description: "Premium portfolio for branding design and visual experiences.",
    brand_home: "Back to home",
    nav_main_aria: "Main navigation",
    nav_quick_aria: "Quick links",
    nav_home: "Home",
    nav_about: "About",
    nav_projects: "Projects",
    nav_proof: "Proof",
    nav_contact: "Contact",
    nav_toggle_open_aria: "Open navigation menu",
    nav_toggle_close_aria: "Close navigation menu",
    theme_system: "System",
    theme_light: "Light",
    theme_dark: "Dark",
    hero_eyebrow: "My",
    hero_subtitle: "Designer and founder of iamyotto",
    hero_cta_projects: "View my projects",
    about_eyebrow: "About",
    about_heading: "A visual approach designed to create lasting impact.",
    about_photo_alt: "Photo of Hospice YOTTO",
    projects_eyebrow: "Projects",
    projects_heading: "Dynamic selection imported from catalog data.",
    projects_loading: "Loading projects...",
    proof_eyebrow: "Proof",
    proof_heading: "Client feedback",
    proof_projects_done: "Completed projects",
    proof_clients_title: "Satisfied clients",
    proof_clients_subtitle: "Result-driven collaboration focused on image and conversion.",
    proof_testimonial_intro: "Client reviews",
    testimonials_more: "See more",
    testimonials_less: "See less",
    testimonial_form_title: "Leave a testimonial",
    testimonial_label_name: "Your full name",
    testimonial_name_placeholder: "Full name",
    testimonial_label_rating: "Your rating (stars)",
    testimonial_rating_aria: "Testimonial rating",
    testimonial_star_1: "1 star",
    testimonial_star_2: "2 stars",
    testimonial_star_3: "3 stars",
    testimonial_star_4: "4 stars",
    testimonial_star_5: "5 stars",
    testimonial_label_message: "Your testimonial",
    testimonial_message_placeholder: "Share your experience",
    testimonial_submit: "Send testimonial",
    contact_eyebrow: "Contact",
    contact_heading: "Let's discuss your next project.",
    contact_whatsapp: "WhatsApp direct",
    contact_label_name: "Name",
    contact_name_placeholder: "Your name",
    contact_label_email: "Email",
    contact_email_placeholder: "you@email.com",
    contact_label_message: "Message",
    contact_message_placeholder: "Tell me about your need",
    contact_submit: "Send",
    contact_submit_sent: "Sent",
    footer_signature: "\u00A9 Hospice YOTTO. All rights reserved.",
    whatsapp_close_aria: "Close WhatsApp message",
    whatsapp_message_text: "Contact me on WhatsApp for your project.",
    whatsapp_aria: "Contact on WhatsApp",
    facebook_aria: "Open Facebook profile",
    project_no_items: "No creation available for now.",
    project_hint_dblclick: "Double click to open details",
    project_open_aria: "Open {title}",
    project_site_label: "View site",
    project_page_aria: "Go to page {page}",
    project_pagination_aria: "Project pagination",
    project_modal_aria: "Project details",
    project_modal_close_aria: "Close",
    project_modal_prev_aria: "Previous media",
    project_modal_next_aria: "Next media",
    modal_loading: "Loading...",
    modal_type: "Type",
    modal_video: "Video",
    modal_image: "Image",
    modal_media: "Media",
    modal_dimensions: "Dimensions",
    modal_unavailable: "Unavailable",
    modal_no_description: "No description provided.",
    modal_no_media: "Media unavailable.",
    modal_duration: "Duration",
    import_error: "Import error: please check data.json",
    import_admin_count: "{count} project(s); Double click to view full size",
    import_catalog_unavailable: "Catalog unavailable.",
    import_catalog_count: "{count} project(s) from data.json",
    testimonial_empty: "No testimonial available.",
    rating_out_of_5: "out of 5",
    testimonial_name_required: "Name is required.",
    testimonial_message_required: "Testimonial message is required.",
    testimonial_rating_required: "Please choose a valid rating.",
    testimonial_thanks: "Thank you, your testimonial has been published.",
    contact_fill_required: "Please fill in all fields.",
    contact_success: "Message sent successfully.",
    contact_success_no_email: "Message saved, but email notification was not sent.",
    default_category: "Creation",
    default_project_title: "Untitled creation",
    default_role: "Designer",
    testimonial_anonymous: "Anonymous client",
    testimonial_unavailable: "Review unavailable.",
    theme_mode_system: "System ({mode})",
    theme_mode_dark: "Dark",
    theme_mode_light: "Light",
    theme_current_mode: "Current mode: {mode}",
  },
  fr: {
    document_title: "Design Portfolio",
    meta_description: "Portfolio premium de designer branding et experiences visuelles.",
    brand_home: "Retour a l'accueil",
    nav_main_aria: "Navigation principale",
    nav_quick_aria: "Liens rapides",
    nav_home: "Accueil",
    nav_about: "A propos",
    nav_projects: "Projets",
    nav_proof: "Preuves",
    nav_contact: "Contact",
    nav_toggle_open_aria: "Ouvrir le menu de navigation",
    nav_toggle_close_aria: "Fermer le menu de navigation",
    theme_system: "Systeme",
    theme_light: "Clair",
    theme_dark: "Sombre",
    hero_eyebrow: "Mon",
    hero_subtitle: "Designer et fondateur de iamyotto",
    hero_cta_projects: "Voir mes projets",
    about_eyebrow: "A propos",
    about_heading: "Une approche visuelle qui cree un impact durable.",
    about_photo_alt: "Photo de Hospice YOTTO",
    projects_eyebrow: "Projets",
    projects_heading: "Selection dynamique importee depuis donnees catalogue.",
    projects_loading: "Chargement des projets...",
    proof_eyebrow: "Preuves",
    proof_heading: "Retours clients",
    proof_projects_done: "Projets realises",
    proof_clients_title: "Clients satisfaits",
    proof_clients_subtitle: "Collaboration orientee resultats, image et conversion.",
    proof_testimonial_intro: "Avis clients",
    testimonials_more: "Voir plus",
    testimonials_less: "Voir moins",
    testimonial_form_title: "Laisser un temoignage",
    testimonial_label_name: "Votre nom et prenom",
    testimonial_name_placeholder: "Nom et prenom",
    testimonial_label_rating: "Votre avis (etoiles)",
    testimonial_rating_aria: "Note du temoignage",
    testimonial_star_1: "1 etoile",
    testimonial_star_2: "2 etoiles",
    testimonial_star_3: "3 etoiles",
    testimonial_star_4: "4 etoiles",
    testimonial_star_5: "5 etoiles",
    testimonial_label_message: "Votre temoignage",
    testimonial_message_placeholder: "Partagez votre experience",
    testimonial_submit: "Envoyer mon temoignage",
    contact_eyebrow: "Contact",
    contact_heading: "Discutons de votre prochain projet.",
    contact_whatsapp: "WhatsApp direct",
    contact_label_name: "Nom",
    contact_name_placeholder: "Votre nom",
    contact_label_email: "Email",
    contact_email_placeholder: "vous@email.com",
    contact_label_message: "Message",
    contact_message_placeholder: "Parlez-moi de votre besoin",
    contact_submit: "Envoyer",
    contact_submit_sent: "Envoye",
    footer_signature: "\u00A9 Hospice YOTTO. Tous droits reserves.",
    whatsapp_close_aria: "Fermer le message WhatsApp",
    whatsapp_message_text: "Contactez-moi sur WhatsApp pour votre projet.",
    whatsapp_aria: "Contacter sur WhatsApp",
    facebook_aria: "Ouvrir le profil Facebook",
    project_no_items: "Aucune creation disponible pour le moment.",
    project_hint_dblclick: "Double clic pour afficher en detail",
    project_open_aria: "Ouvrir {title}",
    project_site_label: "Voir le site",
    project_page_aria: "Aller a la page {page}",
    project_pagination_aria: "Pagination des projets",
    project_modal_aria: "Detail du projet",
    project_modal_close_aria: "Fermer",
    project_modal_prev_aria: "Media precedent",
    project_modal_next_aria: "Media suivant",
    modal_loading: "Chargement...",
    modal_type: "Type",
    modal_video: "Video",
    modal_image: "Image",
    modal_media: "Media",
    modal_dimensions: "Dimensions",
    modal_unavailable: "Indisponible",
    modal_no_description: "Aucune description fournie.",
    modal_no_media: "Media indisponible.",
    modal_duration: "Duree",
    import_error: "Erreur d'import: verifiez data.json",
    import_admin_count: "{count} projet(s); Double cliquez pour voir en dimensions reelles",
    import_catalog_unavailable: "Catalogue indisponible.",
    import_catalog_count: "{count} projet(s) depuis data.json",
    testimonial_empty: "Aucun temoignage disponible.",
    rating_out_of_5: "sur 5",
    testimonial_name_required: "Le nom est obligatoire.",
    testimonial_message_required: "Le temoignage est obligatoire.",
    testimonial_rating_required: "Veuillez choisir une note valide.",
    testimonial_thanks: "Merci, votre temoignage a ete publie.",
    contact_fill_required: "Merci de remplir tous les champs.",
    contact_success: "Envoi reussi",
    contact_success_no_email: "Message enregistre, mais la notification e-mail n'a pas ete envoyee.",
    default_category: "Creation",
    default_project_title: "Creation sans titre",
    default_role: "Designer",
    testimonial_anonymous: "Client anonyme",
    testimonial_unavailable: "Avis indisponible.",
    theme_mode_system: "Systeme ({mode})",
    theme_mode_dark: "Sombre",
    theme_mode_light: "Clair",
    theme_current_mode: "Mode actuel: {mode}",
  },
};

const DEFAULT_ABOUT_STORY_BY_LOCALE = {
  en: [
    "My name is Hospice YOTTO, founder of iamyotto Co. I create visual identities that do more than look good - they leave a mark, they sell, and they tell stories.",
    "As a designer for more than 3 years, I became passionate about the way visuals transform an idea into an experience. For me, each project is a combination of storytelling, strategy and aesthetics.",
    "I do not lock myself into one style. My work moves between print design and digital experiences, with one simple goal: create visuals that capture attention and stay in memory.",
    "Every collaboration is a process built with the client. I translate visions into strong identities with a focus on clarity, impact and differentiation.",
    "My approach relies on clean compositions, bold choices and constant evolution.",
  ].join("\n\n"),
  fr: [
    "Je m'appelle Hospice YOTTO, fondateur de iamyotto Co. Je cree des identites visuelles qui ne se contentent pas d'etre belles - elles marquent, elles vendent, elles racontent.",
    "Designer depuis plus de 3 ans, je me suis passionne pour la maniere dont le visuel transforme une idee en experience. Pour moi, chaque projet est une combinaison de storytelling, de strategie et d'esthetique.",
    "Je ne me limite a aucun style. Mon travail navigue entre design imprime et experiences digitales, avec un objectif simple : creer des visuels qui captent l'attention et restent en memoire.",
    "Chaque collaboration est un processus construit avec le client. Je traduis des visions en identites fortes, en mettant l'accent sur la clarte, l'impact et la differenciation.",
    "Mon approche repose sur des compositions epurees, des choix audacieux et une recherche constante d'evolution.",
  ].join("\n\n"),
};

function detectPreferredLocale() {
  const raw = String(navigator.language || navigator.userLanguage || "en").toLowerCase();
  if (raw.startsWith("fr")) {
    return "fr";
  }
  return "en";
}

let activeLocale = detectPreferredLocale();

function t(key, vars = {}) {
  const localePack = TRANSLATIONS[activeLocale] || TRANSLATIONS.en;
  let text = localePack[key] || TRANSLATIONS.en[key] || key;

  Object.entries(vars).forEach(([name, value]) => {
    text = text.split("{" + name + "}").join(String(value));
  });

  return text;
}

function applyStaticTranslations() {
  document.documentElement.lang = activeLocale;
  document.title = t("document_title");

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta instanceof HTMLMetaElement) {
    descriptionMeta.setAttribute("content", t("meta_description"));
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node instanceof HTMLElement ? node.dataset.i18n : "";
    if (!key) {
      return;
    }
    node.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node instanceof HTMLElement ? node.dataset.i18nPlaceholder : "";
    if (!key) {
      return;
    }

    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      node.placeholder = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node instanceof HTMLElement ? node.dataset.i18nAriaLabel : "";
    if (!key) {
      return;
    }
    node.setAttribute("aria-label", t(key));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    const key = node instanceof HTMLElement ? node.dataset.i18nAlt : "";
    if (!key) {
      return;
    }

    if (node instanceof HTMLImageElement) {
      node.alt = t(key);
    }
  });
}

function getDefaultAboutStory() {
  return DEFAULT_ABOUT_STORY_BY_LOCALE[activeLocale] || DEFAULT_ABOUT_STORY_BY_LOCALE.en;
}

async function loadCatalogData() {
  const response = await fetch("data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load data.json");
  }
  return response.json();
}

function inferMediaType(value) {
  const src = String(value || "").trim().toLowerCase();

  if (src.startsWith("data:video/")) {
    return "video";
  }
  if (src.startsWith("data:image/")) {
    return "image";
  }
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(src)) {
    return "video";
  }

  return "image";
}

function isWebDesignCategory(value) {
  return /^web\s*design$/i.test(String(value || "").trim());
}

function normalizeWebsiteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizeAboutStoryText(value) {
  const text = String(value || "").replace(/\r\n/g, "\n").trim();
  return text || getDefaultAboutStory();
}

function splitAboutStoryParagraphs(storyText) {
  return normalizeAboutStoryText(storyText)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function loadAboutStory() {
  try {
    const raw = localStorage.getItem(ABOUT_STORY_KEY);
    if (!raw) {
      return getDefaultAboutStory();
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      return normalizeAboutStoryText(parsed);
    }

    if (parsed && typeof parsed.story === "string") {
      return normalizeAboutStoryText(parsed.story);
    }

    return normalizeAboutStoryText(raw);
  } catch {
    return getDefaultAboutStory();
  }
}

function renderAboutStory() {
  if (!(aboutCopy instanceof HTMLElement)) {
    return;
  }

  const paragraphs = splitAboutStoryParagraphs(loadAboutStory());
  aboutCopy.innerHTML = paragraphs
    .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
    .join("");
}

function getMediaStore() {
  return window.IamyottoMediaStore || null;
}

function clearProjectBlobUrls() {
  projectBlobUrls.forEach((url) => URL.revokeObjectURL(url));
  projectBlobUrls.clear();
}

async function resolveProjectMediaSrc(media, trackObjectUrl = false) {
  if (!media) {
    return "";
  }

  if (media.storage === "idb" && media.id) {
    const store = getMediaStore();
    if (!store?.getObjectURLById) {
      return "";
    }

    try {
      const src = await store.getObjectURLById(media.id);
      if (trackObjectUrl && src) {
        projectBlobUrls.add(src);
      }
      return src || "";
    } catch (error) {
      console.error("Media IndexedDB indisponible", error);
      return "";
    }
  }

  return String(media.src || "");
}

async function hydrateProjectMediaElements() {
  clearProjectBlobUrls();

  const nodes = Array.from(document.querySelectorAll("[data-project-media='1']"));
  for (const node of nodes) {
    if (!(node instanceof HTMLImageElement) && !(node instanceof HTMLVideoElement)) {
      continue;
    }

    const storage = String(node.dataset.storage || "src");
    const mediaId = String(node.dataset.mediaId || "");
    const inlineSrc = String(node.dataset.inlineSrc || "");

    let src = inlineSrc;
    if (storage === "idb" && mediaId) {
      src = await resolveProjectMediaSrc({ storage: "idb", id: mediaId }, true);
    }

    if (!src) {
      continue;
    }

    node.src = src;
  }
}

function normalizeMediaEntry(entry) {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    const src = entry.trim();
    if (!src) {
      return null;
    }

    return {
      src,
      type: inferMediaType(src),
    };
  }

  const storage = String(entry?.storage || "").trim();
  const id = String(entry?.id || "").trim();

  if (storage === "idb" && id) {
    return {
      storage: "idb",
      id,
      type: entry?.type === "video" ? "video" : "image",
      name: String(entry?.name || ""),
      size: Number(entry?.size || 0) || 0,
    };
  }

  const src = String(entry?.src || entry?.url || entry?.image || "").trim();
  if (!src) {
    return null;
  }

  const type = entry?.type === "video" || entry?.type === "image"
    ? entry.type
    : inferMediaType(src);

  return {
    src,
    type,
  };
}

function extractProjectMedias(item) {
  if (Array.isArray(item?.medias)) {
    return item.medias.map(normalizeMediaEntry).filter(Boolean);
  }

  if (Array.isArray(item?.images)) {
    return item.images.map(normalizeMediaEntry).filter(Boolean);
  }

  if (item?.image) {
    const media = normalizeMediaEntry(item.image);
    return media ? [media] : [];
  }

  return [];
}

function normalizeProject(item) {
  const category = String(item?.category || item?.categorie || t("default_category")).trim();
  const title = String(item?.titre || item?.title || t("default_project_title")).trim();
  const description = String(item?.description || "").trim();
  const websiteUrl = normalizeWebsiteUrl(item?.websiteUrl || item?.siteUrl || item?.link || "");
  const medias = extractProjectMedias(item);

  if (!medias.length) {
    medias.push({ src: "assets/project-01.jpg", type: "image" });
  }

  return {
    title: title || t("default_project_title"),
    category: category || t("default_category"),
    description,
    websiteUrl,
    image: String(medias[0]?.src || ""),
    medias,
  };
}

function normalizeProjectsArray(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map(normalizeProject).filter((item) => Boolean(item.title));
}

function mapWhatsAppLikePayload(data) {
  const sourceType = data?.source?.type || "json";

  if (sourceType === "whatsapp" && Array.isArray(data?.source?.products)) {
    return normalizeProjectsArray(data.source.products);
  }

  return normalizeProjectsArray(data?.products);
}

function isSeedCatalogProject(project) {
  const ref = String(project?.catalogRef || "").trim().toLowerCase();

  const title = String(project?.title || project?.titre || "").trim().toLowerCase();
  const category = String(project?.category || project?.categorie || "").trim().toLowerCase();
  const firstSrc = String(project?.medias?.[0]?.src || project?.image || "").trim().toLowerCase();

  const isLegacySeed = (
    (title === "brand identity pack" && category === "branding")
    || (title === "design social media premium" && category === "social media")
    || (title === "portfolio / landing page design" && category === "web design")
  ) && (
    firstSrc.endsWith("assets/project-01.jpg")
    || firstSrc.endsWith("assets/project-02.png")
    || firstSrc.endsWith("assets/project-03.jpg")
  );

  return ref.startsWith("catalog:") || ref.startsWith("whatsapp:") || isLegacySeed;
}
function loadAdminProjects() {
  try {
    const raw = localStorage.getItem(ADMIN_PROJECTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    const safeList = Array.isArray(parsed)
      ? parsed.filter((project) => !isSeedCatalogProject(project))
      : [];
    return normalizeProjectsArray(safeList);
  } catch (error) {
    console.error("Erreur de lecture des projets admin", error);
    return [];
  }
}

function normalizeTestimonial(item) {
  const rating = Number(item?.rating);
  return {
    name: String(item?.name || t("testimonial_anonymous")),
    rating: Number.isNaN(rating) ? 5 : Math.max(1, Math.min(5, rating)),
    message: String(item?.message || t("testimonial_unavailable")),
    createdAt: item?.createdAt || new Date().toISOString(),
    hiddenOnPortfolio: Boolean(item?.hiddenOnPortfolio),
    moderationTest: Boolean(item?.moderationTest),
  };
}

function ensureTestimonialsSeeded() {
  const raw = localStorage.getItem(TESTIMONIALS_KEY);
  if (raw) {
    return;
  }

  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(INITIAL_TESTIMONIALS));
}

function loadTestimonials() {
  ensureTestimonialsSeeded();

  try {
    const raw = localStorage.getItem(TESTIMONIALS_KEY);
    if (!raw) {
      return INITIAL_TESTIMONIALS.map(normalizeTestimonial);
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_TESTIMONIALS.map(normalizeTestimonial);
    }

    return parsed.map(normalizeTestimonial);
  } catch (error) {
    console.error("Erreur de lecture des temoignages", error);
    return INITIAL_TESTIMONIALS.map(normalizeTestimonial);
  }
}

function saveTestimonials(testimonials) {
  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
  cloudSync?.schedulePush?.();
}

function normalizeContactMessage(item) {
  return {
    id: String(item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
    name: String(item?.name || "").trim(),
    email: String(item?.email || "").trim(),
    message: String(item?.message || "").trim(),
    createdAt: item?.createdAt || new Date().toISOString(),
  };
}

function loadContactMessages() {
  try {
    const raw = localStorage.getItem(CONTACT_MESSAGES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(normalizeContactMessage).filter((item) => item.name && item.email && item.message)
      : [];
  } catch (error) {
    console.error("Erreur de lecture des messages contact", error);
    return [];
  }
}

function saveContactMessages(messages) {
  localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
  cloudSync?.schedulePush?.();
}

function normalizeAboutProfile(value) {
  const roleText = String(value?.roleText || value?.role || "Designer").trim();
  const storage = String(value?.photoStorage || value?.photo?.storage || "").trim();
  const photoId = String(value?.photoId || value?.photo?.id || "").trim();
  const photoSrc = String(value?.photoSrc || value?.photo?.src || "").trim();

  if (storage === "idb" && photoId) {
    return {
      roleText: roleText || t("default_role"),
      photoStorage: "idb",
      photoId,
      photoSrc: "",
    };
  }

  return {
    roleText: roleText || t("default_role"),
    photoStorage: "src",
    photoId: "",
    photoSrc: photoSrc || "assets/hospice-yotto.jpg",
  };
}

function loadAboutProfile() {
  try {
    const raw = localStorage.getItem(ABOUT_PROFILE_KEY);
    if (!raw) {
      return normalizeAboutProfile({});
    }

    const parsed = JSON.parse(raw);
    return normalizeAboutProfile(parsed);
  } catch (error) {
    console.error("Erreur lecture profil a propos", error);
    return normalizeAboutProfile({});
  }
}

function formatAboutCaptionText(roleText) {
  const safe = String(roleText || "").trim() || t("default_role");
  return `Hospice YOTTO - ${safe}`;
}

async function renderAboutProfile() {
  if (!aboutPhoto && !aboutCaptionText) {
    return;
  }

  const profile = loadAboutProfile();

  if (aboutCaptionText) {
    aboutCaptionText.textContent = formatAboutCaptionText(profile.roleText);
  }

  if (!(aboutPhoto instanceof HTMLImageElement)) {
    return;
  }

  if (aboutPhotoBlobUrl) {
    URL.revokeObjectURL(aboutPhotoBlobUrl);
    aboutPhotoBlobUrl = "";
  }

  let src = profile.photoSrc;

  if (profile.photoStorage === "idb" && profile.photoId) {
    const store = getMediaStore();
    if (store?.getObjectURLById) {
      try {
        src = await store.getObjectURLById(profile.photoId);
        if (src) {
          aboutPhotoBlobUrl = src;
        }
      } catch (error) {
        console.error("Erreur chargement photo a propos", error);
      }
    }
  }

  aboutPhoto.src = src || "assets/hospice-yotto.jpg";
}

function loadDashboardProjectCount() {
  const raw = Number(localStorage.getItem(DASHBOARD_PROJECT_COUNT_KEY));
  if (!Number.isFinite(raw) || raw < 0) {
    return 100;
  }

  return Math.floor(raw);
}

function formatProjectCountDisplay(value) {
  const safe = Math.max(0, Math.floor(Number(value) || 0));
  return `${safe}+`;
}

function renderProofProjectCount() {
  if (!proofProjectCount) {
    return;
  }

  proofProjectCount.textContent = formatProjectCountDisplay(loadDashboardProjectCount());
}

function incrementPortfolioVisits() {
  const current = Number(localStorage.getItem(PORTFOLIO_VISITS_KEY));
  const safeCurrent = Number.isFinite(current) && current >= 0 ? Math.floor(current) : 0;
  localStorage.setItem(PORTFOLIO_VISITS_KEY, String(safeCurrent + 1));
  cloudSync?.schedulePush?.(1200);
}

async function sendContactNotification({ name, email, message }) {
  try {
    const response = await fetch(CONTACT_NOTIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `Nouveau message portfolio - ${name}`,
        _template: "table",
        _captcha: "false",
      }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json().catch(() => null);
    if (payload && (payload.success === false || String(payload.success).toLowerCase() === "false")) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Contact email notification failed", error);
    return false;
  }
}

function setupContactForm() {
  if (!(contactForm instanceof HTMLFormElement) || !(contactStatus instanceof HTMLElement)) {
    return;
  }

  const setSubmitLabel = (label) => {
    if (contactSubmit instanceof HTMLElement) {
      contactSubmit.textContent = label;
    }
  };

  const setSubmitDisabled = (disabled) => {
    if (contactSubmit instanceof HTMLButtonElement) {
      contactSubmit.disabled = disabled;
    }
  };

  const idleLabel = () => t("contact_submit");
  const sentLabel = () => t("contact_submit_sent");

  contactForm.addEventListener("input", () => {
    if (contactStatus.classList.contains("is-success")) {
      contactStatus.classList.remove("is-success");
      contactStatus.textContent = "";
    }

    if (contactSubmit instanceof HTMLElement && contactSubmit.textContent.trim() === sentLabel()) {
      contactSubmit.textContent = idleLabel();
    }

    setSubmitDisabled(false);
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      contactStatus.textContent = t("contact_fill_required");
      contactStatus.classList.remove("is-success");
      setSubmitDisabled(false);
      setSubmitLabel(idleLabel());
      return;
    }

    if (cloudSync?.pullLatestToLocal) {
      try {
        await cloudSync.pullLatestToLocal();
      } catch (error) {
        console.error("Cloud sync pull failed before contact submit", error);
      }
    }

    const messages = loadContactMessages();
    messages.unshift(
      normalizeContactMessage({
        name,
        email,
        message,
      })
    );

    saveContactMessages(messages);

    setSubmitDisabled(true);
    const notificationSent = await sendContactNotification({ name, email, message });
    setSubmitDisabled(false);

    contactForm.reset();
    contactStatus.textContent = notificationSent ? t("contact_success") : t("contact_success_no_email");
    contactStatus.classList.toggle("is-success", notificationSent);
    setSubmitLabel(sentLabel());
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function starString(rating) {
  const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
  return `${"\u2605".repeat(safeRating)}${"\u2606".repeat(5 - safeRating)}`;
}

function renderProjectMedia(media, projectTitle, projectIndex, mediaIndex) {
  const safeMedia = media || { src: "", type: "image" };
  const storage = safeMedia.storage === "idb" ? "idb" : "src";
  const mediaId = storage === "idb" ? escapeHTML(String(safeMedia.id || "")) : "";
  const inlineSrc = storage === "src" ? escapeHTML(String(safeMedia.src || "")) : "";
  const mediaType = safeMedia.type === "video" ? "video" : "image";

  if (mediaType === "video") {
    const srcAttr = inlineSrc ? ` src="${inlineSrc}"` : "";
    return `<video class="project-media" data-project-media="1" data-storage="${storage}" data-media-id="${mediaId}" data-inline-src="${inlineSrc}" data-project-index="${projectIndex}" data-media-index="${mediaIndex}"${srcAttr} muted playsinline preload="metadata" loop></video>`;
  }

  const srcAttr = inlineSrc ? ` src="${inlineSrc}"` : "";
  return `<img class="project-media" data-project-media="1" data-storage="${storage}" data-media-id="${mediaId}" data-inline-src="${inlineSrc}" data-project-index="${projectIndex}" data-media-index="${mediaIndex}"${srcAttr} alt="${escapeHTML(projectTitle)}" loading="lazy" />`;
}

function renderProjectSiteButton(project, context = "card") {
  if (!isWebDesignCategory(project?.category)) {
    return "";
  }

  const url = normalizeWebsiteUrl(project?.websiteUrl || project?.siteUrl || project?.link || "");
  const className = context === "modal"
    ? "project-site-btn project-site-btn-modal"
    : "project-site-btn";

  if (!url) {
    return `<span class="${className} is-disabled" aria-disabled="true">${escapeHTML(t("project_site_label"))}</span>`;
  }

  return `<a class="${className}" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("project_site_label"))}</a>`;
}

function renderProjects(projects, preservePagination = false, animateCards = false) {
  if (!projectGrid) {
    return;
  }

  if (projectPageTransitionTimeout) {
    clearTimeout(projectPageTransitionTimeout);
    projectPageTransitionTimeout = null;
  }
  if (projectPageEnterTimeout) {
    clearTimeout(projectPageEnterTimeout);
    projectPageEnterTimeout = null;
  }

  projectGrid.classList.remove("is-page-leaving", "is-page-entering");
  if (!preservePagination) {
    projectGrid.style.minHeight = "";
  }
  renderedProjects = projects;

  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  if (!preservePagination) {
    currentProjectPage = 1;
  } else {
    currentProjectPage = Math.max(1, Math.min(totalPages, currentProjectPage));
  }

  previewIntervals.forEach((intervalId) => {
    clearInterval(intervalId);
  });
  previewIntervals.clear();

  if (!projects.length) {
    clearProjectBlobUrls();
    projectGrid.style.minHeight = "";
    projectGrid.innerHTML = `<p class="project-description">${escapeHTML(t("project_no_items"))}</p>`;
    renderProjectPagination(0);
    return;
  }

  const startIndex = (currentProjectPage - 1) * PROJECTS_PER_PAGE;
  const shownProjects = projects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  projectGrid.innerHTML = shownProjects
    .map((project, offsetIndex) => {
      const projectIndex = startIndex + offsetIndex;
      const medias = Array.isArray(project.medias) ? project.medias : [{ src: project.image, type: "image" }];
      const description = String(project.description || "").trim();
      const descriptionMarkup = description
        ? `<p class="project-description">${escapeHTML(description)}</p>`
        : "";

      const mediaMarkup = medias
        .map((media, mediaIndex) => renderProjectMedia(media, project.title, projectIndex, mediaIndex))
        .join("");
      const mediaCountMarkup = medias.length > 1
        ? `<span class="project-media-count">${medias.length}</span>`
        : "";
      const siteButtonMarkup = renderProjectSiteButton(project, "card");
      const siteButtonWrap = siteButtonMarkup
        ? `<div class="project-site-wrap">${siteButtonMarkup}</div>`
        : "";
      const cardAnimationClass = animateCards ? " is-entering" : "";
      const cardAnimationStyle = animateCards ? ` style="--project-card-delay:${offsetIndex * 70}ms"` : "";

      return `
      <article class="project-card${cardAnimationClass}"${cardAnimationStyle} data-project-index="${projectIndex}" tabindex="0" role="button" aria-label="${escapeHTML(t("project_open_aria", { title: project.title }))}">
        <div class="project-media-shell">
          ${mediaMarkup}
          ${mediaCountMarkup}
        </div>
        <div class="project-content">
          <p class="project-meta">${escapeHTML(project.category)}</p>
          <h3 class="project-title">${escapeHTML(project.title)}</h3>
          ${descriptionMarkup}
          ${siteButtonWrap}
          <p class="project-hint">${escapeHTML(t("project_hint_dblclick"))}</p>
        </div>
      </article>
    `;
    })
    .join("");

  projectGrid.querySelectorAll(".project-card").forEach((card) => {
    setCardMedia(card, 0, false);
  });

  renderProjectPagination(totalPages);
  setupProjectInteractions();
  void hydrateProjectMediaElements();
}

function renderProjectPagination(totalPages) {
  if (!projectsPagination) {
    return;
  }

  if (totalPages <= 1) {
    projectsPagination.hidden = true;
    projectsPagination.innerHTML = "";
    return;
  }

  projectsPagination.hidden = false;
  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const isActive = page === currentProjectPage;
    const activeClass = isActive ? " is-active" : "";
    const currentAttr = isActive ? ' aria-current="page"' : "";

    return `<button type="button" class="project-page-slot${activeClass}" data-project-page="${page}" aria-label="${escapeHTML(t("project_page_aria", { page }))}"${currentAttr}>${page}</button>`;
  }).join("");

  projectsPagination.innerHTML = `
    <div class="projects-pagination-group" role="group" aria-label="${escapeHTML(t("project_pagination_aria"))}">
      ${pageButtons}
    </div>
  `;
}

function switchProjectPage(pageNumber) {
  if (!projectGrid || !renderedProjects.length) {
    return;
  }

  const totalPages = Math.max(1, Math.ceil(renderedProjects.length / PROJECTS_PER_PAGE));
  const nextPage = Math.max(1, Math.min(totalPages, Number(pageNumber) || 1));

  if (nextPage === currentProjectPage) {
    return;
  }

  if (projectPageTransitionTimeout) {
    clearTimeout(projectPageTransitionTimeout);
    projectPageTransitionTimeout = null;
  }
  if (projectPageEnterTimeout) {
    clearTimeout(projectPageEnterTimeout);
    projectPageEnterTimeout = null;
  }

  projectGrid.classList.remove("is-page-entering");
  projectGrid.style.minHeight = "";

  const topBefore = projectGrid.getBoundingClientRect().top;
  const heightBefore = projectGrid.offsetHeight;
  if (heightBefore > 0) {
    projectGrid.style.minHeight = `${heightBefore}px`;
  }

  projectGrid.classList.add("is-page-leaving");

  projectPageTransitionTimeout = window.setTimeout(() => {
    currentProjectPage = nextPage;
    renderProjects(renderedProjects, true, true);

    const topAfter = projectGrid.getBoundingClientRect().top;
    const deltaY = topAfter - topBefore;
    if (Math.abs(deltaY) > 0.5) {
      window.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
    }

    projectGrid.classList.remove("is-page-leaving");
    projectGrid.classList.add("is-page-entering");

    projectPageEnterTimeout = window.setTimeout(() => {
      projectGrid.classList.remove("is-page-entering");
      projectGrid.style.minHeight = "";
      projectPageEnterTimeout = null;
    }, 260);

    projectPageTransitionTimeout = null;
  }, 220);
}
function setCardMedia(card, mediaIndex, autoplay) {
  const mediaNodes = Array.from(card.querySelectorAll(".project-media"));
  if (!mediaNodes.length) {
    return;
  }

  const index = Math.max(0, Math.min(mediaNodes.length - 1, mediaIndex));
  card.dataset.activeMedia = String(index);

  mediaNodes.forEach((node, idx) => {
    const isActive = idx === index;
    node.classList.toggle("is-active", isActive);

    if (node instanceof HTMLVideoElement) {
      if (!isActive) {
        node.pause();
        node.currentTime = 0;
      } else if (autoplay) {
        node.muted = true;
        node.play().catch(() => {});
      }
    }
  });
}

function startCardPreview(card) {
  const mediaNodes = Array.from(card.querySelectorAll(".project-media"));
  if (!mediaNodes.length) {
    return;
  }

  const hasVideo = mediaNodes.some((node) => node instanceof HTMLVideoElement);
  const canRotate = mediaNodes.length > 1;

  setCardMedia(card, Number(card.dataset.activeMedia || 0), true);

  if (!canRotate && !hasVideo) {
    return;
  }

  if (previewIntervals.has(card)) {
    return;
  }

  const intervalId = window.setInterval(() => {
    const current = Number(card.dataset.activeMedia || 0);
    const next = (current + 1) % mediaNodes.length;
    setCardMedia(card, next, true);
  }, 1200);

  previewIntervals.set(card, intervalId);
}

function stopCardPreview(card) {
  const intervalId = previewIntervals.get(card);
  if (intervalId) {
    clearInterval(intervalId);
    previewIntervals.delete(card);
  }

  setCardMedia(card, 0, false);
}


function clearModalAutoSlide() {
  if (modalAutoSlideInterval) {
    clearInterval(modalAutoSlideInterval);
    modalAutoSlideInterval = null;
  }
}

function scheduleModalAutoSlide() {
  clearModalAutoSlide();

  if (!modalState || modalState.root.hasAttribute("hidden") || modalState.mediaCount <= 1) {
    return;
  }

  modalAutoSlideInterval = window.setInterval(() => {
    if (!modalState || modalState.root.hasAttribute("hidden") || modalState.mediaCount <= 1) {
      clearModalAutoSlide();
      return;
    }

    navigateModalByStep(1);
  }, 3200);
}
function navigateModalByStep(step) {
  if (!modalState || modalState.root.hasAttribute("hidden") || !modalState.project || modalState.mediaCount <= 1) {
    return;
  }

  const nextIndex = (modalState.mediaIndex + step + modalState.mediaCount) % modalState.mediaCount;
  void openProjectModal(modalState.project, nextIndex);
}

function ensureProjectModal() {
  if (modalState) {
    return modalState;
  }

  const modal = document.createElement("div");
  modal.className = "project-modal";
  modal.setAttribute("hidden", "");
  modal.innerHTML = `
    <div class="project-modal-backdrop" data-close="1"></div>
    <div class="project-modal-dialog" role="dialog" aria-modal="true" aria-label="${escapeHTML(t("project_modal_aria"))}">
      <button type="button" class="project-modal-close" data-close="1" aria-label="${escapeHTML(t("project_modal_close_aria"))}">&times;</button>
      <div class="project-modal-layout">
        <div class="project-modal-visual"></div>
        <aside class="project-modal-info">
          <p class="project-modal-meta"></p>
          <h3 class="project-modal-title"></h3>
          <p class="project-modal-description"></p>
          <div class="project-modal-site"></div>
          <ul class="project-modal-details"></ul>
        </aside>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const visual = modal.querySelector(".project-modal-visual");
  const meta = modal.querySelector(".project-modal-meta");
  const title = modal.querySelector(".project-modal-title");
  const description = modal.querySelector(".project-modal-description");
  const site = modal.querySelector(".project-modal-site");
  const details = modal.querySelector(".project-modal-details");

  if (!(visual instanceof HTMLElement) || !(meta instanceof HTMLElement) || !(title instanceof HTMLElement)
    || !(description instanceof HTMLElement) || !(site instanceof HTMLElement) || !(details instanceof HTMLElement)) {
    return null;
  }

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === "1") {
      closeProjectModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modalState || modalState.root.hasAttribute("hidden")) {
      return;
    }

    if (event.key === "Escape") {
      closeProjectModal();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateModalByStep(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateModalByStep(1);
    }
  });

  modalState = {
    root: modal,
    visual,
    meta,
    title,
    description,
    site,
    details,
    project: null,
    mediaIndex: 0,
    mediaCount: 0,
  };

  return modalState;
}

function fillModalDetails(listEl, items) {
  listEl.innerHTML = items
    .map((item) => `<li><strong>${escapeHTML(item.label)}:</strong> ${escapeHTML(item.value)}</li>`)
    .join("");
}

function appendModalNavigationControls(modal) {
  if (!modal || modal.mediaCount <= 1) {
    return;
  }

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "project-modal-nav project-modal-nav-prev";
  prevButton.setAttribute("aria-label", t("project_modal_prev_aria"));
  prevButton.textContent = "<";
  prevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    navigateModalByStep(-1);
  });

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "project-modal-nav project-modal-nav-next";
  nextButton.setAttribute("aria-label", t("project_modal_next_aria"));
  nextButton.textContent = ">";
  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    navigateModalByStep(1);
  });

  modal.visual.append(prevButton, nextButton);
}

async function openProjectModal(project, mediaIndex = 0) {
  const modal = ensureProjectModal();
  if (!modal || !project) {
    return;
  }

  const medias = Array.isArray(project.medias) && project.medias.length
    ? project.medias
    : [{ src: project.image, type: inferMediaType(project.image) }];

  const safeIndex = Math.max(0, Math.min(medias.length - 1, mediaIndex));
  const selected = medias[safeIndex];

  modal.project = project;
  modal.mediaIndex = safeIndex;
  modal.mediaCount = medias.length;

  let dimensionsText = t("modal_loading");
  const details = [
    { label: t("modal_type"), value: selected.type === "video" ? t("modal_video") : t("modal_image") },
    { label: t("modal_media"), value: `${safeIndex + 1}/${medias.length}` },
    { label: t("modal_dimensions"), value: dimensionsText },
  ];

  modal.meta.textContent = project.category || t("default_category");
  modal.title.textContent = project.title || t("default_project_title");
  modal.description.textContent = project.description || t("modal_no_description");
  modal.site.innerHTML = renderProjectSiteButton(project, "modal");
  fillModalDetails(modal.details, details);

  modal.visual.innerHTML = "";
  if (modalBlobUrl) {
    URL.revokeObjectURL(modalBlobUrl);
    modalBlobUrl = "";
  }

  let mediaSrc = await resolveProjectMediaSrc(selected, false);
  if (selected?.storage === "idb" && mediaSrc) {
    modalBlobUrl = mediaSrc;
  }

  if (!mediaSrc) {
    mediaSrc = String(selected?.src || "");
  }

  if (!mediaSrc) {
    fillModalDetails(modal.details, [
      { label: t("modal_type"), value: selected.type === "video" ? t("modal_video") : t("modal_image") },
      { label: t("modal_media"), value: `${safeIndex + 1}/${medias.length}` },
      { label: t("modal_dimensions"), value: t("modal_unavailable") },
    ]);
    modal.visual.innerHTML = `<p class="project-description">${escapeHTML(t("modal_no_media"))}</p>`;
    appendModalNavigationControls(modal);
    modal.root.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    scheduleModalAutoSlide();
    return;
  }

  if (selected.type === "video") {
    const video = document.createElement("video");
    video.src = mediaSrc;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.className = "project-modal-media";

    video.addEventListener("loadedmetadata", () => {
      dimensionsText = `${video.videoWidth} x ${video.videoHeight}px`;
      fillModalDetails(modal.details, [
        { label: t("modal_type"), value: t("modal_video") },
        { label: t("modal_media"), value: `${safeIndex + 1}/${medias.length}` },
        { label: t("modal_dimensions"), value: dimensionsText },
        { label: t("modal_duration"), value: `${Math.round(video.duration || 0)}s` },
      ]);
    });

    modal.visual.appendChild(video);
    video.play().catch(() => {});
  } else {
    const img = document.createElement("img");
    img.src = mediaSrc;
    img.alt = project.title || t("default_project_title");
    img.className = "project-modal-media";

    img.addEventListener("load", () => {
      dimensionsText = `${img.naturalWidth} x ${img.naturalHeight}px`;
      fillModalDetails(modal.details, [
        { label: t("modal_type"), value: t("modal_image") },
        { label: t("modal_media"), value: `${safeIndex + 1}/${medias.length}` },
        { label: t("modal_dimensions"), value: dimensionsText },
      ]);
    });

    modal.visual.appendChild(img);
  }

  appendModalNavigationControls(modal);
  modal.root.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  scheduleModalAutoSlide();
}

function closeProjectModal() {
  if (!modalState) {
    return;
  }

  modalState.root.setAttribute("hidden", "");
  modalState.visual.querySelectorAll("video").forEach((video) => video.pause());
  modalState.project = null;
  modalState.mediaIndex = 0;
  modalState.mediaCount = 0;
  clearModalAutoSlide();
  if (modalBlobUrl) {
    URL.revokeObjectURL(modalBlobUrl);
    modalBlobUrl = "";
  }
  document.body.style.overflow = "";
}

function setupProjectInteractions() {
  const cards = Array.from(document.querySelectorAll(".project-card"));

  cards.forEach((card) => {
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        startCardPreview(card);
      }
    });

    card.addEventListener("pointerleave", () => {
      stopCardPreview(card);
    });

    card.addEventListener("pointerdown", (event) => {
      if (event.target instanceof Element && event.target.closest(".project-site-btn")) {
        return;
      }

      if (event.pointerType === "touch" || event.pointerType === "pen") {
        startCardPreview(card);

        const oldTimeout = touchPreviewTimeouts.get(card);
        if (oldTimeout) {
          clearTimeout(oldTimeout);
        }

        const timeoutId = window.setTimeout(() => {
          stopCardPreview(card);
          touchPreviewTimeouts.delete(card);
        }, 6500);

        touchPreviewTimeouts.set(card, timeoutId);
      }
    });

    card.addEventListener("pointerup", (event) => {
      if (event.target instanceof Element && event.target.closest(".project-site-btn")) {
        return;
      }

      if (event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      const cardKey = String(card.dataset.projectIndex || "");
      const now = Date.now();
      const elapsed = now - touchTapState.at;
      const isDoubleTap = touchTapState.cardKey === cardKey && elapsed < 320;

      touchTapState = {
        cardKey,
        at: now,
      };

      if (!isDoubleTap) {
        return;
      }

      const projectIndex = Number(card.dataset.projectIndex);
      if (Number.isNaN(projectIndex)) {
        return;
      }

      void openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
      stopCardPreview(card);
      touchTapState = { cardKey: "", at: 0 };
    });

    card.addEventListener("dblclick", (event) => {
      if (event.target instanceof Element && event.target.closest(".project-site-btn")) {
        return;
      }

      const projectIndex = Number(card.dataset.projectIndex);
      if (Number.isNaN(projectIndex)) {
        return;
      }

      void openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
      stopCardPreview(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.target instanceof Element && event.target.closest(".project-site-btn")) {
        return;
      }

      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      const projectIndex = Number(card.dataset.projectIndex);
      if (Number.isNaN(projectIndex)) {
        return;
      }

      void openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
    });
  });

  const siteButtons = Array.from(document.querySelectorAll(".project-site-btn"));
  siteButtons.forEach((button) => {
    button.addEventListener("click", (event) => event.stopPropagation());
    button.addEventListener("dblclick", (event) => event.stopPropagation());
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("pointerup", (event) => event.stopPropagation());
    button.addEventListener("keydown", (event) => event.stopPropagation());
  });
}


function setupProjectsPagination() {
  projectsPagination?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest(".project-page-slot");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const page = Number(button.dataset.projectPage || "");
    if (Number.isNaN(page)) {
      return;
    }

    switchProjectPage(page);
  });
}

function renderTestimonials(preservePagination = false) {
  if (!testimonialsGrid || !testimonialsToggle) {
    return;
  }

  if (!preservePagination) {
    visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
    testimonialExpanded = false;
  }

  const all = loadTestimonials();
  const visibleTestimonials = all.filter((item) => !item.hiddenOnPortfolio);
  const shown = visibleTestimonials.slice(0, visibleTestimonialCount);

  if (!shown.length) {
    testimonialsGrid.innerHTML = `<p class="testimonial-empty">${escapeHTML(t("testimonial_empty"))}</p>`;
    testimonialsToggle.hidden = true;
    if (testimonialsToggleLess) {
      testimonialsToggleLess.hidden = true;
    }
    return;
  }

  testimonialsGrid.innerHTML = shown
    .map(
      (item) => `
      <article class="testimonial-card">
        <p class="testimonial-stars" aria-label="${item.rating} ${escapeHTML(t("rating_out_of_5"))}">${starString(item.rating)}</p>
        <p class="testimonial-message">${escapeHTML(item.message)}</p>
        <p class="testimonial-author">${escapeHTML(item.name)}</p>
      </article>
    `
    )
    .join("");

  testimonialsToggle.hidden = visibleTestimonials.length <= visibleTestimonialCount;
  testimonialsToggle.textContent = t("testimonials_more");

  if (testimonialsToggleLess) {
    const canCollapse = testimonialExpanded
      && visibleTestimonials.length > TESTIMONIAL_INITIAL_COUNT
      && visibleTestimonialCount > TESTIMONIAL_INITIAL_COUNT;
    testimonialsToggleLess.hidden = !canCollapse;
    testimonialsToggleLess.textContent = t("testimonials_less");
  }
}
async function importProjects() {
  let catalogProjects = [];
  let catalogError = false;

  try {
    const data = await loadCatalogData();
    catalogProjects = mapWhatsAppLikePayload(data);
  } catch (error) {
    catalogError = true;
    console.error(error);
  }

  const adminProjects = loadAdminProjects();
  const usingAdminProjects = adminProjects.length > 0;
  const visibleProjects = usingAdminProjects ? adminProjects : catalogProjects;
  renderProjects(visibleProjects);

  if (!importStatus) {
    return;
  }

  if (catalogError && !visibleProjects.length) {
    importStatus.textContent = t("import_error");
    return;
  }

  if (usingAdminProjects) {
    importStatus.textContent = t("import_admin_count", { count: adminProjects.length });
    return;
  }

  if (catalogError) {
    importStatus.textContent = t("import_catalog_unavailable");
    return;
  }

  importStatus.textContent = t("import_catalog_count", { count: catalogProjects.length });
}

function setupRatingPicker() {
  if (!testimonialForm) {
    return () => {};
  }

  const ratingInput = testimonialForm.querySelector('input[name="rating"]');
  const ratingPicker = testimonialForm.querySelector(".rating-picker");
  const ratingStars = Array.from(testimonialForm.querySelectorAll(".rating-star"));

  if (!(ratingInput instanceof HTMLInputElement) || !(ratingPicker instanceof HTMLElement) || !ratingStars.length) {
    return () => {};
  }

  const clampRating = (value) => Math.max(1, Math.min(5, Number(value) || 1));
  let selected = clampRating(ratingInput.value || 5);

  function renderStars(displayValue) {
    const safeDisplay = clampRating(displayValue);

    ratingStars.forEach((star) => {
      const starValue = clampRating(star.dataset.value);
      star.classList.toggle("is-active", starValue <= safeDisplay);
      star.setAttribute("aria-checked", starValue === selected ? "true" : "false");
    });
  }

  function setRating(value) {
    selected = clampRating(value);
    ratingInput.value = String(selected);
    renderStars(selected);
  }

  ratingStars.forEach((star) => {
    const starValue = clampRating(star.dataset.value);

    star.addEventListener("click", () => {
      setRating(starValue);
    });

    star.addEventListener("mouseenter", () => {
      renderStars(starValue);
    });

    star.addEventListener("focus", () => {
      renderStars(starValue);
    });

    star.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = Math.max(1, selected - 1);
        setRating(next);
        ratingStars[next - 1]?.focus();
      }

      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = Math.min(5, selected + 1);
        setRating(next);
        ratingStars[next - 1]?.focus();
      }
    });
  });

  ratingPicker.addEventListener("mouseleave", () => {
    renderStars(selected);
  });

  ratingPicker.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && ratingPicker.contains(event.relatedTarget)) {
      return;
    }
    renderStars(selected);
  });

  setRating(selected);

  return () => {
    setRating(5);
  };
}

function setupTestimonialForm() {
  if (!testimonialForm || !testimonialStatus) {
    return;
  }

  const resetRatingPicker = setupRatingPicker();
  if (testimonialsToggleLess) {
    testimonialsToggleLess.hidden = true;
  }

  testimonialForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(testimonialForm);
    const name = String(data.get("name") || "").trim();
    const rating = Number(data.get("rating"));
    const message = String(data.get("message") || "").trim();

    if (!name) {
      testimonialStatus.textContent = t("testimonial_name_required");
      return;
    }

    if (!message) {
      testimonialStatus.textContent = t("testimonial_message_required");
      return;
    }

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      testimonialStatus.textContent = t("testimonial_rating_required");
      return;
    }

    if (cloudSync?.pullLatestToLocal) {
      try {
        await cloudSync.pullLatestToLocal();
      } catch (error) {
        console.error("Cloud sync pull failed before testimonial submit", error);
      }
    }

    const testimonials = loadTestimonials();
    testimonials.unshift(
      normalizeTestimonial({
        name,
        rating,
        message,
        hiddenOnPortfolio: false,
      })
    );

    saveTestimonials(testimonials);
    testimonialForm.reset();
    resetRatingPicker();
    testimonialStatus.textContent = t("testimonial_thanks");
    visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
    renderTestimonials();
  });

  testimonialsToggle?.addEventListener("click", () => {
    const total = loadTestimonials().filter((item) => !item.hiddenOnPortfolio).length;
    testimonialExpanded = true;
    visibleTestimonialCount = Math.min(total, visibleTestimonialCount + TESTIMONIAL_STEP_COUNT);
    renderTestimonials(true);
  });

  testimonialsToggleLess?.addEventListener("click", () => {
    testimonialExpanded = false;
    visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
    renderTestimonials(true);
  });
}

function setupScrollReveal() {
  const revealed = document.querySelectorAll(".reveal");
  if (!revealed.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px",
    }
  );

  revealed.forEach((section) => observer.observe(section));
}

function resolveThemeChoice(choice) {
  if (choice === "system") {
    return systemThemeMedia.matches ? "dark" : "light";
  }
  return choice;
}

function updateThemeToggleLabel(choice, resolved) {
  if (!themeToggle) {
    return;
  }

  const resolvedModeLabel = resolved === "dark"
    ? t("theme_mode_dark")
    : t("theme_mode_light");

  const choiceLabel = choice === "system"
    ? t("theme_mode_system", { mode: resolvedModeLabel })
    : choice === "dark"
      ? t("theme_mode_dark")
      : t("theme_mode_light");

  const icon = resolved === "dark" ? "\u263D" : "\u2600";
  const currentModeLabel = t("theme_current_mode", { mode: choiceLabel });
  themeToggle.textContent = icon;
  themeToggle.title = currentModeLabel;
  themeToggle.setAttribute("aria-label", currentModeLabel);
}

function applyTheme(choice) {
  const resolved = resolveThemeChoice(choice);
  document.documentElement.setAttribute("data-theme", choice);
  document.documentElement.setAttribute("data-color-scheme", resolved);

  updateThemeToggleLabel(choice, resolved);

  themeOptions.forEach((option) => {
    option.classList.toggle("is-selected", option.dataset.themeChoice === choice);
  });
}

function getStoredThemeChoice() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
}

function closeThemeMenu() {
  if (!themeMenu || !themeToggle) {
    return;
  }
  themeMenu.hidden = true;
  themeToggle.setAttribute("aria-expanded", "false");
}

function openThemeMenu() {
  if (!themeMenu || !themeToggle) {
    return;
  }
  themeMenu.hidden = false;
  themeToggle.setAttribute("aria-expanded", "true");
}

function setMobileNavExpanded(expanded) {
  if (!(siteHeader instanceof HTMLElement) || !(mobileNavToggle instanceof HTMLButtonElement)) {
    return;
  }

  siteHeader.classList.toggle("is-nav-open", expanded);
  mobileNavToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  mobileNavToggle.setAttribute("aria-label", expanded ? t("nav_toggle_close_aria") : t("nav_toggle_open_aria"));
}

function closeMobileNav() {
  setMobileNavExpanded(false);
}

function setupMobileNavigation() {
  if (!(siteHeader instanceof HTMLElement) || !(siteNav instanceof HTMLElement) || !(mobileNavToggle instanceof HTMLButtonElement)) {
    return;
  }

  setMobileNavExpanded(false);

  mobileNavToggle.addEventListener("click", () => {
    const isExpanded = mobileNavToggle.getAttribute("aria-expanded") === "true";
    setMobileNavExpanded(!isExpanded);
  });

  const navLinks = Array.from(siteNav.querySelectorAll('a[href^="#"]'));
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  document.addEventListener("click", (event) => {
    if (!siteHeader.classList.contains("is-nav-open")) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (!siteHeader.contains(target)) {
      closeMobileNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeMobileNav();
    }
  });
}

function setupThemeSwitcher() {
  if (!themeToggle || !themeMenu || !themeOptions.length) {
    return;
  }

  const initialChoice = getStoredThemeChoice();
  applyTheme(initialChoice);

  closeThemeMenu();
  themeToggle.addEventListener("click", () => {
    const currentResolved = resolveThemeChoice(getStoredThemeChoice());
    const nextChoice = currentResolved === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextChoice);
    applyTheme(nextChoice);
    closeThemeMenu();
  });

  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const choice = option.dataset.themeChoice;
      if (choice !== "light" && choice !== "dark" && choice !== "system") {
        return;
      }

      localStorage.setItem(THEME_STORAGE_KEY, choice);
      applyTheme(choice);
      closeThemeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!themeMenu.contains(event.target) && !themeToggle.contains(event.target)) {
      closeThemeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeThemeMenu();
    }
  });

  if (typeof systemThemeMedia.addEventListener === "function") {
    systemThemeMedia.addEventListener("change", () => {
      if (getStoredThemeChoice() === "system") {
        applyTheme("system");
      }
    });
  }
}

function setupActiveNav() {
  const allLinks = Array.from(
    document.querySelectorAll('.site-nav a[href^="#"], .footer-links a[href^="#"]')
  );

  if (!allLinks.length) {
    return;
  }

  const sectionIds = [...new Set(
    allLinks
      .map((link) => String(link.getAttribute("href") || "").replace(/^#/, ""))
      .filter(Boolean)
  )];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((section) => section instanceof HTMLElement);

  if (!sections.length) {
    return;
  }

  function setActive(sectionId) {
    allLinks.forEach((link) => {
      const targetId = String(link.getAttribute("href") || "").replace(/^#/, "");
      link.classList.toggle("is-active", targetId === sectionId);
    });

    if (heroProjectsButton) {
      heroProjectsButton.classList.toggle("is-glass-active", sectionId === "projects" || sectionId === "proof");
    }
  }

  function detectActiveSection() {
    const marker = window.innerHeight * 0.32;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom >= marker) {
        activeId = section.id;
      } else if (rect.top < marker) {
        activeId = section.id;
      }
    });

    setActive(activeId);
  }

  detectActiveSection();
  window.addEventListener("scroll", detectActiveSection, { passive: true });
  window.addEventListener("resize", detectActiveSection);
}
function setupWhatsappWidget() {
  if (!whatsappMessage || !whatsappMessageClose) {
    return;
  }

  const revealMessage = () => {
    if (whatsappMessageDismissed) {
      return;
    }

    if (window.scrollY < 110) {
      return;
    }

    whatsappMessage.hidden = false;
    window.removeEventListener("scroll", revealMessage);
  };

  whatsappMessageClose.addEventListener("click", () => {
    whatsappMessageDismissed = true;
    whatsappMessage.hidden = true;
    window.removeEventListener("scroll", revealMessage);
  });

  window.addEventListener("scroll", revealMessage, { passive: true });
}

async function renderPortfolioSections() {
  await importProjects();
  renderTestimonials();
  renderProofProjectCount();
  renderAboutStory();
  await renderAboutProfile();
}

async function syncPortfolioFromCloudAndRender() {
  if (cloudSync?.pullLatestToLocal) {
    try {
      await cloudSync.pullLatestToLocal();
    } catch (error) {
      console.error("Cloud sync pull failed on portfolio", error);
    }
  }

  await renderPortfolioSections();
}
window.addEventListener("storage", (event) => {
  if (event.key === ADMIN_PROJECTS_KEY) {
    importProjects();
  }

  if (event.key === TESTIMONIALS_KEY) {
    renderTestimonials();
  }

  if (event.key === DASHBOARD_PROJECT_COUNT_KEY) {
    renderProofProjectCount();
  }

  if (event.key === ABOUT_PROFILE_KEY) {
    void renderAboutProfile();
  }

  if (event.key === ABOUT_STORY_KEY) {
    renderAboutStory();
  }
});

window.addEventListener("focus", () => {
  void syncPortfolioFromCloudAndRender();
});

window.addEventListener("iamyotto:cloud-sync-applied", () => {
  void renderPortfolioSections();
});

window.addEventListener("DOMContentLoaded", async () => {
  applyStaticTranslations();
  ensureTestimonialsSeeded();
  setupThemeSwitcher();
  setupMobileNavigation();
  setupScrollReveal();
  setupActiveNav();
  setupWhatsappWidget();
  setupProjectsPagination();
  setupTestimonialForm();
  setupContactForm();

  if (cloudSync?.ensureRemoteSeededFromLocal) {
    try {
      await cloudSync.ensureRemoteSeededFromLocal();
    } catch (error) {
      console.error("Cloud sync seed failed on portfolio", error);
    }
  }

  await syncPortfolioFromCloudAndRender();
  incrementPortfolioVisits();
});

window.addEventListener("beforeunload", () => {
  if (projectPageTransitionTimeout) {
    clearTimeout(projectPageTransitionTimeout);
    projectPageTransitionTimeout = null;
  }
  if (projectPageEnterTimeout) {
    clearTimeout(projectPageEnterTimeout);
    projectPageEnterTimeout = null;
  }

  if (aboutPhotoBlobUrl) {
    URL.revokeObjectURL(aboutPhotoBlobUrl);
    aboutPhotoBlobUrl = "";
  }
});
