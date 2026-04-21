const THEME_STORAGE_KEY = "iamyotto_theme_preference";
const ADMIN_PROJECTS_KEY = "iamyotto_admin_projects";
const TESTIMONIALS_KEY = "iamyotto_testimonials";

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

const testimonialsGrid = document.getElementById("testimonials-grid");
const testimonialsToggle = document.getElementById("testimonials-toggle");
const testimonialForm = document.getElementById("testimonial-form");
const testimonialStatus = document.getElementById("testimonial-status");

const themeToggle = document.getElementById("theme-toggle");
const themeMenu = document.getElementById("theme-menu");
const themeOptions = Array.from(document.querySelectorAll(".theme-option"));
const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

let testimonialsExpanded = false;
let renderedProjects = [];
const previewIntervals = new Map();
const touchPreviewTimeouts = new Map();
let modalState = null;
let touchTapState = {
  cardKey: "",
  at: 0,
};

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
    image: medias[0].src,
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

function loadAdminProjects() {
  try {
    const raw = localStorage.getItem(ADMIN_PROJECTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return normalizeProjectsArray(parsed);
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

function renderProjectMedia(media, projectTitle) {
  if (media.type === "video") {
    return `<video class="project-media" src="${escapeHTML(media.src)}" muted playsinline preload="metadata" loop></video>`;
  }

  return `<img class="project-media" src="${escapeHTML(media.src)}" alt="${escapeHTML(projectTitle)}" loading="lazy" />`;
}

function renderProjects(projects) {
  if (!projectGrid) {
    return;
  }

  renderedProjects = projects;

  previewIntervals.forEach((intervalId) => {
    clearInterval(intervalId);
  });
  previewIntervals.clear();

  if (!projects.length) {
    projectGrid.innerHTML = '<p class="project-description">Aucune creation disponible pour le moment.</p>';
    return;
  }

  projectGrid.innerHTML = projects
    .map((project, projectIndex) => {
      const medias = Array.isArray(project.medias) ? project.medias : [{ src: project.image, type: "image" }];
      const description = String(project.description || "").trim();
      const descriptionMarkup = description
        ? `<p class="project-description">${escapeHTML(description)}</p>`
        : "";

      const mediaMarkup = medias.map((media) => renderProjectMedia(media, project.title)).join("");
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

  setupProjectInteractions();
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

function openProjectModal(project, mediaIndex = 0) {
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

  if (selected.type === "video") {
    const video = document.createElement("video");
    video.src = selected.src;
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
    img.src = selected.src;
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

      openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
      stopCardPreview(card);
      touchTapState = { cardKey: "", at: 0 };
    });

    card.addEventListener("dblclick", () => {
      const projectIndex = Number(card.dataset.projectIndex);
      if (Number.isNaN(projectIndex)) {
        return;
      }

      openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
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

      openProjectModal(renderedProjects[projectIndex], Number(card.dataset.activeMedia || 0));
    });
  });
}

function renderTestimonials() {
  if (!testimonialsGrid || !testimonialsToggle) {
    return;
  }

  const all = loadTestimonials();
  const visibleTestimonials = all.filter((item) => !item.hiddenOnPortfolio);
  const baseVisibleCount = 5;
  const shouldShowToggle = visibleTestimonials.length > baseVisibleCount;
  const shown = testimonialsExpanded
    ? visibleTestimonials
    : visibleTestimonials.slice(0, baseVisibleCount);

  if (!shown.length) {
    testimonialsGrid.innerHTML = '<p class="testimonial-empty">Aucun temoignage disponible.</p>';
    testimonialsToggle.hidden = true;
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

  testimonialsToggle.hidden = !shouldShowToggle;
  testimonialsToggle.textContent = testimonialsExpanded ? "Voir moins" : "Voir plus";
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
    testimonialsExpanded = false;
    renderTestimonials();
  });

  testimonialsToggle?.addEventListener("click", () => {
    testimonialsExpanded = !testimonialsExpanded;
    renderTestimonials();
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

  const sectionIds = [...new Set(allLinks.map((link) => link.getAttribute("href").slice(1)))];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  function setActive(sectionId) {
    allLinks.forEach((link) => {
      const targetId = link.getAttribute("href").slice(1);
      link.classList.toggle("is-active", targetId === sectionId);
    });

    if (heroProjectsButton) {
      heroProjectsButton.classList.toggle("is-glass-active", sectionId === "projects");
    }
  }

  setActive("hero");

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        setActive(visible.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0.15, 0.35, 0.6],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

window.addEventListener("storage", (event) => {
  if (event.key === ADMIN_PROJECTS_KEY) {
    importProjects();
  }

  if (event.key === TESTIMONIALS_KEY) {
    renderTestimonials();
  }
});

window.addEventListener("focus", () => {
  importProjects();
  renderTestimonials();
});

window.addEventListener("DOMContentLoaded", () => {
  ensureTestimonialsSeeded();
  setupThemeSwitcher();
  setupScrollReveal();
  setupActiveNav();
  setupTestimonialForm();
  renderTestimonials();
  importProjects();
});

