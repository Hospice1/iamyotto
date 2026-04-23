const crypto = require("crypto");
const { put } = require("@vercel/blob");

const MAX_UPLOAD_BYTES = 3800000;
const MEDIA_BLOB_TOKEN = process.env.BLOB_MEDIA_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
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

function parseDataUrl(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const match = raw.match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) {
    return null;
  }

  const mimeType = String(match[1] || "application/octet-stream").toLowerCase();
  const buffer = Buffer.from(String(match[2] || ""), "base64");
  return {
    mimeType,
    buffer,
  };
}

function extensionFromMime(mimeType, mediaType) {
  const mime = String(mimeType || "").toLowerCase();
  if (mime.includes("webp")) {
    return ".webp";
  }
  if (mime.includes("png")) {
    return ".png";
  }
  if (mime.includes("jpeg") || mime.includes("jpg")) {
    return ".jpg";
  }
  if (mime.includes("gif")) {
    return ".gif";
  }
  if (mime.includes("mp4")) {
    return ".mp4";
  }
  if (mime.includes("webm")) {
    return ".webm";
  }

  return mediaType === "video" ? ".mp4" : ".jpg";
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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      error: "Method not allowed",
    });
  }

  try {
    const body = await parseJsonBody(req);
    const mediaType = String(body?.mediaType || "").toLowerCase() === "video" ? "video" : "image";
    const fileNameInput = sanitizeFileName(body?.fileName || `${mediaType}-${Date.now()}`);
    const parsedData = parseDataUrl(body?.dataUrl || "");

    if (!parsedData || !parsedData.buffer.length) {
      return sendJson(res, 400, {
        error: "Invalid media payload",
      });
    }

    if (parsedData.buffer.length > MAX_UPLOAD_BYTES) {
      return sendJson(res, 413, {
        error: "Media too large for cloud upload (max 3.8 MB)",
      });
    }

    const hasExtension = /\.[a-z0-9]{2,5}$/i.test(fileNameInput);
    const extension = hasExtension
      ? ""
      : extensionFromMime(body?.mimeType || parsedData.mimeType, mediaType);

    const randomId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : crypto.randomBytes(4).toString("hex");

    const pathname = `media/${Date.now()}-${randomId}-${fileNameInput}${extension}`;
    const mimeType = String(body?.mimeType || parsedData.mimeType || "application/octet-stream").toLowerCase();

    const blob = await put(pathname, parsedData.buffer, {
      access: "public",
      token: MEDIA_BLOB_TOKEN,
      contentType: mimeType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });

    return sendJson(res, 200, {
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl,
    });
  } catch (error) {
    console.error("upload-media failed", error);
    return sendJson(res, 500, {
      error: "Unable to upload media",
    });
  }
};
