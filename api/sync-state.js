const { get, put } = require("@vercel/blob");

const STATE_PATHNAME = "sync/state.json";
const SYNC_BLOB_TOKEN = process.env.BLOB_SYNC_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function toSafeInt(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.floor(parsed));
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

async function readRemoteStatePayload() {
  const result = await get(STATE_PATHNAME, { access: "private", token: SYNC_BLOB_TOKEN });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return {
      version: 1,
      updatedAt: 0,
      state: {},
    };
  }

  const raw = await new Response(result.stream).text();
  const parsed = JSON.parse(raw);

  return {
    version: 1,
    updatedAt: toSafeInt(parsed?.updatedAt, 0),
    state: parsed && typeof parsed.state === "object" && parsed.state
      ? parsed.state
      : {},
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const payload = await readRemoteStatePayload();
      return sendJson(res, 200, payload);
    } catch (error) {
      console.error("sync-state GET failed", error);
      return sendJson(res, 500, {
        error: "Unable to read sync state",
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const body = await parseJsonBody(req);
      const nextUpdatedAt = toSafeInt(body?.updatedAt, 0);
      const baseUpdatedAt = toSafeInt(body?.baseUpdatedAt, 0);
      const nextState = body && typeof body.state === "object" && body.state
        ? body.state
        : null;

      if (!nextUpdatedAt || !nextState) {
        return sendJson(res, 400, {
          error: "Invalid sync payload",
        });
      }

      const current = await readRemoteStatePayload();
      const currentUpdatedAt = toSafeInt(current.updatedAt, 0);

      if (currentUpdatedAt > baseUpdatedAt) {
        return sendJson(res, 409, {
          error: "Sync conflict",
          current,
        });
      }

      const payloadToStore = {
        version: 1,
        updatedAt: nextUpdatedAt,
        state: nextState,
      };

      await put(STATE_PATHNAME, JSON.stringify(payloadToStore), {
        access: "private",
        token: SYNC_BLOB_TOKEN,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 1,
      });

      return sendJson(res, 200, {
        ok: true,
        updatedAt: nextUpdatedAt,
      });
    } catch (error) {
      console.error("sync-state PUT failed", error);
      return sendJson(res, 500, {
        error: "Unable to persist sync state",
      });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return sendJson(res, 405, {
    error: "Method not allowed",
  });
};
