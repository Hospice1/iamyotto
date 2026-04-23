(function () {
  const ADMIN_PROJECTS_KEY = "iamyotto_admin_projects";
  const TESTIMONIALS_KEY = "iamyotto_testimonials";
  const CONTACT_MESSAGES_KEY = "iamyotto_contact_messages";
  const DASHBOARD_PROJECT_COUNT_KEY = "iamyotto_dashboard_project_count";
  const PORTFOLIO_VISITS_KEY = "iamyotto_portfolio_visits";
  const ABOUT_PROFILE_KEY = "iamyotto_about_profile";
  const ABOUT_STORY_KEY = "iamyotto_about_story";

  const SYNC_META_KEY = "iamyotto_sync_updated_at";
  const SYNC_ENDPOINT = "/api/sync-state";
  const UPLOAD_ENDPOINT = "/api/upload-media";
  const MAX_SERVER_UPLOAD_BYTES = 3800000;

  let pushTimer = null;
  let pushChain = Promise.resolve();

  function toSafeInt(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.max(0, Math.floor(parsed));
  }

  function parseJSON(raw, fallback) {
    if (typeof raw !== "string" || !raw.trim()) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function readSyncMeta() {
    return toSafeInt(localStorage.getItem(SYNC_META_KEY), 0);
  }

  function writeSyncMeta(updatedAt) {
    localStorage.setItem(SYNC_META_KEY, String(toSafeInt(updatedAt, 0)));
  }

  function readArrayIfPresent(storageKey) {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) {
      return undefined;
    }

    const parsed = parseJSON(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function readObjectIfPresent(storageKey) {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) {
      return undefined;
    }

    const parsed = parseJSON(raw, {});
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  }

  function readAboutStoryFromLocal() {
    const raw = localStorage.getItem(ABOUT_STORY_KEY);
    if (raw === null) {
      return undefined;
    }

    const parsed = parseJSON(raw, raw);
    if (typeof parsed === "string") {
      const safe = parsed.trim();
      return safe || undefined;
    }

    if (parsed && typeof parsed.story === "string") {
      const safe = String(parsed.story).trim();
      return safe || undefined;
    }

    const fallback = String(raw || "").trim();
    return fallback || undefined;
  }

  function writeAboutStoryToLocal(storyText) {
    localStorage.setItem(ABOUT_STORY_KEY, JSON.stringify(String(storyText || "")));
  }

  function buildSharedStateSnapshot() {
    const snapshot = {};

    const projects = readArrayIfPresent(ADMIN_PROJECTS_KEY);
    if (Array.isArray(projects)) {
      snapshot.projects = projects;
    }

    const testimonials = readArrayIfPresent(TESTIMONIALS_KEY);
    if (Array.isArray(testimonials)) {
      snapshot.testimonials = testimonials;
    }

    const contactMessages = readArrayIfPresent(CONTACT_MESSAGES_KEY);
    if (Array.isArray(contactMessages)) {
      snapshot.contactMessages = contactMessages;
    }

    if (localStorage.getItem(DASHBOARD_PROJECT_COUNT_KEY) !== null) {
      snapshot.dashboardProjectCount = toSafeInt(localStorage.getItem(DASHBOARD_PROJECT_COUNT_KEY), 100);
    }

    if (localStorage.getItem(PORTFOLIO_VISITS_KEY) !== null) {
      snapshot.portfolioVisits = toSafeInt(localStorage.getItem(PORTFOLIO_VISITS_KEY), 0);
    }

    const aboutProfile = readObjectIfPresent(ABOUT_PROFILE_KEY);
    if (aboutProfile && typeof aboutProfile === "object") {
      snapshot.aboutProfile = aboutProfile;
    }

    const aboutStory = readAboutStoryFromLocal();
    if (typeof aboutStory === "string" && aboutStory.trim()) {
      snapshot.aboutStory = aboutStory;
    }

    return snapshot;
  }

  function applySharedStateSnapshot(state) {
    if (!state || typeof state !== "object") {
      return;
    }

    if (Array.isArray(state.projects)) {
      localStorage.setItem(ADMIN_PROJECTS_KEY, JSON.stringify(state.projects));
    }

    if (Array.isArray(state.testimonials)) {
      localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(state.testimonials));
    }

    if (Array.isArray(state.contactMessages)) {
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(state.contactMessages));
    }

    if (typeof state.dashboardProjectCount !== "undefined") {
      localStorage.setItem(
        DASHBOARD_PROJECT_COUNT_KEY,
        String(toSafeInt(state.dashboardProjectCount, 100))
      );
    }

    if (typeof state.portfolioVisits !== "undefined") {
      localStorage.setItem(
        PORTFOLIO_VISITS_KEY,
        String(toSafeInt(state.portfolioVisits, 0))
      );
    }

    if (state.aboutProfile && typeof state.aboutProfile === "object") {
      localStorage.setItem(ABOUT_PROFILE_KEY, JSON.stringify(state.aboutProfile));
    }

    if (typeof state.aboutStory === "string" && state.aboutStory.trim()) {
      writeAboutStoryToLocal(state.aboutStory);
    }
  }

  function mergeUniqueArrays(primary, secondary) {
    const merged = [];
    const seen = new Set();

    [primary, secondary].forEach((list) => {
      if (!Array.isArray(list)) {
        return;
      }

      list.forEach((item) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
        merged.push(item);
      });
    });

    return merged;
  }

  function isLikelyCatalogSeed(project) {
    const ref = String(project?.catalogRef || "").trim().toLowerCase();
    if (ref.startsWith("catalog:") || ref.startsWith("whatsapp:")) {
      return true;
    }

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

    return isLegacySeed;
  }

  function hasCustomProjects(projects) {
    if (!Array.isArray(projects) || !projects.length) {
      return false;
    }

    return projects.some((project) => !isLikelyCatalogSeed(project));
  }

  function hasNonEmptyAboutStory(state) {
    return typeof state?.aboutStory === "string" && state.aboutStory.trim().length > 0;
  }

  async function requestRemoteState() {
    const response = await fetch(`${SYNC_ENDPOINT}?ts=${Date.now()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Cloud sync GET failed (${response.status})`);
    }

    const payload = await response.json().catch(() => ({}));
    const updatedAt = toSafeInt(payload?.updatedAt, 0);
    const state = payload && typeof payload.state === "object" && payload.state
      ? payload.state
      : {};

    return {
      updatedAt,
      state,
    };
  }

  async function pullLatestToLocal(options = {}) {
    const force = Boolean(options.force);
    const remote = await requestRemoteState();
    const localMeta = readSyncMeta();

    if (!force && remote.updatedAt <= localMeta) {
      return false;
    }

    applySharedStateSnapshot(remote.state);
    writeSyncMeta(remote.updatedAt);

    window.dispatchEvent(new CustomEvent("iamyotto:cloud-sync-applied", {
      detail: { updatedAt: remote.updatedAt },
    }));

    return true;
  }

  async function pushLocalState(options = {}) {
    const snapshot = options.state && typeof options.state === "object"
      ? options.state
      : buildSharedStateSnapshot();

    if (!snapshot || !Object.keys(snapshot).length) {
      return false;
    }

    const baseUpdatedAt = typeof options.baseUpdatedAt === "number"
      ? toSafeInt(options.baseUpdatedAt, 0)
      : readSyncMeta();

    const updatedAt = typeof options.updatedAt === "number"
      ? toSafeInt(options.updatedAt, Date.now())
      : Date.now();

    const response = await fetch(SYNC_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        version: 1,
        baseUpdatedAt,
        updatedAt,
        state: snapshot,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (response.status === 409) {
      if (payload?.current && typeof payload.current.state === "object") {
        applySharedStateSnapshot(payload.current.state);
        writeSyncMeta(toSafeInt(payload.current.updatedAt, 0));
      }
      return false;
    }

    if (!response.ok) {
      throw new Error(payload?.error || `Cloud sync PUT failed (${response.status})`);
    }

    writeSyncMeta(updatedAt);
    return true;
  }

  function schedulePush(delay = 900) {
    const safeDelay = Math.max(120, Number(delay) || 900);

    if (pushTimer) {
      clearTimeout(pushTimer);
      pushTimer = null;
    }

    pushTimer = window.setTimeout(() => {
      pushTimer = null;
      pushChain = pushChain
        .then(() => pushLocalState())
        .catch((error) => {
          console.error("Cloud sync push failed", error);
        });
    }, safeDelay);

    return pushChain;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read blob"));
      reader.readAsDataURL(blob);
    });
  }

  function sanitizeFileName(fileName) {
    const compact = String(fileName || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "");

    return compact || "media";
  }

  function guessExtension(mediaType, mimeType) {
    const safeMime = String(mimeType || "").toLowerCase();
    if (safeMime.includes("webp")) {
      return ".webp";
    }
    if (safeMime.includes("png")) {
      return ".png";
    }
    if (safeMime.includes("jpeg") || safeMime.includes("jpg")) {
      return ".jpg";
    }
    if (safeMime.includes("mp4")) {
      return ".mp4";
    }
    if (safeMime.includes("webm")) {
      return ".webm";
    }

    return mediaType === "video" ? ".mp4" : ".jpg";
  }

  async function uploadBlob(blob, options = {}) {
    if (!(blob instanceof Blob)) {
      throw new Error("Invalid media blob");
    }

    if (blob.size > MAX_SERVER_UPLOAD_BYTES) {
      throw new Error("Media too large for cloud sync upload (max 3.8 MB)");
    }

    const mediaType = options.mediaType === "video" ? "video" : "image";
    const baseName = sanitizeFileName(options.fileName || `${mediaType}-${Date.now()}`);
    const withExtension = /\.[a-z0-9]{2,5}$/i.test(baseName)
      ? baseName
      : `${baseName}${guessExtension(mediaType, blob.type)}`;

    const dataUrl = await blobToDataUrl(blob);

    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        fileName: withExtension,
        mediaType,
        mimeType: blob.type || "application/octet-stream",
        dataUrl,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error || `Cloud media upload failed (${response.status})`);
    }

    return String(payload.url);
  }

  async function ensureRemoteSeededFromLocal() {
    const remote = await requestRemoteState();
    const remoteState = remote && typeof remote.state === "object" && remote.state
      ? remote.state
      : {};

    const localState = buildSharedStateSnapshot();
    const localProjects = Array.isArray(localState.projects) ? localState.projects : [];
    const remoteProjects = Array.isArray(remoteState.projects) ? remoteState.projects : [];

    const localHasCustom = hasCustomProjects(localProjects);
    const remoteHasCustom = hasCustomProjects(remoteProjects);

    const shouldPromoteLocal = (
      (remote.updatedAt === 0 && localProjects.length > 0)
      || (localHasCustom && !remoteHasCustom)
      || (localHasCustom && localProjects.length > remoteProjects.length)
      || (hasNonEmptyAboutStory(localState) && !hasNonEmptyAboutStory(remoteState))
    );

    if (!shouldPromoteLocal) {
      return false;
    }

    const mergedState = {
      ...remoteState,
      ...localState,
      projects: localProjects.length ? localProjects : remoteProjects,
      testimonials: mergeUniqueArrays(localState.testimonials, remoteState.testimonials),
      contactMessages: mergeUniqueArrays(localState.contactMessages, remoteState.contactMessages),
      portfolioVisits: Math.max(
        toSafeInt(localState.portfolioVisits, 0),
        toSafeInt(remoteState.portfolioVisits, 0)
      ),
    };

    if (!hasNonEmptyAboutStory(localState)) {
      delete mergedState.aboutStory;
    }

    const remoteUpdatedAt = toSafeInt(remote.updatedAt, 0);
    const nextUpdatedAt = Date.now();

    const pushed = await pushLocalState({
      state: mergedState,
      baseUpdatedAt: remoteUpdatedAt,
      updatedAt: nextUpdatedAt,
    });

    if (pushed) {
      writeSyncMeta(nextUpdatedAt);
    }

    return Boolean(pushed);
  }

  window.IamyottoSync = {
    buildSharedStateSnapshot,
    applySharedStateSnapshot,
    pullLatestToLocal,
    pushLocalState,
    schedulePush,
    uploadBlob,
    ensureRemoteSeededFromLocal,
  };
})();
