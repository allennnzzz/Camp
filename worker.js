/* ==========================================================
   Worker de Hacedores
   - Sirve tu sitio estático (carpeta public/) mediante env.ASSETS
   - /api/gas  →  intermediario hacia Google Apps Script

   Configuración:
     vars (wrangler.jsonc):  ALLOWED_ORIGINS = https://tusitio.workers.dev,https://tudominio.com
     secrets (panel):        APPS_SCRIPT_URL = https://script.google.com/macros/s/XXXX/exec
                             CLAVE           = (opcional) texto largo secreto
   ========================================================== */

const MAX_BYTES = 8_000_000;   // tope por envío (las fotos ya llegan reducidas desde la web)

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });

function destino(env, search) {
  const u = new URL(env.APPS_SCRIPT_URL);
  if (search) new URLSearchParams(search).forEach((v, k) => u.searchParams.set(k, v));
  if (env.CLAVE) u.searchParams.set("k", env.CLAVE);      // Apps Script rechaza llamadas sin esta clave
  return u.toString();
}

/* Devuelve siempre JSON, aunque Google responda con una página de error */
async function responder(r) {
  const t = (await r.text()).trim();
  if (!t.startsWith("{") && !t.startsWith("[")) {
    return json({ ok: false, message: "El servidor de inscripciones devolvió un error. Intenta de nuevo en un momento." }, 502);
  }
  return new Response(t, {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

async function gas(request, env) {
  if (!env.APPS_SCRIPT_URL) return json({ ok: false, message: "Falta configurar APPS_SCRIPT_URL." }, 500);

  /* --- LECTURA (comentarios de Momentos) --- */
  if (request.method === "GET") {
    const r = await fetch(destino(env, new URL(request.url).search), { redirect: "follow" });
    return responder(r);
  }
  if (request.method !== "POST") return json({ ok: false }, 405);

  /* --- ESCRITURA (inscripción, pedido, comentario) --- */
  const permitidos = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const origen = request.headers.get("Origin") || "";
  if (permitidos.length && !permitidos.includes(origen)) {
    return json({ ok: false, message: "Origen no permitido." }, 403);
  }

  const largo = Number(request.headers.get("Content-Length") || 0);
  if (!largo) return json({ ok: false, message: "Solicitud vacía." }, 400);
  if (largo > MAX_BYTES) return json({ ok: false, message: "Los archivos adjuntos son demasiado grandes." }, 413);

  /* el cuerpo pasa tal cual, sin procesarlo (ahorra CPU con las imágenes en base64) */
  const r = await fetch(destino(env, ""), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: request.body,
    redirect: "follow"
  });
  return responder(r);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/gas") return gas(request, env);
    return env.ASSETS.fetch(request);                    // todo lo demás: tu sitio
  }
};