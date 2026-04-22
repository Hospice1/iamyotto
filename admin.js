const ADMIN_PROJECTS_KEY = "iamyotto_admin_projects";
const TESTIMONIALS_KEY = "iamyotto_testimonials";
const CONTACT_MESSAGES_KEY = "iamyotto_contact_messages";
const DASHBOARD_PROJECT_COUNT_KEY = "iamyotto_dashboard_project_count";
const PORTFOLIO_VISITS_KEY = "iamyotto_portfolio_visits";
const ABOUT_PROFILE_KEY = "iamyotto_about_profile";
const ABOUT_STORY_KEY = "iamyotto_about_story";
const ADMIN_SESSION_KEY = "iamyotto_admin_session";
const ADMIN_HISTORY_KEY = "iamyotto_admin_history";
const ADMIN_PASSWORD = "AZERTY1234";
const CATALOG_PATH = "data.json";
const HISTORY_LIMIT = 30;
const DEFAULT_ABOUT_STORY = [
  "Je m'appelle Hospice YOTTO, fondateur de iamyotto Co. Je cree des identites visuelles qui ne se contentent pas d'etre belles - elles marquent, elles vendent, elles racontent.",
  "Designer depuis plus de 3 ans, je me suis passionne pour la maniere dont le visuel transforme une idee en experience. Pour moi, chaque projet est une combinaison de storytelling, de strategie et d'esthetique.",
  "Je ne me limite a aucun style. Mon travail navigue entre design imprime et experiences digitales, avec un objectif simple: creer des visuels qui captent l'attention et restent en memoire.",
  "Chaque collaboration est un processus construit avec le client. Je traduis des visions en identites fortes, en mettant l'accent sur la clarte, l'impact et la differenciation.",
  "Mon approche repose sur des compositions epurees, des choix audacieux et une recherche constante d'evolution.",
].join("\n\n");

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

const loginGate = document.getElementById("login-gate");
const adminApp = document.getElementById("admin-app");
const loginForm = document.getElementById("login-form");
const loginPassword = document.getElementById("login-password");
const loginStatus = document.getElementById("login-status");
const logoutBtn = document.getElementById("logout-btn");

const form = document.getElementById("admin-form");
const statusBox = document.getElementById("admin-status");
const list = document.getElementById("admin-list");
const clearAllBtn = document.getElementById("clear-all");
const imageFilesInput = document.getElementById("image-files");
const editProjectIdInput = document.getElementById("edit-project-id");
const submitProjectBtn = document.getElementById("submit-project-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const categoryInput = form?.querySelector('input[name="categorie"]');
const titleInput = form?.querySelector('input[name="titre"]');
const descriptionInput = form?.querySelector('textarea[name="description"]');
const editMediaPanel = document.getElementById("edit-media-panel");
const editMediaList = document.getElementById("edit-media-list");

const historyList = document.getElementById("history-list");
const historyStatus = document.getElementById("history-status");
const clearHistoryBtn = document.getElementById("clear-history");

const testimonialList = document.getElementById("testimonial-list");
const testimonialStatus = document.getElementById("testimonial-status");
const removeBadBtn = document.getElementById("remove-bad-testimonials");
const contactMessagesList = document.getElementById("contact-messages-list");
const contactMessagesStatus = document.getElementById("contact-messages-status");
const clearContactMessagesBtn = document.getElementById("clear-contact-messages");
const dashboardForm = document.getElementById("dashboard-form");
const dashboardProjectCountInput = document.getElementById("dashboard-project-count");
const dashboardVisits = document.getElementById("dashboard-visits");
const dashboardProjectsPreview = document.getElementById("dashboard-projects-preview");
const dashboardStatus = document.getElementById("dashboard-status");
const aboutProfileForm = document.getElementById("about-profile-form");
const aboutRoleText = document.getElementById("about-role-text");
const aboutPhotoFile = document.getElementById("about-photo-file");
const aboutPhotoPreview = document.getElementById("about-photo-preview");
const aboutProfileStatus = document.getElementById("about-profile-status");
const aboutStoryText = document.getElementById("about-story-text");
const websiteUrlInput = form?.querySelector('input[name="websiteUrl"]');
const dashboardResetVisitsBtn = document.getElementById("dashboard-reset-visits");

let editMediaDraft = [];
const adminBlobUrls = new Set();
let aboutPreviewBlobUrl = "";

function cloneJSON(value) {
  return JSON.parse(JSON.stringify(value));
}

function isAuthenticated() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
}

function lockAdmin() {
  clearAdminBlobUrls();
  clearAboutPreviewBlobUrl();

  if (adminApp) {
    adminApp.hidden = true;
  }
  if (loginGate) {
    loginGate.hidden = false;
  }
}

async function unlockAdmin() {
  if (loginGate) {
    loginGate.hidden = true;
  }
  if (adminApp) {
    adminApp.hidden = false;
  }

  await migrateProjectsMediaToIndexedDb();
  purgeSeededCatalogProjects();
  renderProjectList();
  renderHistoryList();
  renderTestimonialList();
  renderContactMessageList();
  renderDashboardPanel();
  await renderAboutProfileEditor();
}

function createProjectId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  return text || DEFAULT_ABOUT_STORY;
}

function loadAboutStory() {
  try {
    const raw = localStorage.getItem(ABOUT_STORY_KEY);
    if (!raw) {
      return DEFAULT_ABOUT_STORY;
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
    return DEFAULT_ABOUT_STORY;
  }
}

function saveAboutStory(storyText) {
  try {
    localStorage.setItem(ABOUT_STORY_KEY, JSON.stringify(normalizeAboutStoryText(storyText)));
    return true;
  } catch (error) {
    console.error("Stockage texte a propos plein", error);
    return false;
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
  const category = String(item?.category || item?.categorie || "Creation").trim();
  const title = String(item?.title || item?.titre || "Creation sans titre").trim();
  const description = String(item?.description || "").trim();
  const catalogRef = String(item?.catalogRef || "").trim();
  const websiteUrl = normalizeWebsiteUrl(item?.websiteUrl || item?.siteUrl || item?.link || "");

  const medias = extractProjectMedias(item);
  if (!medias.length) {
    medias.push({ src: "assets/project-01.jpg", type: "image" });
  }

  return {
    id: String(item?.id || createProjectId()),
    category: category || "Creation",
    title: title || "Creation sans titre",
    description,
    websiteUrl,
    image: String(medias[0]?.src || ""),
    medias,
    createdAt: item?.createdAt || new Date().toISOString(),
    catalogRef,
  };
}

function createCatalogRef(item, index, sourceLabel) {
  const explicit = String(item?.catalogRef || item?.id || item?.sku || item?.code || "").trim();
  if (explicit) {
    return `${sourceLabel}:${explicit}`;
  }

  return `${sourceLabel}:${index}`;
}

function normalizeProjectsArray(list, options = {}) {
  if (!Array.isArray(list)) {
    return [];
  }

  const sourceLabel = String(options.sourceLabel || "catalog");

  return list
    .map((item, index) => normalizeProject({
      ...item,
      catalogRef: item?.catalogRef || createCatalogRef(item, index, sourceLabel),
    }))
    .filter((entry) => Boolean(entry.title));
}

function mapWhatsAppLikePayload(data) {
  const sourceType = data?.source?.type || "json";

  if (sourceType === "whatsapp" && Array.isArray(data?.source?.products)) {
    return normalizeProjectsArray(data.source.products, { sourceLabel: "whatsapp" });
  }

  return normalizeProjectsArray(data?.products, { sourceLabel: "catalog" });
}

async function loadCatalogProjects() {
  try {
    const response = await fetch(CATALOG_PATH, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return mapWhatsAppLikePayload(data);
  } catch (error) {
    console.error("Erreur de chargement du catalogue", error);
    return [];
  }
}

function projectSignature(project) {
  const firstSrc = String(project?.medias?.[0]?.src || project?.image || "").trim();
  return `${String(project.title || "").trim().toLowerCase()}|${String(project.category || "").trim().toLowerCase()}|${firstSrc}`;
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

function purgeSeededCatalogProjects() {
  const projects = loadProjects();
  if (!projects.length) {
    return projects;
  }

  const filtered = projects.filter((project) => !isSeedCatalogProject(project));
  if (filtered.length === projects.length) {
    return projects;
  }

  if (!saveProjects(filtered)) {
    return projects;
  }

  return filtered;
}
async function mergeCatalogIntoAdminProjects() {
  const existing = loadProjects();
  const catalogProjects = await loadCatalogProjects();

  if (!catalogProjects.length) {
    return existing;
  }

  if (!existing.length) {
    saveProjects(catalogProjects);
    return catalogProjects;
  }

  const merged = [...existing];
  let changed = false;

  catalogProjects.forEach((catalogProject) => {
    const ref = String(catalogProject.catalogRef || "").trim();

    let matchIndex = ref
      ? merged.findIndex((item) => String(item.catalogRef || "").trim() === ref)
      : -1;

    if (matchIndex < 0) {
      const signature = projectSignature(catalogProject);
      matchIndex = merged.findIndex(
        (item) => !String(item.catalogRef || "").trim() && projectSignature(item) === signature
      );

      if (matchIndex >= 0) {
        merged[matchIndex] = normalizeProject({
          ...merged[matchIndex],
          catalogRef: ref,
        });
        changed = true;
      }
    }

    if (matchIndex < 0) {
      merged.push(catalogProject);
      changed = true;
    }
  });

  if (changed) {
    saveProjects(merged);
  }

  return merged;
}

function normalizeTestimonial(item) {
  const rating = Number(item?.rating);
  return {
    name: String(item?.name || "Client anonyme"),
    rating: Number.isNaN(rating) ? 5 : Math.max(1, Math.min(5, rating)),
    message: String(item?.message || "Avis indisponible."),
    createdAt: item?.createdAt || new Date().toISOString(),
    hiddenOnPortfolio: Boolean(item?.hiddenOnPortfolio),
    moderationTest: Boolean(item?.moderationTest),
  };
}

function ensureTestimonialsSeeded() {
  if (localStorage.getItem(TESTIMONIALS_KEY)) {
    return;
  }

  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(INITIAL_TESTIMONIALS));
}

function loadProjects() {
  try {
    const raw = localStorage.getItem(ADMIN_PROJECTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed.map(normalizeProject);
    const needsMigration = parsed.some((item, index) => {
      const normalizedItem = normalized[index];
      const oldMediaJSON = JSON.stringify(item?.medias || []);
      const nextMediaJSON = JSON.stringify(normalizedItem.medias);

      return !item?.id
        || !item?.title
        || !item?.category
        || String(item?.description || "") !== normalizedItem.description
        || String(item?.websiteUrl || item?.siteUrl || item?.link || "") !== normalizedItem.websiteUrl
        || String(item?.image || "") !== normalizedItem.image
        || oldMediaJSON !== nextMediaJSON
        || String(item?.catalogRef || "") !== String(normalizedItem.catalogRef || "");
    });

    if (needsMigration) {
      saveProjects(normalized);
    }

    return normalized;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveProjects(projects) {
  try {
    localStorage.setItem(ADMIN_PROJECTS_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error("Stockage projets plein", error);
    if (statusBox) {
      statusBox.textContent = "Impossible d'enregistrer: stockage navigateur plein. Reduisez la taille/quantite des medias (surtout videos).";
    }
    return false;
  }
}

function getMediaStore() {
  const store = window.IamyottoMediaStore;
  if (!store) {
    return null;
  }
  return store;
}

function clearAdminBlobUrls() {
  adminBlobUrls.forEach((url) => URL.revokeObjectURL(url));
  adminBlobUrls.clear();
}
function clearAboutPreviewBlobUrl() {
  if (!aboutPreviewBlobUrl) {
    return;
  }

  URL.revokeObjectURL(aboutPreviewBlobUrl);
  aboutPreviewBlobUrl = "";
}

async function resolveAdminMediaSrc(media) {
  if (!media) {
    return "";
  }

  if (media.storage === "idb" && media.id) {
    const store = getMediaStore();
    if (!store?.getObjectURLById) {
      return "";
    }

    const url = await store.getObjectURLById(media.id);
    if (url) {
      adminBlobUrls.add(url);
    }
    return url || "";
  }

  return String(media.src || "");
}

async function hydrateAdminMediaElements() {
  clearAdminBlobUrls();

  const nodes = Array.from(document.querySelectorAll("[data-admin-media='1']"));
  for (const node of nodes) {
    if (!(node instanceof HTMLImageElement) && !(node instanceof HTMLVideoElement)) {
      continue;
    }

    const storage = String(node.dataset.storage || "");
    const mediaId = String(node.dataset.mediaId || "");
    const inlineSrc = String(node.dataset.inlineSrc || "");

    let src = inlineSrc;
    if (storage === "idb" && mediaId) {
      src = await resolveAdminMediaSrc({ storage: "idb", id: mediaId });
    }

    if (!src) {
      continue;
    }

    node.src = src;
  }
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function migrateProjectsMediaToIndexedDb() {
  const store = getMediaStore();
  if (!store?.saveBlob) {
    return;
  }

  const projects = loadProjects();
  if (!projects.length) {
    return;
  }

  let changed = false;

  for (const project of projects) {
    const nextMedias = [];

    for (const media of project.medias || []) {
      if (media?.storage === "idb" && media?.id) {
        nextMedias.push(media);
        continue;
      }

      const src = String(media?.src || "");
      if (!src) {
        continue;
      }

      if (src.startsWith("data:")) {
        try {
          const blob = await dataUrlToBlob(src);
          const saved = await store.saveBlob(blob, {
            type: media?.type || inferMediaType(src),
            name: "migrated-media",
          });

          if (saved) {
            nextMedias.push(saved);
            changed = true;
            continue;
          }
        } catch (error) {
          console.error("Migration media dataURL vers IndexedDB echouee", error);
        }
      }

      nextMedias.push(media);
    }

    if (!nextMedias.length) {
      nextMedias.push({ src: project.image || "assets/project-01.jpg", type: "image" });
    }

    if (JSON.stringify(nextMedias) !== JSON.stringify(project.medias || [])) {
      project.medias = nextMedias;
      project.image = String(nextMedias[0]?.src || project.image || "");
      changed = true;
    }
  }

  if (changed) {
    saveProjects(projects);
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(ADMIN_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erreur historique", error);
    return [];
  }
}

function saveHistory(entries) {
  localStorage.setItem(ADMIN_HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
}

function pushHistory(entry) {
  const entries = loadHistory();
  entries.unshift({
    id: createProjectId(),
    at: new Date().toISOString(),
    ...entry,
  });

  try {
    saveHistory(entries);
  } catch (error) {
    try {
      const reduced = entries.slice(0, Math.max(6, Math.floor(HISTORY_LIMIT / 2)));
      saveHistory(reduced);
    } catch (innerError) {
      console.error("Historique desactive (stockage plein)", innerError);
      if (historyStatus) {
        historyStatus.textContent = "Historique desactive: stockage navigateur plein.";
      }
      return;
    }
  }

  renderHistoryList();
}

function loadTestimonials() {
  ensureTestimonialsSeeded();

  try {
    const raw = localStorage.getItem(TESTIMONIALS_KEY);
    if (!raw) {
      return INITIAL_TESTIMONIALS.map(normalizeTestimonial);
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(normalizeTestimonial)
      : INITIAL_TESTIMONIALS.map(normalizeTestimonial);
  } catch (error) {
    console.error(error);
    return INITIAL_TESTIMONIALS.map(normalizeTestimonial);
  }
}

function saveTestimonials(testimonials) {
  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
}

function normalizeContactMessage(item) {
  return {
    id: String(item?.id || ""),
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
    console.error("Erreur lecture messages contact", error);
    return [];
  }
}

function saveContactMessages(messages) {
  localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
}

function loadDashboardProjectCount() {
  const raw = Number(localStorage.getItem(DASHBOARD_PROJECT_COUNT_KEY));
  if (!Number.isFinite(raw) || raw < 0) {
    return 100;
  }

  return Math.floor(raw);
}

function saveDashboardProjectCount(value) {
  const safe = Math.max(0, Math.floor(Number(value) || 0));
  localStorage.setItem(DASHBOARD_PROJECT_COUNT_KEY, String(safe));
}
function normalizeAboutProfile(value) {
  const roleText = String(value?.roleText || value?.role || "Designer").trim();
  const storage = String(value?.photoStorage || value?.photo?.storage || "").trim();
  const photoId = String(value?.photoId || value?.photo?.id || "").trim();
  const photoSrc = String(value?.photoSrc || value?.photo?.src || "").trim();

  if (storage === "idb" && photoId) {
    return {
      roleText: roleText || "Designer",
      photoStorage: "idb",
      photoId,
      photoSrc: "",
    };
  }

  return {
    roleText: roleText || "Designer",
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

function saveAboutProfile(profile) {
  try {
    localStorage.setItem(ABOUT_PROFILE_KEY, JSON.stringify(normalizeAboutProfile(profile)));
    return true;
  } catch (error) {
    console.error("Stockage profil a propos plein", error);
    return false;
  }
}

async function resolveAboutPreviewSrc(profile) {
  if (profile.photoStorage === "idb" && profile.photoId) {
    const store = getMediaStore();
    if (store?.getObjectURLById) {
      try {
        const src = await store.getObjectURLById(profile.photoId);
        if (src) {
          aboutPreviewBlobUrl = src;
          return src;
        }
      } catch (error) {
        console.error("Erreur chargement photo a propos", error);
      }
    }
  }

  return String(profile.photoSrc || "assets/hospice-yotto.jpg");
}

async function renderAboutProfileEditor() {
  if (!(aboutRoleText instanceof HTMLInputElement) || !(aboutPhotoPreview instanceof HTMLImageElement)) {
    return;
  }

  const profile = loadAboutProfile();
  aboutRoleText.value = profile.roleText || "Designer";

  if (aboutStoryText instanceof HTMLTextAreaElement) {
    aboutStoryText.value = loadAboutStory();
  }

  if (aboutPhotoFile instanceof HTMLInputElement) {
    aboutPhotoFile.value = "";
  }

  clearAboutPreviewBlobUrl();
  const src = await resolveAboutPreviewSrc(profile);
  aboutPhotoPreview.src = src || "assets/hospice-yotto.jpg";
}

function loadPortfolioVisits() {
  const raw = Number(localStorage.getItem(PORTFOLIO_VISITS_KEY));
  if (!Number.isFinite(raw) || raw < 0) {
    return 0;
  }

  return Math.floor(raw);
}

function formatProjectCountDisplay(value) {
  const safe = Math.max(0, Math.floor(Number(value) || 0));
  return `${safe}+`;
}

function renderDashboardPanel() {
  const projectCount = loadDashboardProjectCount();
  const visits = loadPortfolioVisits();

  if (dashboardProjectCountInput) {
    dashboardProjectCountInput.value = String(projectCount);
  }
  if (dashboardVisits) {
    dashboardVisits.textContent = visits.toLocaleString("fr-FR");
  }
  if (dashboardProjectsPreview) {
    dashboardProjectsPreview.textContent = formatProjectCountDisplay(projectCount);
  }
}

function renderContactMessageList() {
  if (!contactMessagesList || !contactMessagesStatus) {
    return;
  }

  const messages = loadContactMessages();
  if (!messages.length) {
    contactMessagesList.innerHTML = '<p class="admin-status">Aucun message reçu.</p>';
    contactMessagesStatus.textContent = "Les messages envoyés depuis la section Contact apparaissent ici.";
    return;
  }

  contactMessagesList.innerHTML = messages
    .map((item, index) => `
      <article class="contact-message-item">
        <div class="contact-message-head">
          <div>
            <p class="contact-message-name">${escapeHTML(item.name)}</p>
            <p class="contact-message-email">${escapeHTML(item.email)}</p>
          </div>
          <p class="contact-message-time">${escapeHTML(formatDateLabel(item.createdAt))}</p>
        </div>
        <p class="contact-message-body">${escapeHTML(item.message)}</p>
        <button class="delete-contact-btn" type="button" data-contact-index="${index}">Supprimer</button>
      </article>
    `)
    .join("");

  contactMessagesStatus.textContent = `${messages.length} message(s) reçu(s).`;
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
  const safe = Math.max(1, Math.min(5, Number(rating) || 5));
  return `${"★".repeat(safe)}${"☆".repeat(5 - safe)}`;
}

function isNegativeOrAbusive(testimonial) {
  const text = String(testimonial?.message || "").toLowerCase();
  const lowRating = Number(testimonial?.rating || 0) <= 2;
  const bannedPattern = /\b(nul|arnaque|insulte|idiot|stupide|con|merde|escroc|pourri|mauvais|honteux)\b/i;
  return lowRating || bannedPattern.test(text);
}

function formatDateLabel(isoDate) {
  const date = new Date(isoDate || Date.now());
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function historyLabel(entry) {
  switch (entry.type) {
    case "create_project":
      return `Création ajoutée: ${entry.title || "sans titre"}`;
    case "update_project":
      return `Création modifiée: ${entry.title || "sans titre"}`;
    case "delete_project":
      return `Création supprimée: ${entry.title || "sans titre"}`;
    case "restore_project":
      return `Création restaurée: ${entry.title || "sans titre"}`;
    case "reorder_project":
      return `Ordre modifié: ${entry.title || "création"}`;
    case "clear_all":
      return "Toutes les créations ont été supprimées";
    case "reset_visits":
      return "Compteur des visites réinitialisé";
    case "update_about":
      return "Section A propos mise a jour";
    default:
      return entry.type || "Action";
  }
}

function renderHistoryList() {
  if (!historyList || !historyStatus) {
    return;
  }

  const entries = loadHistory();
  if (!entries.length) {
    historyList.innerHTML = '<p class="admin-status">Aucun historique disponible.</p>';
    historyStatus.textContent = "Suivi des actions récentes.";
    return;
  }

  historyList.innerHTML = entries
    .map((entry) => {
      const canRestore = entry.type === "delete_project" && entry?.payload?.project && !entry.restored;
      const restoreBtn = canRestore
        ? `<button class="restore-history-btn" type="button" data-history-id="${escapeHTML(entry.id)}">Restaurer</button>`
        : "";

      return `
      <article class="history-item">
        <p class="history-title">${escapeHTML(historyLabel(entry))}</p>
        <p class="history-time">${escapeHTML(formatDateLabel(entry.at))}</p>
        ${restoreBtn}
      </article>
    `;
    })
    .join("");

  historyStatus.textContent = `${entries.length} action(s) enregistrée(s).`;
}

function mediaDataAttrs(media) {
  const storage = media?.storage === "idb" ? "idb" : "src";
  const mediaId = storage === "idb" ? escapeHTML(String(media?.id || "")) : "";
  const inlineSrc = storage === "src" ? escapeHTML(String(media?.src || "")) : "";
  return `data-admin-media="1" data-storage="${storage}" data-media-id="${mediaId}" data-inline-src="${inlineSrc}"`;
}

function projectPreviewMarkup(project) {
  const firstMedia = project.medias?.[0];
  const attrs = mediaDataAttrs(firstMedia || {});

  if (firstMedia?.type === "video") {
    return `<video ${attrs} muted playsinline preload="metadata"></video>`;
  }

  return `<img ${attrs} alt="${escapeHTML(project.title)}" loading="lazy" />`;
}

function mediaThumbMarkup(media, index) {
  const attrs = mediaDataAttrs(media || {});
  const preview = media.type === "video"
    ? `<video ${attrs} muted playsinline preload="metadata"></video>`
    : `<img ${attrs} alt="Media ${index + 1}" loading="lazy" />`;

  return `
    <article class="edit-media-item">
      ${preview}
      <button class="remove-media-btn" type="button" data-media-index="${index}" aria-label="Supprimer ce média">✕</button>
    </article>
  `;
}

function renderEditMediaDraft() {
  if (!editMediaPanel || !editMediaList) {
    return;
  }

  if (!editProjectIdInput?.value) {
    editMediaPanel.hidden = true;
    editMediaList.innerHTML = "";
    return;
  }

  editMediaPanel.hidden = false;

  if (!editMediaDraft.length) {
    editMediaList.innerHTML = '<p class="admin-status">Aucun média conservé. Ajoutez-en au moins un nouveau avant d’enregistrer.</p>';
    return;
  }

  editMediaList.innerHTML = editMediaDraft.map((media, index) => mediaThumbMarkup(media, index)).join("");
  void hydrateAdminMediaElements();
}

function setCreateMode() {
  if (editProjectIdInput) {
    editProjectIdInput.value = "";
  }
  editMediaDraft = [];
  renderEditMediaDraft();

  if (websiteUrlInput instanceof HTMLInputElement) {
    websiteUrlInput.value = "";
  }

  if (submitProjectBtn) {
    submitProjectBtn.textContent = "Ajouter la création";
  }
  if (cancelEditBtn) {
    cancelEditBtn.hidden = true;
  }
}

function setEditMode(project) {
  if (
    !project
    || !(categoryInput instanceof HTMLInputElement)
    || !(titleInput instanceof HTMLInputElement)
    || !(descriptionInput instanceof HTMLTextAreaElement)
  ) {
    return;
  }

  if (editProjectIdInput) {
    editProjectIdInput.value = project.id;
  }
  categoryInput.value = project.category;
  titleInput.value = project.title;
  descriptionInput.value = project.description || "";

  if (websiteUrlInput instanceof HTMLInputElement) {
    websiteUrlInput.value = String(project.websiteUrl || "");
  }

  editMediaDraft = cloneJSON(project.medias || []);
  renderEditMediaDraft();

  if (imageFilesInput) {
    imageFilesInput.value = "";
  }

  if (submitProjectBtn) {
    submitProjectBtn.textContent = "Enregistrer la modification";
  }
  if (cancelEditBtn) {
    cancelEditBtn.hidden = false;
  }

  if (statusBox) {
    statusBox.textContent = "Mode modification actif. Retirez des médias avec ✕, ou ajoutez de nouveaux médias.";
  }

  form?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderProjectList() {
  if (!list) {
    return;
  }

  const projects = loadProjects();

  if (!projects.length) {
    list.innerHTML = '<p class="admin-status">Aucune creation ajoutee pour le moment.</p>';
    return;
  }

  list.innerHTML = projects
    .map((project, index) => {
      const websiteMarkup = project.websiteUrl
        ? `<p class="admin-status"><a class="admin-project-link" href="${escapeHTML(project.websiteUrl)}" target="_blank" rel="noopener noreferrer">Voir le site</a></p>`
        : "";

      return `
      <article class="admin-item">
        ${projectPreviewMarkup(project)}
        <div class="admin-item-body">
          <p class="admin-category">${escapeHTML(project.category)}</p>
          <h3>${escapeHTML(project.title)}</h3>
          <p class="admin-status">${project.medias.length} media(s)</p>
          ${websiteMarkup}
          <div class="admin-item-actions">
            <button class="order-btn" type="button" data-order="up" data-id="${escapeHTML(project.id)}" ${index === 0 ? "disabled" : ""}>Monter</button>
            <button class="order-btn" type="button" data-order="down" data-id="${escapeHTML(project.id)}" ${index === projects.length - 1 ? "disabled" : ""}>Descendre</button>
            <button class="edit-btn" type="button" data-id="${escapeHTML(project.id)}">Modifier</button>
            <button class="delete-btn" type="button" data-id="${escapeHTML(project.id)}">Supprimer</button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  void hydrateAdminMediaElements();
}

function renderTestimonialList() {
  if (!testimonialList) {
    return;
  }

  const testimonials = loadTestimonials();

  if (!testimonials.length) {
    testimonialList.innerHTML = '<p class="admin-status">Aucun temoignage enregistre.</p>';
    return;
  }

  testimonialList.innerHTML = testimonials
    .map((item, index) => {
      const flagged = isNegativeOrAbusive(item);
      const status = flagged
        ? '<span class="badge badge-danger">Negatif / Injurieux</span>'
        : '<span class="badge badge-ok">Positif</span>';

      return `
      <article class="testimonial-admin-item ${flagged ? "is-flagged" : ""}">
        <div class="testimonial-admin-head">
          <p class="testimonial-admin-name">${escapeHTML(item.name)}</p>
          <p class="testimonial-admin-stars">${starString(item.rating)}</p>
        </div>
        <p class="testimonial-admin-message">${escapeHTML(item.message)}</p>
        <div class="testimonial-admin-meta">
          ${status}
          <button class="delete-testimonial-btn" type="button" data-index="${index}">Supprimer</button>
        </div>
      </article>
    `;
    })
    .join("");
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Fichier non lisible"));
    reader.readAsDataURL(file);
  });
}

async function filesToMedias(files) {
  const store = getMediaStore();

  if (store?.saveFile) {
    const medias = await Promise.all(
      files.map(async (file) => {
        const saved = await store.saveFile(file);
        return normalizeMediaEntry(saved);
      })
    );

    return medias.filter(Boolean);
  }

  const medias = await Promise.all(
    files.map(async (file) => {
      const src = await readFileAsDataURL(file);
      const type = String(file.type || "").startsWith("video/") ? "video" : "image";
      return { src, type };
    })
  );

  return medias.map(normalizeMediaEntry).filter(Boolean);
}

function restoreDeletedProject(historyId) {
  const entries = loadHistory();
  const idx = entries.findIndex((entry) => entry.id === historyId);
  if (idx < 0) {
    return;
  }

  const entry = entries[idx];
  if (entry.type !== "delete_project" || !entry?.payload?.project || entry.restored) {
    return;
  }

  const projects = loadProjects();
  const project = normalizeProject(entry.payload.project);
  const insertIndex = Math.max(0, Math.min(Number(entry?.payload?.index ?? projects.length), projects.length));

  projects.splice(insertIndex, 0, project);
  if (!saveProjects(projects)) {
    return;
  }

  entries[idx] = {
    ...entry,
    restored: true,
  };
  saveHistory(entries);

  pushHistory({
    type: "restore_project",
    title: project.title,
  });

  renderProjectList();
  if (statusBox) {
    statusBox.textContent = "Création restaurée depuis l'historique.";
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const value = String(loginPassword?.value || "").trim();
  if (value !== ADMIN_PASSWORD) {
    if (loginStatus) {
      loginStatus.textContent = "Mot de passe incorrect.";
    }
    return;
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
  if (loginPassword) {
    loginPassword.value = "";
  }
  await unlockAdmin();
});

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  lockAdmin();
  setCreateMode();
  form?.reset();
  if (loginStatus) {
    loginStatus.textContent = "Connexion requise.";
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const projectId = String(data.get("projectId") || "").trim();
  const category = String(data.get("categorie") || "").trim();
  const title = String(data.get("titre") || "").trim();
  const description = String(data.get("description") || "").trim();
  const websiteRaw = String(data.get("websiteUrl") || "").trim();
  const websiteUrl = normalizeWebsiteUrl(websiteRaw);
  const files = Array.from(imageFilesInput?.files || []);

  if (!category || !title) {
    if (statusBox) {
      statusBox.textContent = "Categorie et titre sont obligatoires.";
    }
    return;
  }

  if (websiteRaw && !websiteUrl) {
    if (statusBox) {
      statusBox.textContent = "Le lien du site est invalide. Utilisez un format du type https://monsite.com.";
    }
    return;
  }

  if (isWebDesignCategory(category) && !websiteUrl) {
    if (statusBox) {
      statusBox.textContent = "Pour la categorie Web Design, le lien du site est obligatoire.";
    }
    return;
  }

  const projects = loadProjects();

  if (projectId) {
    const index = projects.findIndex((item) => item.id === projectId);
    if (index < 0) {
      if (statusBox) {
        statusBox.textContent = "Creation introuvable. Rechargez la page.";
      }
      setCreateMode();
      return;
    }

    const currentProject = projects[index];
    let medias = cloneJSON(editMediaDraft);

    if (files.length) {
      try {
        const appended = await filesToMedias(files);
        medias = [...medias, ...appended];
      } catch {
        if (statusBox) {
          statusBox.textContent = "Impossible de lire un ou plusieurs médias.";
        }
        return;
      }
    }

    if (!medias.length) {
      if (statusBox) {
        statusBox.textContent = "Conservez au moins un média ou ajoutez-en un nouveau.";
      }
      return;
    }

    projects[index] = normalizeProject({
      ...currentProject,
      id: currentProject.id,
      category,
      title,
      description,
      websiteUrl,
      medias,
      createdAt: currentProject.createdAt,
      catalogRef: currentProject.catalogRef,
    });

    if (!saveProjects(projects)) {
      return;
    }
    pushHistory({
      type: "update_project",
      title,
    });

    form.reset();
    if (imageFilesInput) {
      imageFilesInput.value = "";
    }
    setCreateMode();

    if (statusBox) {
      statusBox.textContent = "Création modifiée.";
    }

    renderProjectList();
    return;
  }

  if (!files.length) {
    if (statusBox) {
      statusBox.textContent = "Ajoutez au moins un média.";
    }
    return;
  }

  let medias;
  try {
    medias = await filesToMedias(files);
  } catch {
    if (statusBox) {
      statusBox.textContent = "Impossible de lire un ou plusieurs médias.";
    }
    return;
  }

  if (!medias.length) {
    if (statusBox) {
      statusBox.textContent = "Ajoutez au moins un média valide.";
    }
    return;
  }

  const newProject = normalizeProject({
    category,
    title,
    description,
    websiteUrl,
    medias,
  });

  const mergedProjects = [newProject, ...projects];
  if (!saveProjects(mergedProjects)) {
    return;
  }
  pushHistory({
    type: "create_project",
    title: newProject.title,
  });

  form.reset();
  if (imageFilesInput) {
    imageFilesInput.value = "";
  }
  setCreateMode();

  if (statusBox) {
    statusBox.textContent = `${newProject.medias.length} media(s) ajoute(s) dans une seule creation.`;
  }
  renderProjectList();
});

cancelEditBtn?.addEventListener("click", () => {
  form?.reset();
  if (imageFilesInput) {
    imageFilesInput.value = "";
  }
  setCreateMode();
  if (statusBox) {
    statusBox.textContent = "Mode modification annule.";
  }
});

editMediaList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("remove-media-btn")) {
    return;
  }

  const mediaIndex = Number(target.dataset.mediaIndex);
  if (Number.isNaN(mediaIndex) || mediaIndex < 0 || mediaIndex >= editMediaDraft.length) {
    return;
  }

  editMediaDraft.splice(mediaIndex, 1);
  renderEditMediaDraft();
  if (statusBox) {
    statusBox.textContent = "Média retiré. Enregistrez pour confirmer la suppression.";
  }
});

list?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const projectId = String(target.dataset.id || "").trim();
  if (!projectId) {
    return;
  }

  if (target.classList.contains("edit-btn")) {
    const project = loadProjects().find((item) => item.id === projectId);
    if (!project) {
      if (statusBox) {
        statusBox.textContent = "Creation introuvable.";
      }
      return;
    }

    setEditMode(project);
    return;
  }

  if (target.classList.contains("order-btn")) {
    const direction = target.dataset.order;
    if (direction !== "up" && direction !== "down") {
      return;
    }

    const projects = loadProjects();
    const index = projects.findIndex((item) => item.id === projectId);
    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= projects.length) {
      return;
    }

    const [moved] = projects.splice(index, 1);
    projects.splice(swapIndex, 0, moved);
    if (!saveProjects(projects)) {
      return;
    }

    pushHistory({
      type: "reorder_project",
      title: moved.title,
    });

    renderProjectList();
    if (statusBox) {
      statusBox.textContent = "Ordre d'affichage mis à jour.";
    }
    return;
  }

  if (!target.classList.contains("delete-btn")) {
    return;
  }

  const projects = loadProjects();
  const index = projects.findIndex((item) => item.id === projectId);
  if (index < 0) {
    return;
  }

  const removed = projects[index];
  projects.splice(index, 1);
  if (!saveProjects(projects)) {
    return;
  }

  pushHistory({
    type: "delete_project",
    title: removed.title,
    payload: {
      index,
      project: removed,
    },
  });

  if (editProjectIdInput?.value === projectId) {
    form?.reset();
    if (imageFilesInput) {
      imageFilesInput.value = "";
    }
    setCreateMode();
  }

  if (statusBox) {
    statusBox.textContent = "Creation supprimee. Vous pouvez la restaurer depuis l'historique.";
  }
  renderProjectList();
});

historyList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("restore-history-btn")) {
    return;
  }

  const historyId = String(target.dataset.historyId || "").trim();
  if (!historyId) {
    return;
  }

  restoreDeletedProject(historyId);
});

clearHistoryBtn?.addEventListener("click", () => {
  saveHistory([]);
  renderHistoryList();
});


testimonialList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("delete-testimonial-btn")) {
    return;
  }

  const index = Number(target.dataset.index);
  if (Number.isNaN(index)) {
    return;
  }

  const testimonials = loadTestimonials();
  testimonials.splice(index, 1);
  saveTestimonials(testimonials);
  if (testimonialStatus) {
    testimonialStatus.textContent = "Temoignage supprime.";
  }
  renderTestimonialList();
});

contactMessagesList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("delete-contact-btn")) {
    return;
  }

  const index = Number(target.dataset.contactIndex);
  if (Number.isNaN(index)) {
    return;
  }

  const messages = loadContactMessages();
  messages.splice(index, 1);
  saveContactMessages(messages);
  renderContactMessageList();
});

clearContactMessagesBtn?.addEventListener("click", () => {
  saveContactMessages([]);
  renderContactMessageList();
});


dashboardForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = Number(dashboardProjectCountInput?.value || "");
  if (!Number.isFinite(value) || value < 0) {
    if (dashboardStatus) {
      dashboardStatus.textContent = "Entrez un nombre valide (0 ou plus).";
    }
    return;
  }

  saveDashboardProjectCount(value);
  renderDashboardPanel();

  if (dashboardStatus) {
    dashboardStatus.textContent = "Chiffre projets mis a jour.";
  }
});

dashboardResetVisitsBtn?.addEventListener("click", () => {
  localStorage.setItem(PORTFOLIO_VISITS_KEY, "0");
  renderDashboardPanel();
  pushHistory({
    type: "reset_visits",
  });

  if (dashboardStatus) {
    dashboardStatus.textContent = "Compteur de visites reinitialise.";
  }
});

aboutProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const roleText = String(aboutRoleText?.value || "").trim() || "Designer";
  const storyText = normalizeAboutStoryText(aboutStoryText?.value || "");
  const currentProfile = loadAboutProfile();
  let nextProfile = normalizeAboutProfile({
    ...currentProfile,
    roleText,
  });

  const file = aboutPhotoFile instanceof HTMLInputElement
    ? aboutPhotoFile.files?.[0] || null
    : null;

  if (file) {
    if (!String(file.type || "").startsWith("image/")) {
      if (aboutProfileStatus) {
        aboutProfileStatus.textContent = "Choisissez une image valide (jpg, png, webp...).";
      }
      return;
    }

    const store = getMediaStore();
    if (store?.saveFile) {
      try {
        const saved = await store.saveFile(file);
        nextProfile = normalizeAboutProfile({
          roleText,
          photoStorage: "idb",
          photoId: saved?.id || "",
          photoSrc: "",
        });

        if (
          currentProfile.photoStorage === "idb"
          && currentProfile.photoId
          && currentProfile.photoId !== nextProfile.photoId
          && store.deleteById
        ) {
          try {
            await store.deleteById(currentProfile.photoId);
          } catch (cleanupError) {
            console.warn("Ancienne photo a propos non supprimee", cleanupError);
          }
        }
      } catch (error) {
        console.error("Erreur sauvegarde photo a propos", error);
        if (aboutProfileStatus) {
          aboutProfileStatus.textContent = "Impossible d'enregistrer cette image.";
        }
        return;
      }
    } else {
      try {
        const dataUrl = await readFileAsDataURL(file);
        nextProfile = normalizeAboutProfile({
          roleText,
          photoStorage: "src",
          photoId: "",
          photoSrc: dataUrl,
        });
      } catch (error) {
        console.error("Erreur lecture image a propos", error);
        if (aboutProfileStatus) {
          aboutProfileStatus.textContent = "Impossible de lire cette image.";
        }
        return;
      }
    }
  }

  if (!saveAboutProfile(nextProfile)) {
    if (aboutProfileStatus) {
      aboutProfileStatus.textContent = "Impossible d'enregistrer: stockage navigateur plein.";
    }
    return;
  }

  if (!saveAboutStory(storyText)) {
    if (aboutProfileStatus) {
      aboutProfileStatus.textContent = "Impossible d'enregistrer le texte A propos: stockage plein.";
    }
    return;
  }

  pushHistory({
    type: "update_about",
  });

  await renderAboutProfileEditor();
  if (aboutProfileStatus) {
    aboutProfileStatus.textContent = "Section A propos mise a jour.";
  }
});
removeBadBtn?.addEventListener("click", () => {
  const testimonials = loadTestimonials();
  const filtered = testimonials.filter((item) => !isNegativeOrAbusive(item));
  const removed = testimonials.length - filtered.length;

  if (!removed) {
    if (testimonialStatus) {
      testimonialStatus.textContent = "Aucun avis negatif/injurieux detecte.";
    }
    return;
  }

  saveTestimonials(filtered);
  if (testimonialStatus) {
    testimonialStatus.textContent = `${removed} avis negatif(s)/injurieux supprime(s).`;
  }
  renderTestimonialList();
});

clearAllBtn?.addEventListener("click", () => {
  const confirmed = window.confirm("Supprimer toutes les creations de la section Projets ?");
  if (!confirmed) {
    return;
  }

  const count = loadProjects().length;
  if (!saveProjects([])) {
    return;
  }
  pushHistory({
    type: "clear_all",
    title: `${count}`,
  });

  form?.reset();
  if (imageFilesInput) {
    imageFilesInput.value = "";
  }
  setCreateMode();
  if (statusBox) {
    statusBox.textContent = "Toutes les creations ont ete supprimees.";
  }
  renderProjectList();
});


window.addEventListener("storage", (event) => {
  if (event.key === PORTFOLIO_VISITS_KEY || event.key === DASHBOARD_PROJECT_COUNT_KEY) {
    renderDashboardPanel();
  }

  if (event.key === ABOUT_PROFILE_KEY || event.key === ABOUT_STORY_KEY) {
    void renderAboutProfileEditor();
  }
});

window.addEventListener("beforeunload", () => {
  clearAdminBlobUrls();
  clearAboutPreviewBlobUrl();
});
window.addEventListener("DOMContentLoaded", async () => {
  ensureTestimonialsSeeded();
  setCreateMode();

  if (isAuthenticated()) {
    await unlockAdmin();
  } else {
    lockAdmin();
  }
});
