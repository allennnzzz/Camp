/* ==========================================================
   PÁGINAS "PRÓXIMAMENTE"
   Edita solo esta lista. Vacía ([]) = todas las páginas abiertas.
   Nombres sin .html: "merch", "contactos", "fotos", "enlaces"...
   ========================================================== */
const PROXIMAMENTE = ["merch", "contactos", "fotos"];

(() => {
  /* --- estilos (van incluidos aquí para no tocar tu CSS) --- */
  const st = document.createElement("style");
  st.textContent = `
    nav a.soon-link { opacity: .5; }
    nav a.soon-link::after {
      content: "pronto"; margin-left: 6px; padding: 2px 7px; border-radius: 999px; vertical-align: middle;
      background: rgba(11, 21, 53, .1); font: 500 9px "IBM Plex Mono", monospace; letter-spacing: .08em; text-transform: uppercase;
    }
    .soon-link { cursor: default; }
    .toast-soon {
      position: fixed; z-index: 120; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 28px);
      transform: translate(-50%, 24px); opacity: 0; pointer-events: none; transition: opacity .35s, transform .45s cubic-bezier(.2, .7, .2, 1);
      padding: 14px 24px; border-radius: 999px; white-space: nowrap;
      background: rgba(11, 21, 53, .92); color: #F4F1EA; font: 500 15px "Inter Tight", system-ui, sans-serif;
      -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); box-shadow: 0 20px 40px -16px rgba(11, 21, 53, .6);
    }
    .toast-soon.on { opacity: 1; transform: translate(-50%, 0); }
    .lock {
      position: fixed; inset: 0; z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
      padding: 24px; text-align: center; background: #0B1535; color: #F4F1EA;
    }
    .lock h1 { margin: 0; font: 600 clamp(48px, 11vw, 140px)/.9 "Inter Tight", system-ui, sans-serif; letter-spacing: -.055em; }
    .lock h1 em { font-family: "Instrument Serif", Georgia, serif; font-style: italic; font-weight: 400; color: #f0b296; letter-spacing: -.01em; }
    .lock .m { font: 500 11px "IBM Plex Mono", monospace; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }
    .lock a { padding: 14px 28px; border-radius: 999px; background: #F4F1EA; color: #0B1535; text-decoration: none; font: 500 15px "Inter Tight", system-ui, sans-serif; }
  `;
  document.head.append(st);

  const pag = h => (h || "").split(/[?#]/)[0].split("/").pop().replace(".html", "");
  const esPronto = a => PROXIMAMENTE.includes(pag(a.getAttribute("href")));

  /* --- marca los enlaces bloqueados (barra, tarjetas, botones...) --- */
  document.querySelectorAll("a[href]").forEach(a => { if (esPronto(a)) a.classList.add("soon-link"); });

  /* --- al tocarlos: no navega y muestra el aviso --- */
  let toast, timer;
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || !esPronto(a)) return;
    e.preventDefault();
    const n = pag(a.getAttribute("href"));
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-soon";
      toast.setAttribute("role", "status");
      document.body.append(toast);
    }
    toast.textContent = n.charAt(0).toUpperCase() + n.slice(1) + " · Próximamente";
    toast.classList.add("on");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("on"), 2600);
  });

  /* --- si abren la página bloqueada directo (enlace guardado o compartido) --- */
  if (PROXIMAMENTE.includes(pag(location.pathname))) {
    const l = document.createElement("div");
    l.className = "lock";
    l.innerHTML = '<span class="m">Próximamente</span><h1>Esta página<br><em>llega pronto.</em></h1><a href="index.html">Volver al inicio</a>';
    document.body.append(l);
    document.documentElement.style.overflow = "hidden";
  }
})();