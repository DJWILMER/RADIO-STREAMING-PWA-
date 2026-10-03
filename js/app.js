(function () {
  "use strict";

  var STREAM_URL = "https://stream.zeno.fm/zzrxpmz2mv8uv";
  var API_URL = "https://api.zeno.fm/mounts/metadata/subscribe/zzrxpmz2mv8uv";
  var LOGO = "assets/img/logo.png";

  var SOCIALS = [
    { id: "facebook", label: "Facebook", handle: "DJ WILMER Oficial", url: "https://www.facebook.com/DJCHOCHOBARWILMER", icon: "i-facebook", cls: "soc-fb" },
    { id: "instagram", label: "Instagram", handle: "@djwilmer", url: "https://www.instagram.com/wilmerdelgadocieza", icon: "i-instagram", cls: "soc-ig" },
    { id: "tiktok", label: "TikTok", handle: "@djwilmer", url: "https://www.tiktok.com/@djchochobarwilmer", icon: "i-tiktok", cls: "soc-tt" },
    { id: "whatsapp", label: "WhatsApp", handle: "Escríbenos", url: "https://wa.me/51980634177", icon: "i-whatsapp", cls: "soc-wa" },
    { id: "web", label: "Sitio web", handle: "Visitar", url: "https://wilmerdelgadocieza.blogspot.com/", icon: "i-globe", cls: "soc-web" }
  ];

  var $ = function (id) { return document.getElementById(id); };

  var THEMES = [
    { id: "morado", label: "Morado", color: "#a855f7", css: "linear-gradient(135deg,#5f03f7,#a855f7,#ec4899)" },
    { id: "azul", label: "Azul", color: "#38bdf8", css: "linear-gradient(135deg,#2563eb,#38bdf8,#818cf8)" },
    { id: "verde", label: "Verde", color: "#34d399", css: "linear-gradient(135deg,#0d9488,#34d399,#a3e635)" },
    { id: "naranja", label: "Naranja", color: "#fb923c", css: "linear-gradient(135deg,#ea580c,#fb923c,#fbbf24)" },
    { id: "rojo", label: "Rojo", color: "#f87171", css: "linear-gradient(135deg,#dc2626,#f87171,#f59e0b)" },
    { id: "whatsapp", label: "WhatsApp", color: "#25d366", css: "linear-gradient(135deg,#128c7e,#25d366,#34d399)" },
    { id: "cian", label: "Cian", color: "#2dd4bf", css: "linear-gradient(135deg,#0ea5e9,#22d3ee,#2dd4bf)" }
  ];
  var THEME_KEY = "dw_theme";
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function renderThemes() {
    var grid = $("themeGrid");
    var current = document.body.getAttribute("data-theme") || "morado";
    var html = "";
    for (var i = 0; i < THEMES.length; i++) {
      var t = THEMES[i];
      html +=
        '<button type="button" class="theme-swatch' + (t.id === current ? " active" : "") +
        '" data-theme="' + t.id + '" title="' + t.label + '" aria-label="Tema ' + t.label +
        '" style="background:' + t.css + '"></button>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll(".theme-swatch").forEach(function (btn) {
      btn.addEventListener("click", function () { setTheme(btn.getAttribute("data-theme")); });
    });
  }

  function setTheme(id) {
    document.body.setAttribute("data-theme", id);
    try { localStorage.setItem(THEME_KEY, id); } catch (e) {}
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) { themeColorMeta.setAttribute("content", THEMES[i].color); break; }
    }
    renderThemes();
  }

  function initTheme() {
    var saved = "morado";
    try { saved = localStorage.getItem(THEME_KEY) || "morado"; } catch (e) {}
    var ok = false;
    for (var i = 0; i < THEMES.length; i++) { if (THEMES[i].id === saved) { ok = true; break; } }
    setTheme(ok ? saved : "morado");
  }

  var audio = $("audio");
  audio.src = STREAM_URL;
  audio.preload = "none";

  var state = {
    playing: false,
    volume: 0.9,
    muted: false,
    meta: null,
    lastTitle: ""
  };

  var coverWraps = [$("coverArt"), $("npArt")];

  function svg(name) {
    return '<svg class="ic"><use href="#' + name + '"/></svg>';
  }

  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 400);
    }, 2800);
  }

  function iconUrl(n) {
    var s = null;
    for (var i = 0; i < SOCIALS.length; i++) {
      if (SOCIALS[i].id === n) { s = SOCIALS[i]; break; }
    }
    return s ? s.icon : "i-globe";
  }

  /* ---------- Sociales ---------- */

  function renderSocials() {
    var grid = $("socialGrid");
    var footer = $("footerSocials");
    var drawer = $("drawerSocials");
    var gridHtml = "", iconsHtml = "";
    for (var i = 0; i < SOCIALS.length; i++) {
      var s = SOCIALS[i];
      gridHtml +=
        '<a class="social-card" href="' + s.url + '" target="_blank" rel="noopener noreferrer" data-track="' + s.id + '">' +
        '<span class="soc-ic ' + s.cls + '">' + svg(s.icon) + "</span>" +
        '<span class="meta"><span class="label">' + s.label + '</span><span class="handle">' + s.handle + "</span></span>" +
        "</a>";
      iconsHtml +=
        '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '" data-track="' + s.id + '">' +
        svg(s.icon) + "</a>";
    }
    grid.innerHTML = gridHtml;
    footer.innerHTML = iconsHtml;
    drawer.innerHTML = iconsHtml;
  }

  function wireSocialTracking() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-track]");
      if (a && window.gtag) { window.gtag("event", "social_click", { network: a.getAttribute("data-track") }); }
    });
  }

  /* ---------- Reproductor ---------- */

  function setPlaying(p) {
    state.playing = p;
    var card = document.querySelector(".player-card");
    if (p) { card.classList.add("playing"); } else { card.classList.remove("playing"); }
    $("playIcon").style.display = p ? "none" : "";
    $("pauseIcon").style.display = p ? "" : "none";
  }

  function togglePlay() {
    if (state.playing) {
      audio.pause();
      setPlaying(false);
    } else {
      var pr = audio.play();
      if (pr && pr.then) {
        pr.then(function () { setPlaying(true); }).catch(function () { toast("No se pudo reproducir el stream"); });
      } else {
        setPlaying(true);
      }
    }
  }

  function applyVolume() {
    if (state.muted) {
      audio.volume = 0;
      $("volIcon").innerHTML = '<use href="#i-mute"/>';
    } else {
      audio.volume = state.volume;
      $("volIcon").innerHTML = '<use href="#i-volume"/>';
    }
    $("volumeRange").value = state.muted ? 0 : state.volume;
  }

  audio.addEventListener("ended", function () { setPlaying(false); });
  audio.addEventListener("error", function () {
    setPlaying(false);
    toast("Error en la transmisión. Reintentando...");
    setTimeout(function () { audio.load(); }, 4000);
  });

  $("playBtn").addEventListener("click", togglePlay);
  $("muteBtn").addEventListener("click", function () {
    state.muted = !state.muted;
    applyVolume();
  });
  $("volumeRange").addEventListener("input", function () {
    state.muted = false;
    state.volume = parseFloat(this.value);
    applyVolume();
  });
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && !/INPUT|TEXTAREA/.test(e.target.tagName)) {
      e.preventDefault();
      togglePlay();
    }
  });

  /* ---------- Compartir ---------- */

  $("shareBtn").addEventListener("click", function () {
    var data = {
      title: "DJ WILMER · Radio en Vivo",
      text: "Mira el título o carátula de la canción que suena.",
      url: location.href
    };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else {
      var el = document.createElement("textarea");
      el.value = data.url;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand("copy"); toast("Enlace copiado"); } catch (err) { toast("Dale clic a la barra para copiar"); }
      el.remove();
    }
  });

  /* ---------- Metadatos ---------- */

  function splitTitle(t) {
    var s = String(t).replace(/\uFEFF/g, "").replace(/^\s*\d+\.\)\s*/, "");
    var dash = s.indexOf(" - ");
    if (dash > -1) {
      return { artist: s.slice(0, dash).trim(), track: s.slice(dash + 3).trim() };
    }
    return { artist: "DJ WILMER", track: s.trim() };
  }

  function setMeta(meta) {
    state.meta = meta;
    var title = meta.title || " ";
    if (title !== state.lastTitle) {
      state.lastTitle = title;
      var p = splitTitle(title);
      $("trackTitle").textContent = p.track || "En Vivo";
      $("trackSource").textContent = p.artist || "DJ WILMER";
      $("npTrack").textContent = title;
      if (title.trim()) { document.title = p.track + " · DJ WILMER"; }
    }
    if (meta.art) {
      coverWraps.forEach(function (img) {
        if (img.getAttribute("src") !== meta.art) { img.src = meta.art; }
      });
    } else {
      coverWraps.forEach(function (img) { img.src = LOGO; });
    }
    var n = parseInt(meta.listeners, 10);
    $("listenersNum").textContent = isNaN(n) ? "–" : n;
    $("footerStatus").textContent = meta.ulistener
      ? "Transmisión en vivo · " + meta.ulistener + " oyentes únicos"
      : "Transmisión en vivo 24/7";
    if (meta.history) { renderHistory(meta.history); }
  }

  coverWraps.forEach(function (img) {
    img.addEventListener("error", function () { img.src = LOGO; });
  });

  function fetchMeta() {
    fetch(API_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) { throw new Error("status " + r.status); }
        return r.json();
      })
      .then(function (data) {
        $("metaError").hidden = true;
        setMeta(data);
      })
      .catch(function (err) {
        $("metaError").hidden = false;
        if (state.lastTitle) { $("npTrack").textContent = state.lastTitle; }
      });
  }

  function renderHistory(history) {
    var list = $("historyList");
    if (!history || !history.length) {
      list.innerHTML = '<li class="history-loading">Sin historial disponible</li>';
      return;
    }
    var n = Math.min(history.length, 20);
    var html = "";
    for (var i = 0; i < n; i++) {
      var item = history[i];
      var t = item.title || item;
      if (typeof t !== "string") { t = item.artist + " - " + item.track; }
      var p = splitTitle(t);
      html +=
        '<li class="history-row">' +
        '<span class="history-num">' + (i + 1) + "</span>" +
        '<img class="history-art" src="' + (item.art || LOGO) + '" alt="" loading="lazy" onerror="this.src=\'' + LOGO + '\'">' +
        '<div class="history-text">' +
        '<span class="history-track">' + escapeHtml(p.track) + "</span>" +
        '<span class="history-artist">' + escapeHtml(p.artist) + "</span>" +
        "</div></li>";
    }
    list.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  $("historyRefresh").addEventListener("click", function () {
    $("historyList").innerHTML = '<li class="history-loading"><span class="spin"></span> Actualizando...</li>';
    fetchMeta();
    toast("Historial actualizado");
  });

  fetchMeta();
  setInterval(fetchMeta, 8000);

  /* ---------- Menú / Drawer ---------- */

  var drawer = $("drawer");
  var backdrop = $("drawerBackdrop");

  function openDrawer() {
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  $("menuBtn").addEventListener("click", openDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeDrawer); });

  /* ---------- Chat local ---------- */

  var CHAT_KEY = "dw_chat_v1";
  var NAME_KEY = "dw_chat_name";
  var chatBox = $("chatBox");
  var chatForm = $("chatForm");

  function loadChat() {
    try {
      var raw = localStorage.getItem(CHAT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveChat(messages) {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(messages)); } catch (e) {}
  }

  function timeLabel() {
    var d = new Date();
    return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  }

  function renderChat(messages) {
    chatBox.innerHTML = "";
    messages.forEach(function (m) {
      var cls = m.system ? "system" : m.mine ? "me" : "who";
      var html =
        '<div class="chat-msg ' + cls + '">' +
        (m.name ? '<span class="name">' + escapeHtml(m.name) + "</span>" : "") +
        '<span>' + escapeHtml(m.text) + "</span>" +
        '<span class="time">' + m.time + "</span></div>";
      chatBox.insertAdjacentHTML("beforeend", html);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function sendMessage() {
    var name = $("chatName").value.trim();
    var text = $("chatMessage").value.trim();
    if (!text) { return; }
    if (!name) { name = "Oyente"; }
    try { localStorage.setItem(NAME_KEY, name); } catch (e) {}
    var messages = loadChat();
    messages.push({ name: name, text: text, time: timeLabel(), mine: true });
    saveChat(messages);
    $("chatMessage").value = "";
    renderChat(messages);
    var rnd = Math.floor(Math.random() * 5);
    if (rnd === 0) {
      var replies = ["¡Qué buena canción!", "Grácias por escribir 🙌", "Saludos para ti desde DJ WILMER", "¡Estás en vivo!"];
      setTimeout(function () {
        var ms = loadChat();
        ms.push({ system: true, text: "DJ WILMER: " + replies[Math.floor(Math.random() * replies.length)] + " " + name, time: timeLabel() });
        saveChat(ms);
        renderChat(ms);
      }, 900);
    }
  }

  chatForm.addEventListener("submit", function (e) { e.preventDefault(); sendMessage(); });
  $("chatClear").addEventListener("click", function () {
    saveChat([{ system: true, text: "Chat iniciado", time: timeLabel() }]);
    renderChat(loadChat());
    toast("Chat limpio");
  });

  var savedName = "";
  try { savedName = localStorage.getItem(NAME_KEY) || ""; } catch (e) {}
  $("chatName").value = savedName;
  $("chatName").addEventListener("change", function () {
    try { localStorage.setItem(NAME_KEY, this.value.trim()); } catch (e) {}
  });

  var initial = loadChat();
  if (!initial.length) {
    initial.push({ system: true, text: "Bienvenido al chat de DJ WILMER. ¡Escríbenos!", time: timeLabel() });
  }
  saveChat(initial);
  renderChat(initial);

  /* ---------- PWA ---------- */

  var deferredPrompt = null;
  var installBtns = [$("installBtn"), $("installBtnDrawer")];

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    installBtns.forEach(function (b) { if (b) { b.hidden = false; } });
  });

  function doInstall() {
    if (!deferredPrompt) { return; }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
  }
  installBtns.forEach(function (b) { if (b) { b.addEventListener("click", doInstall); } });

  window.addEventListener("appinstalled", function () {
    installBtns.forEach(function (b) { if (b) { b.hidden = true; } });
    toast("¡DJ WILMER instalada!");
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  /* ---------- Init ---------- */

  renderSocials();
  wireSocialTracking();
  initTheme();
  applyVolume();
})();
