/* NEXOS ERP · Reel de prueba 18 s · 1080x1920
 * Todo se dibuja en un <canvas>: lo que se ve es exactamente lo que se graba.
 * draw(t) es una función pura del tiempo, así el mismo reel se puede exportar cuadro por cuadro. */
(() => {
  const W = 1080, H = 1920, DUR = 18, FPS = 30;
  const ESC = [[0, 3], [3, 7], [7, 11], [11, 15], [15, 18]];
  const C = { azul: "#1748b8", azul2: "#2f6bf0", verde: "#12a150", verde2: "#22c55e", tinta: "#0f1b33", blanco: "#ffffff", gris: "#a9b6d3" };
  const FT = '"Plus Jakarta Sans", "Inter", sans-serif', FB = '"Inter", system-ui, sans-serif';
  const IMGS = { pre: "/captura-preventista.png", mapa: "/captura-repartos-mapa.png", fle: "/captura-fletero.png", erp: "/captura-erp.png", comp: "/captura-comprobante.png" };
  const LOGO = new Path2D("M9 23V9l14 14V9");
  const WA = new Path2D("M16 3C9 3 3.3 8.6 3.3 15.6c0 2.3.6 4.5 1.8 6.4L3 29l7.2-2c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.6 12.7-12.6C28.7 8.6 23 3 16 3zm0 23.1c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.2 1.2-4.2-.3-.4c-1-1.6-1.6-3.5-1.6-5.4C5.3 9.8 10.1 5.1 16 5.1s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z");

  const cv = document.getElementById("reel"), ctx = cv.getContext("2d");
  const img = {};

  /* ---------- utilidades ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eOut = k => 1 - Math.pow(1 - clamp(k), 3);
  const eInOut = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const eBack = k => { k = clamp(k); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const prog = (t, a, d) => clamp((t - a) / d);

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function sombra(blur, oy, a = .45) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; }
  function sinSombra() { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
  function cubrir(im, x, y, w, h, zoom = 1, fx = .5, fy = 0) {
    // dibuja la imagen cubriendo el rectángulo, con zoom anclado en (fx, fy)
    const s = Math.max(w / im.width, h / im.height) * zoom, iw = im.width * s, ih = im.height * s;
    ctx.drawImage(im, x - (iw - w) * fx, y - (ih - h) * fy, iw, ih);
  }
  function lineas(txt, max, font) {
    ctx.font = font; const out = []; let l = "";
    for (const w of txt.split(" ")) { const p = l ? l + " " + w : w; if (ctx.measureText(p).width > max && l) { out.push(l); l = w; } else l = p; }
    if (l) out.push(l); return out;
  }

  /* ---------- piezas ---------- */
  function fondo(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d1d45"); g.addColorStop(.55, "#0a1532"); g.addColorStop(1, "#060d1f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glow = (x, y, r, col) => { const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); };
    glow(860 + Math.sin(t * .6) * 80, 300 + Math.cos(t * .5) * 60, 700, "rgba(47,107,240,.38)");
    glow(160 + Math.cos(t * .45) * 70, 1620 + Math.sin(t * .55) * 60, 720, "rgba(18,161,80,.30)");
    ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.lineWidth = 2; const s = 90, off = (t * 12) % s;
    ctx.beginPath(); for (let x = -s + off; x < W + s; x += s) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = -s + off; y < H + s; y += s) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
  }
  function barra(t) {
    const x0 = 44, gap = 10, n = ESC.length, w = (W - 2 * x0 - gap * (n - 1)) / n, y = 44;
    ESC.forEach(([a, b], i) => {
      const x = x0 + i * (w + gap), k = clamp((t - a) / (b - a));
      ctx.fillStyle = "rgba(255,255,255,.28)"; rr(x, y, w, 8, 4); ctx.fill();
      if (k > 0) { ctx.fillStyle = "#fff"; rr(x, y, Math.max(8, w * k), 8, 4); ctx.fill(); }
    });
  }
  function logo(x, y, s) {
    ctx.save(); const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, C.azul); g.addColorStop(1, C.azul2);
    ctx.fillStyle = g; rr(x, y, s, s, s * .28); ctx.fill();
    ctx.translate(x, y); ctx.scale(s / 32, s / 32); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(LOGO); ctx.restore();
  }
  function marca(x, y, s, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; logo(x, y, s);
    ctx.font = `800 ${s * .56}px ${FT}`; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.fillText("NEXOS", x + s * 1.28, y + s / 2);
    const wN = ctx.measureText("NEXOS ").width; ctx.fillStyle = C.verde2; ctx.fillText("ERP", x + s * 1.28 + wN, y + s / 2); ctx.restore();
  }
  function pastilla(txt, x, y, col = C.verde2) {
    ctx.font = `800 34px ${FB}`; const w = ctx.measureText(txt).width + 56;
    ctx.fillStyle = col === C.verde2 ? "rgba(34,197,94,.16)" : "rgba(47,107,240,.22)"; rr(x, y, w, 62, 31); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = col; ctx.textBaseline = "middle"; ctx.fillText(txt, x + 28, y + 32); return w;
  }
  function titulo(txt, t0, t, y, size = 76, max = 960) {
    const ls = lineas(txt, max, `800 ${size}px ${FT}`); ctx.textBaseline = "alphabetic";
    ls.forEach((l, i) => { const k = eOut(prog(t, t0 + i * .12, .5)); ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = "#fff"; ctx.font = `800 ${size}px ${FT}`; ctx.fillText(l, 60, y + i * size * 1.16 + (1 - k) * 40); ctx.restore(); });
    return y + ls.length * size * 1.16;
  }
  function chip(txt, x, y, t, t0, col = C.verde2) {
    const k = prog(t, t0, .45); if (k <= 0) return; const s = eBack(k);
    ctx.save(); ctx.font = `700 36px ${FB}`; const w = ctx.measureText(txt).width + 104;
    ctx.translate(x + w / 2, y + 40); ctx.scale(s, s); ctx.translate(-w / 2, -40); ctx.globalAlpha *= clamp(k * 2);
    sombra(30, 12, .4); ctx.fillStyle = "#fff"; rr(0, 0, w, 80, 40); ctx.fill(); sinSombra();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(42, 40, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(33, 40); ctx.lineTo(40, 47); ctx.lineTo(52, 33); ctx.stroke();
    ctx.fillStyle = C.tinta; ctx.textBaseline = "middle"; ctx.fillText(txt, 76, 42); ctx.restore();
  }
  function telefono(im, x, y, w, zoom = 1) {
    const h = w * 2532 / 1170 + 28, r = w * .13;
    sombra(70, 30, .6); ctx.fillStyle = "#0b1222"; rr(x, y, w + 28, h, r); ctx.fill(); sinSombra();
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); rr(x + 14, y + 14, w, h - 28, r - 12); ctx.clip(); cubrir(im, x + 14, y + 14, w, h - 28, zoom, .5, .25); ctx.restore();
    ctx.fillStyle = "#0b1222"; rr(x + (w + 28) * .34, y + 14, (w + 28) * .32, 30, 15); ctx.fill();
  }
  function escritorio(im, x, y, w, zoom = 1, fx = .5, fy = .3, titulo = "app.nexoserp.com.ar") {
    const ih = w * im.height / im.width, bar = 54, h = ih + bar;
    sombra(70, 30, .55); ctx.fillStyle = "#fff"; rr(x, y, w, h, 22); ctx.fill(); sinSombra();
    ctx.save(); rr(x, y, w, h, 22); ctx.clip();
    ctx.fillStyle = "#eef2f8"; ctx.fillRect(x, y, w, bar);
    ["#f87171", "#fbbf24", "#34d399"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 32 + i * 28, y + bar / 2, 9, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#fff"; rr(x + 130, y + 11, w - 160, bar - 22, 10); ctx.fill();
    ctx.fillStyle = "#5d6b85"; ctx.font = `600 22px ${FB}`; ctx.textBaseline = "middle"; ctx.fillText(titulo, x + 150, y + bar / 2 + 1);
    ctx.beginPath(); ctx.rect(x, y + bar, w, ih); ctx.clip(); cubrir(im, x, y + bar, w, ih, zoom, fx, fy); ctx.restore();
    return h;
  }

  /* ---------- escenas ---------- */
  function esc1(t) {
    // Gancho: Excel y papeles
    const papeles = [[110, 1180, -14, 0], [700, 1240, 11, .15], [380, 1460, -4, .3]];
    papeles.forEach(([x, y, r, d], i) => {
      const k = eOut(prog(t, .5 + d, .6)), sh = Math.sin(t * 9 + i) * (t > 1.6 ? 3 : 0);
      ctx.save(); ctx.globalAlpha *= k; ctx.translate(x + 150, y + 190 - (1 - k) * 120); ctx.rotate((r + sh) * Math.PI / 180);
      sombra(40, 18, .5); ctx.fillStyle = "#f8f5ec"; ctx.fillRect(-150, -190, 300, 380); sinSombra();
      ctx.strokeStyle = "rgba(15,27,51,.25)"; ctx.lineWidth = 4; for (let j = 0; j < 9; j++) { ctx.beginPath(); ctx.moveTo(-110, -130 + j * 34); ctx.lineTo(110 - (j % 3) * 40, -130 + j * 34); ctx.stroke(); }
      ctx.fillStyle = "rgba(220,38,38,.75)"; ctx.font = `700 34px ${FB}`; ctx.textBaseline = "middle"; ctx.fillText(["¿Stock?", "Deuda ???", "Ruta 3"][i], -105, 150); ctx.restore();
    });
    // planilla
    const k = eOut(prog(t, .25, .6));
    ctx.save(); ctx.globalAlpha *= k; ctx.translate(540, 1070 + (1 - k) * 100); ctx.rotate(-5 * Math.PI / 180 + Math.sin(t * 7) * (t > 1.6 ? .01 : 0));
    sombra(60, 24, .55); ctx.fillStyle = "#fff"; rr(-360, -230, 720, 460, 18); ctx.fill(); sinSombra();
    ctx.fillStyle = "#1d6f42"; rr(-360, -230, 720, 70, [18, 18, 0, 0]); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `800 34px ${FB}`; ctx.textBaseline = "middle"; ctx.fillText("Pedidos_FINAL_v7(2).xlsx", -330, -195);
    ctx.strokeStyle = "#d5dbe5"; ctx.lineWidth = 2;
    for (let i = 0; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(-360, -160 + i * 64); ctx.lineTo(360, -160 + i * 64); ctx.stroke(); }
    for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(-360 + j * 180, -160); ctx.lineTo(-360 + j * 180, 224); ctx.stroke(); }
    const celdas = ["#¡REF!", "#N/A", "#¡VALOR!", "#¡DIV/0!"]; ctx.font = `700 28px ${FB}`;
    celdas.forEach((c, i) => { if (t > .9 + i * .25) { ctx.fillStyle = "#dc2626"; ctx.fillText(c, -340 + (i % 4) * 180, -128 + (i + 1) * 64 + (i % 2) * 64); } });
    ctx.restore();
    // texto
    const L = [["¿Seguís manejando", "#fff"], ["tu distribuidora", "#fff"], ["o comercio con", "#fff"], ["Excel y papeles?", C.verde2]];
    L.forEach(([l, col], i) => {
      const kk = eOut(prog(t, .05 + i * .16, .45)); ctx.save(); ctx.globalAlpha *= kk; ctx.font = `800 100px ${FT}`; ctx.textBaseline = "alphabetic";
      const y = 300 + i * 118 + (1 - kk) * 50;
      if (i === 3) { const w = ctx.measureText(l).width, hk = eInOut(prog(t, 1.0, .5)); ctx.fillStyle = "rgba(34,197,94,.22)"; rr(52, y - 78, (w + 20) * hk, 100, 14); ctx.fill(); }
      ctx.fillStyle = col; ctx.fillText(l, 60, y); ctx.restore();
    });
  }
  function esc2(t) {
    pastilla("PREVENTA MÓVIL", 60, 170);
    titulo("Preventistas cargando pedidos en la calle con stock real.", .1, t, 330, 74);
    const k = eOut(prog(t, .2, .8)), w = 470, x = (W - w - 28) / 2;
    ctx.save(); ctx.globalAlpha *= k; telefono(img.pre, x, 620 + (1 - k) * 260, w, 1 + t * .045); ctx.restore();
    chip("Stock real", 60, 1150, t, 1.2);
    chip("Pedido enviado", 580, 1480, t, 2.1, C.azul2);
  }
  function esc3(t) {
    pastilla("LOGÍSTICA Y REPARTO", 60, 170, C.azul2);
    titulo("Hojas de ruta automáticas y rendición desde el celular del fletero.", .1, t, 330, 70);
    const k = eOut(prog(t, .15, .7));
    ctx.save(); ctx.globalAlpha *= k; escritorio(img.mapa, 50 + (1 - k) * 300, 640, 980, 1 + t * .05, .3, .4, "app.nexoserp.com.ar · Armado de reparto"); ctx.restore();
    const k2 = eOut(prog(t, .7, .7));
    ctx.save(); ctx.globalAlpha *= k2; telefono(img.fle, 650, 1060 + (1 - k2) * 400, 330, 1.02); ctx.restore();
    chip("Ruta por cercanía", 60, 1300, t, 1.5, C.azul2);
    chip("Rendición con arqueo", 60, 1420, t, 2.2);
  }
  function esc4(t) {
    pastilla("MOSTRADOR · BALANZA · ARCA", 60, 170);
    titulo("Modo Mostrador con balanza, caja diaria y facturación ARCA al instante.", .1, t, 330, 68);
    const k = eOut(prog(t, .15, .7));
    ctx.save(); ctx.globalAlpha *= k; escritorio(img.erp, 50, 650 + (1 - k) * 200, 980, 1 + t * .04, .2, .2, "app.nexoserp.com.ar · Facturación"); ctx.restore();
    const k2 = eOut(prog(t, .8, .7)), cw = 780, ch = cw * img.comp.height / img.comp.width;
    ctx.save(); ctx.globalAlpha *= k2; ctx.translate(250 + cw / 2 + (1 - k2) * 500, 1150 + ch / 2); ctx.rotate((4 - (1 - k2) * 10) * Math.PI / 180);
    sombra(70, 30, .6); ctx.fillStyle = "#fff"; ctx.fillRect(-cw / 2 - 10, -ch / 2 - 10, cw + 20, ch + 20); sinSombra();
    ctx.drawImage(img.comp, -cw / 2, -ch / 2, cw, ch); ctx.restore();
    chip("Balanza 20/21", 40, 1200, t, 1.5);
    chip("Caja diaria", 40, 1310, t, 1.9, C.azul2);
    chip("CAE aprobado", 40, 1420, t, 2.3);
  }
  function esc5(t) {
    const k = eBack(prog(t, .05, .55)), s = 230;
    ctx.save(); ctx.translate(W / 2, 560); ctx.scale(k, k); sombra(60, 20, .5); logo(-s / 2, -s / 2, s); sinSombra(); ctx.restore();
    const a = eOut(prog(t, .3, .5)); ctx.save(); ctx.globalAlpha *= a; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `800 128px ${FT}`; const wN = ctx.measureText("NEXOS ").width, wE = ctx.measureText("ERP").width, x0 = W / 2 - (wN + wE) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.fillText("NEXOS", x0, 860 + (1 - a) * 30); ctx.fillStyle = C.verde2; ctx.fillText("ERP", x0 + wN, 860 + (1 - a) * 30); ctx.restore();
    const b = eOut(prog(t, .55, .5)); ctx.save(); ctx.globalAlpha *= b; ctx.textAlign = "center";
    ctx.font = `600 50px ${FB}`; ctx.fillStyle = C.gris; ctx.fillText("100% en la nube · Sin servidores", W / 2, 960);
    ctx.font = `800 64px ${FT}`; ctx.fillStyle = "#fff"; ctx.fillText("nexoserp.com.ar", W / 2, 1070); ctx.restore();
    // botón
    const c = eBack(prog(t, .85, .5)); if (c > 0) {
      const pulso = 1 + Math.sin((t - 1.3) * 6) * .025 * clamp((t - 1.3) * 3), bw = 920, bh = 140;
      ctx.save(); ctx.translate(W / 2, 1250); ctx.scale(c * pulso, c * pulso);
      sombra(50, 18, .5); const g = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0); g.addColorStop(0, C.verde); g.addColorStop(1, C.verde2);
      ctx.fillStyle = g; rr(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fill(); sinSombra();
      ctx.save(); rr(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.clip(); const sx = ((t * 1.1) % 1.6) * 1500 - 900;
      const sg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(.5, "rgba(255,255,255,.35)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.restore();
      let fs = 46; ctx.font = `800 ${fs}px ${FB}`; while (ctx.measureText("Probá la demo en app.nexoserp.com.ar").width > bw - 90) { fs -= 1; ctx.font = `800 ${fs}px ${FB}`; }
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Probá la demo en app.nexoserp.com.ar", 0, 3); ctx.restore();
    }
    const d = eOut(prog(t, 1.2, .5)); ctx.save(); ctx.globalAlpha *= d; ctx.font = `700 58px ${FB}`; const num = "+54 9 341 323-1621", wn = ctx.measureText(num).width, ix = W / 2 - (wn + 100) / 2, y = 1450 + (1 - d) * 30;
    ctx.fillStyle = "#25d366"; ctx.beginPath(); ctx.arc(ix + 38, y, 42, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(ix + 38 - 26, y - 26); ctx.scale(52 / 32, 52 / 32); ctx.fillStyle = "#fff"; ctx.fill(WA); ctx.restore();
    ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.fillText(num, ix + 100, y + 2);
    ctx.font = `500 34px ${FB}`; ctx.fillStyle = C.gris; ctx.textAlign = "center"; ctx.fillText("Consultá por WhatsApp", W / 2, y + 80); ctx.restore();
  }
  const ESCENAS = [esc1, esc2, esc3, esc4, esc5];

  function draw(t) {
    t = clamp(t, 0, DUR - 1e-4);
    ctx.save(); ctx.textAlign = "left"; fondo(t);
    ESC.forEach(([a, b], i) => {
      if (t < a - .001 || t >= b + .35) return;
      const lt = t - a, fin = i < ESC.length - 1 ? clamp((t - (b - .3)) / .3) : 0, ini = i > 0 ? eOut(clamp(lt / .35)) : 1;
      if (t >= b && i < ESC.length - 1) return;
      ctx.save(); ctx.globalAlpha = ini * (1 - fin); ctx.translate(0, (1 - ini) * 40 - fin * 30); ESCENAS[i](lt); ctx.restore();
    });
    if (t < 15) marca(60, 96, 44, 1);
    barra(t); ctx.restore();
  }

  /* ---------- reproducción y grabación ---------- */
  let t0 = 0, pausa = false, tPausa = 0, rec = null;
  const $ = id => document.getElementById(id), estado = $("estado");
  const ahora = () => (performance.now() - t0) / 1000;
  function loop() {
    let t = pausa ? tPausa : ahora();
    if (t >= DUR) { if (rec) { draw(DUR); detener(); } else { t = DUR; tPausa = DUR; pausa = true; $("btnPausa").textContent = "▶ Reproducir"; } }
    draw(Math.min(t, DUR)); requestAnimationFrame(loop);
  }
  function reiniciar() { t0 = performance.now(); pausa = false; $("btnPausa").textContent = "❚❚ Pausa"; }

  const tipos = { webm: ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"], mp4: ["video/mp4;codecs=avc1.640028", "video/mp4;codecs=avc1", "video/mp4"] };
  const soporta = ext => typeof MediaRecorder !== "undefined" && tipos[ext].find(m => MediaRecorder.isTypeSupported(m));
  let partes = [], extRec = "webm";
  function grabar(ext) {
    const mime = soporta(ext); if (!mime) { estado.textContent = `Este navegador no puede grabar .${ext}. Usá Chrome o Edge actualizados.`; return; }
    let stream; try { stream = cv.captureStream(FPS); } catch (e) { estado.textContent = "No se pudo capturar el video: abrí esta página desde la web (no como archivo local)."; return; }
    partes = []; extRec = ext;
    rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
    rec.ondataavailable = e => e.data.size && partes.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(partes, { type: mime.split(";")[0] }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `nexos-erp-reel-18s.${extRec}`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000); rec = null; botones(false);
      estado.textContent = `Listo: se descargó nexos-erp-reel-18s.${extRec} (${(blob.size / 1048576).toFixed(1)} MB).`;
    };
    botones(true, ext); estado.textContent = "Grabando… dejá esta pestaña visible (18 s).";
    reiniciar(); rec.start(250);
  }
  function detener() { if (rec && rec.state === "recording") { setTimeout(() => rec && rec.state === "recording" && rec.stop(), 120); } }
  function botones(grabando, ext) {
    ["btnRepetir", "btnPausa", "btnWebm", "btnMp4"].forEach(id => $(id).disabled = grabando);
    const b = ext === "mp4" ? $("btnMp4") : $("btnWebm"); b.classList.toggle("rec", grabando);
    $("btnWebm").textContent = grabando && ext === "webm" ? "● Grabando…" : "● Grabar / Descargar Video (.webm)";
    $("btnMp4").textContent = grabando && ext === "mp4" ? "● Grabando…" : "● Grabar / Descargar Video (.mp4)";
  }

  $("btnRepetir").onclick = reiniciar;
  $("btnPausa").onclick = () => { if (pausa) { if (tPausa >= DUR) tPausa = 0; t0 = performance.now() - tPausa * 1000; pausa = false; $("btnPausa").textContent = "❚❚ Pausa"; } else { tPausa = ahora(); pausa = true; $("btnPausa").textContent = "▶ Reproducir"; } };
  $("btnFull").onclick = () => { const m = $("marco"); document.fullscreenElement ? document.exitFullscreen() : m.requestFullscreen?.(); };
  $("btnWebm").onclick = () => grabar("webm");
  $("btnMp4").onclick = () => grabar("mp4");
  if (soporta("mp4")) $("btnMp4").hidden = false;

  /* ---------- carga ---------- */
  const cargar = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(new Error("No se pudo cargar " + src)); i.src = src; });
  const listo = Promise.all([
    ...Object.entries(IMGS).map(([k, s]) => cargar(s).then(i => { img[k] = i; })),
    document.fonts.load(`800 80px "Plus Jakarta Sans"`), document.fonts.load(`700 40px "Inter"`), document.fonts.load(`600 40px "Inter"`), document.fonts.load(`500 40px "Inter"`)
  ]).then(() => document.fonts.ready);
  window.reel = { draw, listo, DUR, FPS, ESC };
  listo.then(() => {
    $("cargando").hidden = true;
    if (new URLSearchParams(location.search).has("render")) { draw(0); return; }
    reiniciar(); requestAnimationFrame(loop);
  }).catch(e => { $("cargando").textContent = e.message; });
})();
