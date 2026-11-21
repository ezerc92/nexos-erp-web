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
  demo: "Buenos días. Me comunico para solicitar una demostración técnica de NEXOS-ERP para nuestra organización. Quedo a disposición para coordinar fecha y horario."
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

/* ---- licencia elegida desde las tarjetas ---- */
document.querySelectorAll("[data-plan]").forEach(b => b.addEventListener("click", () => { const s = document.querySelector('select[name="licencia"]'); if (s) s.value = b.dataset.plan; }));

/* ---- aparición suave de bloques ---- */
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const els = document.querySelectorAll(".mod, .cap, .escala, .plan, .etapas li, .faq details, .vitrina figure, .tms figure, .tms-puntos li");
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach(el => { el.classList.add("reveal"); io.observe(el); });
}

/* ---- formulario de requerimiento comercial ---- */
const form = $("#form"), estado = $("#estado"), btn = $("#enviar");
const REGLAS = {
  nombre: v => v.length >= 3 || "Ingrese nombre y apellido.",
  cargo: v => v.length >= 2 || "Indique su cargo o área.",
  razon_social: v => v.length >= 2 || "Indique la razón social.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Ingrese un correo electrónico válido.",
  telefono: v => v.replace(/\D/g, "").length >= 8 || "Ingrese un teléfono de contacto válido.",
  usuarios: v => (v !== "" && Number(v) >= 0) || "Complete la cantidad.",
  preventistas: v => (v !== "" && Number(v) >= 0) || "Complete la cantidad.",
  flota: v => (v !== "" && Number(v) >= 0) || "Complete la cantidad.",
  detalle: v => v.length >= 20 || "Describa el requerimiento (mínimo 20 caracteres)."
};
const ENVERG = ["usuarios", "preventistas", "flota"];
function marcar(input, msg) {
  const cont = ENVERG.includes(input.name) ? input.closest(".envergadura") : input.closest(".campo");
  if (!cont) return;
  cont.classList.toggle("err", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
  let m = cont.querySelector(".msg-err");
  if (ENVERG.includes(input.name)) { const errs = ENVERG.map(n => form.elements[n]).filter(i => REGLAS[i.name](i.value.trim()) !== true); cont.classList.toggle("err", errs.length > 0); msg = errs.length ? "Complete usuarios, preventistas y unidades de flota." : ""; }
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
    resumen: `REQUERIMIENTO COMERCIAL · NEXOS-ERP
Nombre y Apellido: ${f.nombre}
Cargo / Área: ${f.cargo}
Razón Social: ${f.razon_social}
Correo electrónico: ${f.email}
Teléfono: ${f.telefono}
Envergadura operativa: ${f.usuarios} usuarios · ${f.preventistas} preventistas · ${f.flota} unidades de flota
Licencia de interés: ${f.licencia || "A definir"}

Detalle del requerimiento:
${f.detalle}`
  };
}
form?.addEventListener("submit", async e => {
  e.preventDefault(); estado.hidden = true;
  if (form.elements.botcheck?.checked) return;
  if (!validar()) { mostrar("error", "Revise los campos señalados."); return; }
  const d = datos();
  btn.disabled = true; const txt = btn.textContent; btn.textContent = "Enviando…";
  try {
    if (WEB3FORMS_ACCESS_KEY) {
      const r = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, subject: `Requerimiento comercial NEXOS-ERP · ${d.razon_social}`, from_name: "Landing NEXOS-ERP", replyto: d.email,
          nombre: d.nombre, cargo: d.cargo, razon_social: d.razon_social, email: d.email, telefono: d.telefono, usuarios: d.usuarios, preventistas: d.preventistas, flota: d.flota,
          licencia: d.licencia || "A definir", detalle: d.detalle, botcheck: false }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false) throw new Error(j.message || "No se pudo registrar el requerimiento.");
      form.reset(); mostrar("ok", `Requerimiento recibido. Gracias, ${d.nombre.split(" ")[0]}: nuestro equipo comercial responderá a ${d.email} a la brevedad.`);
    } else if (EMAIL_COMERCIAL) {
      location.href = `mailto:${EMAIL_COMERCIAL}?subject=${encodeURIComponent("Requerimiento comercial NEXOS-ERP · " + d.razon_social)}&body=${encodeURIComponent(d.resumen)}`;
      mostrar("info", "Se abrió su cliente de correo con el requerimiento completo. Envíe el mensaje para finalizar la solicitud.");
    } else {
      window.open(waLink(d.resumen), "_blank", "noopener");
      mostrar("info", "Se abrió WhatsApp con el requerimiento completo. Envíe el mensaje para finalizar la solicitud.");
    }
  } catch (err) {
    mostrar("error", `${err.message || "No se pudo enviar el requerimiento."} Puede comunicarse directamente por WhatsApp al +54 341 323 1621.`);
  } finally { btn.disabled = false; btn.textContent = txt; }
});
