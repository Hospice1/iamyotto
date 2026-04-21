const THEME_STORAGE_KEY = "iamyotto_theme_preference";
const ADMIN_PROJECTS_KEY = "iamyotto_admin_projects";
const TESTIMONIALS_KEY = "iamyotto_testimonials";
const CONTACT_MESSAGES_KEY = "iamyotto_contact_messages";
const DASHBOARD_PROJECT_COUNT_KEY = "iamyotto_dashboard_project_count";
const PORTFOLIO_VISITS_KEY = "iamyotto_portfolio_visits";

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
const projectsToggle = document.getElementById("projects-toggle");
const projectsToggleLess = document.getElementById("projects-toggle-less");

const testimonialsGrid = document.getElementById("testimonials-grid");
const testimonialsToggle = document.getElementById("testimonials-toggle");
const testimonialsToggleLess = document.getElementById("testimonials-toggle-less");
const testimonialForm = document.getElementById("testimonial-form");
const testimonialStatus = document.getElementById("testimonial-status");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const proofProjectCount = document.getElementById("proof-project-count");
const whatsappMessage = document.getElementById("whatsapp-message");
const whatsappMessageClose = document.getElementById("whatsapp-message-close");
const themeToggle = document.getElementById("theme-toggle");
const themeMenu = document.getElementById("theme-menu");
const themeOptions = Array.from(document.querySelectorAll(".theme-option"));
const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

const PROJECT_INITIAL_COUNT = 6;
const PROJECT_STEP_COUNT = 10;
const TESTIMONIAL_INITIAL_COUNT = 4;
const TESTIMONIAL_STEP_COUNT = 4;

let visibleProjectCount = PROJECT_INITIAL_COUNT;
let visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
let renderedProjects = [];
const previewIntervals = new Map();
const touchPreviewTimeouts = new Map();
const projectBlobUrls = new Set();
let modalBlobUrl = "";
let modalState = null;
let touchTapState = {
  cardKey: "",
  at: 0,
};
let whatsappMessageDismissed = false;

async function loadCatalogData() {
  const response = await fetch("data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Impossible de charger data.json");
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
  const category = String(item?.category || item?.categorie || "Creation").trim();
  const title = String(item?.titre || item?.title || "Creation sans titre").trim();
  const description = String(item?.description || "").trim();
  const medias = extractProjectMedias(item);

  if (!medias.length) {
    medias.push({ src: "assets/project-01.jpg", type: "image" });
  }

  return {
    title: title || "Creation sans titre",
    category: category || "Creation",
    description,
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
    name: String(item?.name || "Client anonyme"),
    rating: Number.isNaN(rating) ? 5 : Math.max(1, Math.min(5, rating)),
    message: String(item?.message || "Avis indisponible."),
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
}

function setupContactForm() {
  if (!(contactForm instanceof HTMLFormElement) || !(contactStatus instanceof HTMLElement)) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("contact") === "success") {
    contactStatus.textContent = "Envoi reussi";
    contactStatus.classList.add("is-success");

    params.delete("contact");
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || "#contact"}`;
    window.history.replaceState(null, "", nextUrl);
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      contactStatus.textContent = "Merci de remplir tous les champs.";
      contactStatus.classList.remove("is-success");
      return;
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

    const paramsSubmit = new URLSearchParams(window.location.search);
    paramsSubmit.set("contact", "success");
    const query = paramsSubmit.toString();
    window.location.href = `${window.location.pathname}?${query}#contact`;
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
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
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

function renderProjects(projects, preservePagination = false) {
  if (!projectGrid) {
    return;
  }

  renderedProjects = projects;

  if (!preservePagination) {
    visibleProjectCount = PROJECT_INITIAL_COUNT;
  }

  previewIntervals.forEach((intervalId) => {
    clearInterval(intervalId);
  });
  previewIntervals.clear();

  if (!projects.length) {
    clearProjectBlobUrls();
    projectGrid.innerHTML = '<p class="project-description">Aucune creation disponible pour le moment.</p>';
    if (projectsToggle) {
      projectsToggle.hidden = true;
    }
    if (projectsToggleLess) {
      projectsToggleLess.hidden = true;
    }
    return;
  }

  const clampedVisibleCount = Math.min(projects.length, Math.max(PROJECT_INITIAL_COUNT, visibleProjectCount));
  const shownProjects = projects.slice(0, clampedVisibleCount);

  projectGrid.innerHTML = shownProjects
    .map((project, projectIndex) => {
      const medias = Array.isArray(project.medias) ? project.medias : [{ src: project.image, type: "image" }];
      const description = String(project.description || "").trim();
      const descriptionMarkup = description
        ? `<p class="project-description">${escapeHTML(description)}</p>`
        : "";

      const mediaMarkup = medias.map((media, mediaIndex) => renderProjectMedia(media, project.title, projectIndex, mediaIndex)).join("");
      const mediaCountMarkup = medias.length > 1
        ? `<span class="project-media-count">${medias.length}</span>`
        : "";

      return `
      <article class="project-card" data-project-index="${projectIndex}" tabindex="0" role="button" aria-label="Ouvrir ${escapeHTML(project.title)}">
        <div class="project-media-shell">
          ${mediaMarkup}
          ${mediaCountMarkup}
        </div>
        <div class="project-content">
          <p class="project-meta">${escapeHTML(project.category)}</p>
          <h3 class="project-title">${escapeHTML(project.title)}</h3>
          ${descriptionMarkup}
          <p class="project-hint">Double-clic pour afficher en détail</p>
        </div>
      </article>
    `;
    })
    .join("");

  projectGrid.querySelectorAll(".project-card").forEach((card) => {
    setCardMedia(card, 0, false);
  });

  if (projectsToggle) {
    const canShowMore = shownProjects.length < projects.length;
    projectsToggle.hidden = !canShowMore;
    projectsToggle.textContent = "Voir plus";
  }

  if (projectsToggleLess) {
    const canShowLess = projects.length > PROJECT_INITIAL_COUNT && clampedVisibleCount > PROJECT_INITIAL_COUNT;
    projectsToggleLess.hidden = !canShowLess;
    projectsToggleLess.textContent = "Voir moins";
  }

  setupProjectInteractions();
  void hydrateProjectMediaElements();
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

function ensureProjectModal() {
  if (modalState) {
    return modalState;
  }

  const modal = document.createElement("div");
  modal.className = "project-modal";
  modal.setAttribute("hidden", "");
  modal.innerHTML = `
    <div class="project-modal-backdrop" data-close="1"></div>
    <div class="project-modal-dialog" role="dialog" aria-modal="true" aria-label="Détail du projet">
      <button type="button" class="project-modal-close" data-close="1" aria-label="Fermer">×</button>
      <div class="project-modal-layout">
        <div class="project-modal-visual"></div>
        <aside class="project-modal-info">
          <p class="project-modal-meta"></p>
          <h3 class="project-modal-title"></h3>
          <p class="project-modal-description"></p>
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
  const details = modal.querySelector(".project-modal-details");

  if (!(visual instanceof HTMLElement) || !(meta instanceof HTMLElement) || !(title instanceof HTMLElement)
    || !(description instanceof HTMLElement) || !(details instanceof HTMLElement)) {
    return null;
  }

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === "1") {
      closeProjectModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
    }
  });

  modalState = {
    root: modal,
    visual,
    meta,
    title,
    description,
    details,
  };

  return modalState;
}

function fillModalDetails(listEl, items) {
  listEl.innerHTML = items
    .map((item) => `<li><strong>${escapeHTML(item.label)}:</strong> ${escapeHTML(item.value)}</li>`)
    .join("");
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

  let dimensionsText = "Chargement...";
  const details = [
    { label: "Type", value: selected.type === "video" ? "Vidéo" : "Image" },
    { label: "Media", value: `${safeIndex + 1}/${medias.length}` },
    { label: "Dimensions", value: dimensionsText },
  ];

  modal.meta.textContent = project.category || "Creation";
  modal.title.textContent = project.title || "Creation sans titre";
  modal.description.textContent = project.description || "Aucune description fournie.";
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
      { label: "Type", value: selected.type === "video" ? "Vidéo" : "Image" },
      { label: "Media", value: `${safeIndex + 1}/${medias.length}` },
      { label: "Dimensions", value: "Indisponible" },
    ]);
    modal.visual.innerHTML = '<p class="project-description">Media indisponible.</p>';
    modal.root.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
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
      dimensionsText = `${video.videoWidth} × ${video.videoHeight}px`;
      fillModalDetails(modal.details, [
        { label: "Type", value: "Vidéo" },
        { label: "Media", value: `${safeIndex + 1}/${medias.length}` },
        { label: "Dimensions", value: dimensionsText },
        { label: "Durée", value: `${Math.round(video.duration || 0)}s` },
      ]);
    });

    modal.visual.appendChild(video);
    video.play().catch(() => {});
  } else {
    const img = document.createElement("img");
    img.src = mediaSrc;
    img.alt = project.title || "Projet";
    img.className = "project-modal-media";

    img.addEventListener("load", () => {
      dimensionsText = `${img.naturalWidth} × ${img.naturalHeight}px`;
      fillModalDetails(modal.details, [
        { label: "Type", value: "Image" },
        { label: "Media", value: `${safeIndex + 1}/${medias.length}` },
        { label: "Dimensions", value: dimensionsText },
      ]);
    });

    modal.visual.appendChild(img);
  }

  modal.root.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  if (!modalState) {
    return;
  }

  modalState.root.setAttribute("hidden", "");
  modalState.visual.querySelectorAll("video").forEach((video) => video.pause());
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

    card.addEventListener("dblclick", () => {
      const projectIndex = Number(card.dataset.projectIndex);
      if (Number.isNaN(projectIndex)) {
        return;
      }

      void openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
      stopCardPreview(card);
    });

    card.addEventListener("keydown", (event) => {
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
}


function setupProjectsToggle() {
  projectsToggle?.addEventListener("click", () => {
    if (!renderedProjects.length) {
      return;
    }

    visibleProjectCount = Math.min(renderedProjects.length, visibleProjectCount + PROJECT_STEP_COUNT);
    renderProjects(renderedProjects, true);
  });

  projectsToggleLess?.addEventListener("click", () => {
    if (!renderedProjects.length) {
      return;
    }

    visibleProjectCount = PROJECT_INITIAL_COUNT;
    renderProjects(renderedProjects, true);
  });
}

function renderTestimonials(preservePagination = false) {
  if (!testimonialsGrid || !testimonialsToggle) {
    return;
  }

  if (!preservePagination) {
    visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
  }

  const all = loadTestimonials();
  const visibleTestimonials = all.filter((item) => !item.hiddenOnPortfolio);
  const shown = visibleTestimonials.slice(0, visibleTestimonialCount);

  if (!shown.length) {
    testimonialsGrid.innerHTML = '<p class="testimonial-empty">Aucun temoignage disponible.</p>';
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
        <p class="testimonial-stars" aria-label="${item.rating} sur 5">${starString(item.rating)}</p>
        <p class="testimonial-message">${escapeHTML(item.message)}</p>
        <p class="testimonial-author">${escapeHTML(item.name)}</p>
      </article>
    `
    )
    .join("");

  testimonialsToggle.hidden = visibleTestimonials.length <= visibleTestimonialCount;
  testimonialsToggle.textContent = "Voir plus";

  if (testimonialsToggleLess) {
    testimonialsToggleLess.hidden = visibleTestimonialCount <= TESTIMONIAL_INITIAL_COUNT;
    testimonialsToggleLess.textContent = "Voir moins";
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
    importStatus.textContent = "Erreur d’import: verifiez data.json";
    return;
  }

  if (usingAdminProjects) {
    importStatus.textContent = `${adminProjects.length} projet(s); Double cliquez pour voir en dimensions reelles`;
    return;
  }

  if (catalogError) {
    importStatus.textContent = "Catalogue indisponible.";
    return;
  }

  importStatus.textContent = `${catalogProjects.length} projet(s) depuis data.json`;
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

  testimonialForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(testimonialForm);
    const name = String(data.get("name") || "").trim();
    const rating = Number(data.get("rating"));
    const message = String(data.get("message") || "").trim();

    if (!name) {
      testimonialStatus.textContent = "Le nom est obligatoire.";
      return;
    }

    if (!message) {
      testimonialStatus.textContent = "Le temoignage est obligatoire.";
      return;
    }

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      testimonialStatus.textContent = "Veuillez choisir une note valide.";
      return;
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
    testimonialStatus.textContent = "Merci, votre temoignage a ete publie.";
    visibleTestimonialCount = TESTIMONIAL_INITIAL_COUNT;
    renderTestimonials();
  });

  testimonialsToggle?.addEventListener("click", () => {
    const total = loadTestimonials().filter((item) => !item.hiddenOnPortfolio).length;
    visibleTestimonialCount = Math.min(total, visibleTestimonialCount + TESTIMONIAL_STEP_COUNT);
    renderTestimonials(true);
  });

  testimonialsToggleLess?.addEventListener("click", () => {
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

  const choiceLabel = choice === "system"
    ? `Systeme (${resolved === "dark" ? "Sombre" : "Clair"})`
    : choice === "dark"
      ? "Sombre"
      : "Clair";

  themeToggle.textContent = "Theme";
  themeToggle.title = `Mode actuel: ${choiceLabel}`;
  themeToggle.setAttribute("aria-label", `Mode actuel: ${choiceLabel}`);
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

function setupThemeSwitcher() {
  if (!themeToggle || !themeMenu || !themeOptions.length) {
    return;
  }

  const initialChoice = getStoredThemeChoice();
  applyTheme(initialChoice);

  themeToggle.addEventListener("click", () => {
    if (themeMenu.hidden) {
      openThemeMenu();
    } else {
      closeThemeMenu();
    }
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
});

window.addEventListener("focus", () => {
  importProjects();
  renderTestimonials();
  renderProofProjectCount();
});

window.addEventListener("DOMContentLoaded", () => {
  incrementPortfolioVisits();
  renderProofProjectCount();
  ensureTestimonialsSeeded();
  setupThemeSwitcher();
  setupScrollReveal();
  setupActiveNav();
  setupWhatsappWidget();
  setupProjectsToggle();
  setupTestimonialForm();
  setupContactForm();
  renderTestimonials();
  importProjects();
});

