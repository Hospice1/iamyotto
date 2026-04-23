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

  function readAboutStoryFromLocal() {
    const raw = localStorage.getItem(ABOUT_STORY_KEY);
    if (!raw) {
      return "";
    }

    const parsed = parseJSON(raw, raw);
    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed && typeof parsed.story === "string") {
      return parsed.story;
    }

    return String(raw);
  }

  function writeAboutStoryToLocal(storyText) {
    localStorage.setItem(ABOUT_STORY_KEY, JSON.stringify(String(storyText || "")));
  }

  function readSyncMeta() {
    return toSafeInt(localStorage.getItem(SYNC_META_KEY), 0);
  }

  function writeSyncMeta(updatedAt) {
    localStorage.setItem(SYNC_META_KEY, String(toSafeInt(updatedAt, 0)));
  }

  function buildSharedStateSnapshot() {
    return {
      projects: parseJSON(localStorage.getItem(ADMIN_PROJECTS_KEY), []),
      testimonials: parseJSON(localStorage.getItem(TESTIMONIALS_KEY), []),
      contactMessages: parseJSON(localStorage.getItem(CONTACT_MESSAGES_KEY), []),
      dashboardProjectCount: toSafeInt(localStorage.getItem(DASHBOARD_PROJECT_COUNT_KEY), 100),
      portfolioVisits: toSafeInt(localStorage.getItem(PORTFOLIO_VISITS_KEY), 0),
      aboutProfile: parseJSON(localStorage.getItem(ABOUT_PROFILE_KEY), {}),
      aboutStory: readAboutStoryFromLocal(),
    };
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

    if (typeof state.aboutStory === "string") {
      writeAboutStoryToLocal(state.aboutStory);
    }
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

    if (!localProjects.length || remoteProjects.length > 0) {
      return false;
    }

    const mergeUniqueArrays = (primary, secondary) => {
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
    };

    const mergedState = {
      ...remoteState,
      ...localState,
      projects: localProjects,
      testimonials: mergeUniqueArrays(localState.testimonials, remoteState.testimonials),
      contactMessages: mergeUniqueArrays(localState.contactMessages, remoteState.contactMessages),
      portfolioVisits: Math.max(
        toSafeInt(localState.portfolioVisits, 0),
        toSafeInt(remoteState.portfolioVisits, 0)
      ),
    };

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
