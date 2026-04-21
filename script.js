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

async function loadCatalogData() {
  const response = await fetch("data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Impossible de charger data.json");
  }
  return response.json();
}

function normalizeProject(item) {
  const firstImage = Array.isArray(item?.images)
    ? item.images.find((entry) => Boolean(entry))
    : item?.image;

  const category = String(item?.category || item?.categorie || "Creation").trim();
  const title = String(item?.titre || item?.title || "Creation sans titre").trim();
  const description = String(item?.description || "").trim();

  return {
    title: title || "Creation sans titre",
    category: category || "Creation",
    description,
    image: String(firstImage || "assets/project-01.jpg"),
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

function renderProjects(projects) {
  if (!projectGrid) {
    return;
  }

  if (!projects.length) {
    projectGrid.innerHTML = '<p class="project-description">Aucune creation disponible pour le moment.</p>';
    return;
  }

  projectGrid.innerHTML = projects
    .map((project) => {
      const description = String(project.description || "").trim();
      const descriptionMarkup = description
        ? `<p class="project-description">${escapeHTML(description)}</p>`
        : "";

      return `
      <article class="project-card">
        <img class="project-thumb" src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)}" loading="lazy" />
        <div class="project-content">
          <p class="project-meta">${escapeHTML(project.category)}</p>
          <h3 class="project-title">${escapeHTML(project.title)}</h3>
          ${descriptionMarkup}
        </div>
      </article>
    `;
    })
    .join("");
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
  const mergedProjects = [...adminProjects, ...catalogProjects];
  renderProjects(mergedProjects);

  if (!importStatus) {
    return;
  }

  if (catalogError && !mergedProjects.length) {
    importStatus.textContent = "Erreur d’import: verifiez data.json";
    return;
  }

  if (catalogError) {
    importStatus.textContent = `${adminProjects.length} creation(s) admin affichee(s)`;
    return;
  }

  importStatus.textContent = `${mergedProjects.length} projet(s) affiches dont ${adminProjects.length} depuis l'admin`;
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




