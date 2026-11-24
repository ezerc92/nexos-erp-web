/* NEXOS-ERP · Landing corporativa
 * ---------------------------------------------------------------
 * CONFIGURACIÓN: completar antes de publicar.
 *  - WEB3FORMS_ACCESS_KEY: clave de https://web3forms.com (los requerimientos llegan al correo registrado allí).
 *  - EMAIL_COMERCIAL: casilla para el envío alternativo por correo (mailto) si no hay clave de Web3Forms.
 *  Si ambas quedan vacías, el formulario arma el requerimiento y lo abre en WhatsApp.
 * --------------------------------------------------------------- */
const WEB3FORMS_ACCESS_KEY = "";
const EMAIL_COMERCIAL = "";
const WHATSAPP = "5493413231621";

const MSG = {
  demo: "Hola, quiero solicitar una demo de NEXOS ERP para mi negocio.",
  pos: "Hola, quiero consultar por el plan Comercio / Almacén POS de NEXOS ERP (mostrador, balanza y caja).",
  estandar: "Hola, quiero consultar por el plan Distribuidora Estándar de NEXOS ERP.",
  full: "Hola, quiero consultar por el plan Full Distribuidora de NEXOS ERP.",
  medida: "Hola, quiero armar un plan personalizado de NEXOS ERP."
};
const $ = s => document.querySelector(s);
const waLink = texto => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

/* ---- enlaces de WhatsApp con mensaje formal ---- */
document.querySelectorAll(".js-wa").forEach(a => { a.href = waLink(MSG[a.dataset.msg] || MSG.demo); });

/* ---- año del pie ---- */
const anio = $("#anio"); if (anio) anio.textContent = String(new Date().getFullYear());

/* ---- menú móvil ---- */
const burger = $("#burger"), menu = $("#menu");
const cerrarMenu = () => { menu.classList.remove("abierto"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menú"); };
burger?.addEventListener("click", () => { const ab = !menu.classList.contains("abierto"); menu.classList.toggle("abierto", ab); burger.setAttribute("aria-expanded", String(ab)); burger.setAttribute("aria-label", ab ? "Cerrar menú" : "Abrir menú"); });
menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", cerrarMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });

/* ---- sombra del encabezado al desplazarse ---- */
const nav = $("#nav"); const sombra = () => nav?.classList.toggle("sombra", scrollY > 8); addEventListener("scroll", sombra, { passive: true }); sombra();

/* ---- aparición suave de bloques ---- */
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const els = document.querySelectorAll(".sol, .mod, .feat, .capi, .plan, .cloud-item, .faq details");
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach(el => { el.classList.add("reveal"); io.observe(el); });
}

/* ---- formulario de requerimiento comercial ---- */
const form = $("#form"), estado = $("#estado"), btn = $("#enviar");
const REGLAS = {
  nombre: v => v.length >= 3 || "Ingresá tu nombre y apellido.",
  razon_social: v => v.length >= 2 || "Indicá el nombre de tu empresa o comercio.",
  telefono: v => v.replace(/\D/g, "").length >= 8 || "Ingresá un teléfono válido.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Ingresá un correo electrónico válido.",
  rubro: v => v !== "" || "Elegí el tipo de negocio.",
  detalle: v => v.length >= 10 || "Contanos brevemente qué necesitás (mínimo 10 caracteres)."
};
function marcar(input, msg) {
  const cont = input.closest(".campo"); if (!cont) return;
  cont.classList.toggle("err", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
  let m = cont.querySelector(".msg-err");
  if (msg) { if (!m) { m = document.createElement("span"); m.className = "msg-err"; cont.appendChild(m); } m.textContent = msg; } else m?.remove();
}
function validar() {
  let primero = null;
  for (const [n, regla] of Object.entries(REGLAS)) {
    const i = form.elements[n], r = regla(i.value.trim()), msg = r === true ? "" : r;
    marcar(i, msg); if (msg && !primero) primero = i;
  }
  if (primero) primero.focus();
  return !primero;
}
form?.addEventListener("input", e => { const i = e.target; if (REGLAS[i.name] && (i.closest(".err") || i.getAttribute("aria-invalid") === "true")) { const r = REGLAS[i.name](i.value.trim()); marcar(i, r === true ? "" : r); } });
function mostrar(tipo, texto) { estado.hidden = false; estado.className = "form-estado " + tipo; estado.textContent = texto; }
function datos() {
  const f = Object.fromEntries(new FormData(form).entries());
  return {
    ...f,
    resumen: `CONSULTA COMERCIAL · NEXOS ERP
Nombre: ${f.nombre}
Empresa / comercio: ${f.razon_social}
Tipo de negocio: ${f.rubro}
Localidad: ${f.localidad || "-"}
Teléfono: ${f.telefono}
Correo: ${f.email}

Qué necesita:
${f.detalle}`
  };
}
form?.addEventListener("submit", async e => {
  e.preventDefault(); estado.hidden = true;
  if (form.elements.botcheck?.checked) return;
  if (!validar()) { mostrar("error", "Revisá los campos marcados."); return; }
  const d = datos();
  btn.disabled = true; const txt = btn.textContent; btn.textContent = "Enviando…";
  try {
    if (WEB3FORMS_ACCESS_KEY) {
      const r = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, subject: `Consulta comercial NEXOS ERP · ${d.razon_social}`, from_name: "Web nexoserp.com.ar", replyto: d.email,
          nombre: d.nombre, razon_social: d.razon_social, rubro: d.rubro, localidad: d.localidad || "", email: d.email, telefono: d.telefono, detalle: d.detalle, botcheck: false }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false) throw new Error(j.message || "No se pudo enviar la consulta.");
      form.reset(); mostrar("ok", `¡Gracias, ${d.nombre.split(" ")[0]}! Recibimos tu consulta y te respondemos a la brevedad.`);
    } else if (EMAIL_COMERCIAL) {
      location.href = `mailto:${EMAIL_COMERCIAL}?subject=${encodeURIComponent("Consulta comercial NEXOS ERP · " + d.razon_social)}&body=${encodeURIComponent(d.resumen)}`;
      mostrar("info", "Se abrió tu correo con la consulta completa. Envialo para terminar.");
    } else {
      window.open(waLink(d.resumen), "_blank", "noopener");
      mostrar("info", "Se abrió WhatsApp con tu consulta completa. Envialo para terminar.");
    }
  } catch (err) {
    mostrar("error", `${err.message || "No se pudo enviar la consulta."} Escribinos directo por WhatsApp al +54 341 323 1621.`);
  } finally { btn.disabled = false; btn.textContent = txt; }
});
