const ADMIN_PROJECTS_KEY = "iamyotto_admin_projects";
const TESTIMONIALS_KEY = "iamyotto_testimonials";
const ADMIN_SESSION_KEY = "iamyotto_admin_session";
const ADMIN_PASSWORD = "AZERTY1234";

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

const testimonialList = document.getElementById("testimonial-list");
const testimonialStatus = document.getElementById("testimonial-status");
const removeBadBtn = document.getElementById("remove-bad-testimonials");

function isAuthenticated() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
}

function lockAdmin() {
  if (adminApp) {
    adminApp.hidden = true;
  }
  if (loginGate) {
    loginGate.hidden = false;
  }
}

function unlockAdmin() {
  if (loginGate) {
    loginGate.hidden = true;
  }
  if (adminApp) {
    adminApp.hidden = false;
  }
  renderProjectList();
  renderTestimonialList();
}

function createProjectId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeProject(item) {
  const firstImage = Array.isArray(item?.images)
    ? item.images.find((entry) => Boolean(entry))
    : item?.image;

  const category = String(item?.category || item?.categorie || "Creation").trim();
  const title = String(item?.title || item?.titre || "Creation sans titre").trim();

  return {
    id: String(item?.id || createProjectId()),
    category: category || "Creation",
    title: title || "Creation sans titre",
    image: String(firstImage || "assets/project-01.jpg"),
    createdAt: item?.createdAt || new Date().toISOString(),
  };
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
      return !item?.id || !item?.title || !item?.category || item?.image !== normalizedItem.image;
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

function saveProjects(projects) {
  localStorage.setItem(ADMIN_PROJECTS_KEY, JSON.stringify(projects));
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
  const safe = Math.max(1, Math.min(5, Number(rating) || 5));
  return `${"★".repeat(safe)}${"☆".repeat(5 - safe)}`;
}

function isNegativeOrAbusive(testimonial) {
  const text = String(testimonial?.message || "").toLowerCase();
  const lowRating = Number(testimonial?.rating || 0) <= 2;
  const bannedPattern = /\b(nul|arnaque|insulte|idiot|stupide|con|merde|escroc|pourri|mauvais|honteux)\b/i;
  return lowRating || bannedPattern.test(text);
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
    .map(
      (project) => `
      <article class="admin-item">
        <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)}" loading="lazy" />
        <div class="admin-item-body">
          <p class="admin-category">${escapeHTML(project.category)}</p>
          <h3>${escapeHTML(project.title)}</h3>
          <button class="delete-btn" type="button" data-id="${escapeHTML(project.id)}">Supprimer</button>
        </div>
      </article>
    `
    )
    .join("");
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

function readImageAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image non lisible"));
    reader.readAsDataURL(file);
  });
}

loginForm?.addEventListener("submit", (event) => {
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
  unlockAdmin();
});

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  lockAdmin();
  if (loginStatus) {
    loginStatus.textContent = "Connexion requise.";
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const category = String(data.get("categorie") || "").trim();
  const title = String(data.get("titre") || "").trim();
  const files = Array.from(imageFilesInput?.files || []);

  if (!category || !title) {
    if (statusBox) {
      statusBox.textContent = "Categorie et titre sont obligatoires.";
    }
    return;
  }

  if (!files.length) {
    if (statusBox) {
      statusBox.textContent = "Ajoutez au moins une image.";
    }
    return;
  }

  let images;
  try {
    images = await Promise.all(files.map((file) => readImageAsDataURL(file)));
  } catch {
    if (statusBox) {
      statusBox.textContent = "Impossible de lire au moins une image.";
    }
    return;
  }

  const newProjects = images.map((image) => normalizeProject({
    category,
    title,
    image,
  }));

  const projects = [...newProjects, ...loadProjects()];
  saveProjects(projects);

  form.reset();
  if (imageFilesInput) {
    imageFilesInput.value = "";
  }

  if (statusBox) {
    statusBox.textContent = `${newProjects.length} creation(s) ajoutee(s). Elles sont visibles dans la section Projets du portfolio.`;
  }
  renderProjectList();
});

list?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("delete-btn")) {
    return;
  }

  const projectId = String(target.dataset.id || "").trim();
  if (!projectId) {
    return;
  }

  const projects = loadProjects();
  const filtered = projects.filter((item) => item.id !== projectId);
  if (filtered.length === projects.length) {
    return;
  }

  saveProjects(filtered);
  if (statusBox) {
    statusBox.textContent = "Creation supprimee.";
  }
  renderProjectList();
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
  const confirmed = window.confirm("Supprimer toutes les creations ajoutees depuis l'admin ?");
  if (!confirmed) {
    return;
  }

  saveProjects([]);
  if (statusBox) {
    statusBox.textContent = "Toutes les creations ont ete supprimees.";
  }
  renderProjectList();
});

window.addEventListener("DOMContentLoaded", () => {
  ensureTestimonialsSeeded();

  if (isAuthenticated()) {
    unlockAdmin();
  } else {
    lockAdmin();
  }
});

