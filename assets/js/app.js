/* =========================================================================
   MAVADO_TV — App (SPA com hash routing, sem dependências)
   Todo o conteúdo vem de assets/js/data.js (editável pelo editor visual).
   Rotas: #/  ·  #/canal  ·  #/<jogo>  ·  #/<jogo>/<seção>[/<sub>]
   ========================================================================= */
(() => {
  "use strict";

  const D = window.MAVADO;
  const C = D.channel;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const main = $("#main");
  const IS_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */
  const esc = (s = "") =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ytId = (v) => {
    if (!v) return null;
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = String(v).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  };
  const ytUrl = (v) => `https://www.youtube.com/watch?v=${ytId(v)}`;
  const ytThumb = (v) => `https://i.ytimg.com/vi/${ytId(v)}/hqdefault.jpg`;
  const domain = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
  const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const pad = (n) => String(n).padStart(2, "0");
  const list = (a) => (Array.isArray(a) ? a : []);
  const ext = (href, label, cls = "btn btn--sm btn--ghost") =>
    href ? `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>` : "";
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
  };
  const hexRgb = (hex) => {
    const m = String(hex || "").replace("#", "").match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : null;
  };

  /* ---------------------------------------------------------------------
     Ícones (SVG inline)
     --------------------------------------------------------------------- */
  const S = (d, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const I = {
    arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    ext: S('<path d="M7 17 17 7M9 7h8v8"/>'),
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    twitch: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.57 4.71h1.72v5.15h-1.72zm4.72 0H18v5.15h-1.71zM6 0 1.71 4.29v15.42h5.15V24l4.28-4.29h3.43L22.29 12V0zm14.57 11.14-3.43 3.43h-3.43l-3 3v-3H6.86V1.71h13.71z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z"/></svg>',
    instagram: S('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>', 'stroke-width="2"'),
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.77a5.68 5.68 0 1 0 4.9 5.63V9.1a7.33 7.33 0 0 0 4.3 1.38V7.4a4.29 4.29 0 0 1-3.24-1.58z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.8a13.7 13.7 0 0 0-.63 1.3 18.4 18.4 0 0 0-5.5 0 13.7 13.7 0 0 0-.64-1.3 19.7 19.7 0 0 0-4.92 1.57C.6 9.06-.25 13.62.17 18.12a19.9 19.9 0 0 0 6.03 3.05 14.7 14.7 0 0 0 1.29-2.1 12.9 12.9 0 0 1-2.03-.98l.5-.38a14.2 14.2 0 0 0 12.12 0l.5.38c-.65.38-1.33.71-2.04.98.37.74.8 1.44 1.29 2.1a19.8 19.8 0 0 0 6.03-3.05c.5-5.22-.84-9.74-3.54-13.75zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42z"/></svg>',
    link: S('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    mail: S('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    check: S('<path d="m5 12 5 5 9-10"/>', 'stroke-width="3"'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    sword: S('<path d="M14.5 3H21v6.5L10 20.5 3.5 14z"/><path d="m7 17-3 3M5 13l6 6"/>'),
    crown: S('<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'),
    gear: S('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  };
  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';

  const img = (src, alt = "", cls = "", extra = "") =>
    src ? `<img src="${esc(src)}" alt="${esc(alt)}" class="${cls}" loading="lazy" decoding="async" ${extra} />` : "";

  /* ---------------------------------------------------------------------
     Acesso aos dados
     --------------------------------------------------------------------- */
  const games = () => list(D.games);
  const gameById = (id) => games().find((g) => g.id === id);
  const sectionOf = (g, id) => list(g && g.sections).find((s) => s.id === id);
  const fromRoute = (r) => {
    const [gid, sid] = String(r || "").split("/");
    const g = gameById(gid);
    return { g, s: sid ? sectionOf(g, sid) : null };
  };
  const sectionCount = (s) => {
    if (s.type === "phases") return list(s.phases).reduce((n, p) => n + list(p.items).length, 0);
    if (s.type === "feature") return null;
    return list(s.items).length;
  };
  const totals = () => {
    const t = { builds: 0, phases: 0, videos: 0, cards: 0 };
    games().forEach((g) => list(g.sections).forEach((s) => { if (t[s.type] !== undefined) t[s.type] += sectionCount(s) || 0; }));
    return t;
  };

  /* ---------------------------------------------------------------------
     Tema e "casca" (header/footer) a partir dos dados
     --------------------------------------------------------------------- */
  function applyTheme() {
    const t = D.theme || {};
    const r = document.documentElement.style;
    const set = (k, v) => v && r.setProperty(k, v);
    set("--accent", t.accent);
    set("--accent-rgb", hexRgb(t.accent));
    set("--purple", t.purple);
    set("--purple-rgb", hexRgb(t.purple));
    set("--accent-2", t.highlight);
    set("--bg", t.bg);
    set("--panel-2", t.panel);
    if (t.bg && t.panel) set("--panel", `color-mix(in srgb, ${t.panel} 55%, ${t.bg})`);
    set("--text", t.text);
    $('meta[name="theme-color"]')?.setAttribute("content", t.bg || "#0a0612");
  }

  const socialLinks = (cls = "socials") =>
    `<div class="${cls}">${list(C.socials)
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}" data-s="${esc(s.network)}">${I[s.network] || I.link}</a>`)
      .join("")}</div>`;

  function paintChrome() {
    $$(".brand__logo, .footer__logo").forEach((el) => C.logo && (el.src = C.logo));
    $(".brand")?.setAttribute("aria-label", `${C.name} — início`);
    const pill = $("#livePill");
    if (pill) { pill.href = C.twitchUrl; const av = $(".live-pill__avatar", pill); if (av && C.avatar) av.src = C.avatar; }

    $("#nav").innerHTML =
      `<a href="#/" data-nav="home">Início</a>` +
      games().map((g) => `<a href="#/${esc(g.id)}" data-nav="${esc(g.id)}">${esc(g.short || g.name)}</a>`).join("") +
      `<a href="#/canal" data-nav="canal">Canal</a>`;

    const site = D.site || {};
    $(".footer__brand p").textContent = site.description || "";
    $("#footerSocials").outerHTML = socialLinks("socials").replace('class="socials"', 'class="socials" id="footerSocials"');
    const cols = $(".footer__cols");
    cols.innerHTML = `
      <div><h4>Jogos</h4>${games().map((g) => `<a href="#/${esc(g.id)}">${esc(g.name)}</a>`).join("")}</div>
      <div><h4>Canal</h4>
        <a href="#/canal">Sobre o ${esc(C.name)}</a>
        ${C.subUrl ? `<a href="${esc(C.subUrl)}" target="_blank" rel="noopener">Seja sub</a>` : ""}
        ${C.donateUrl ? `<a href="${esc(C.donateUrl)}" target="_blank" rel="noopener">Doe para o ${esc(C.name)}</a>` : ""}
        ${C.supportUrl ? `<a href="${esc(C.supportUrl)}" target="_blank" rel="noopener">${esc(C.supportLabel || "Apoie o criador do site")}</a>` : ""}
      </div>`;
    const credit = site.creditUrl
      ? `<a href="${esc(site.creditUrl)}" target="_blank" rel="noopener"><strong>${esc(site.credit)}</strong></a>`
      : `<strong>${esc(site.credit || "")}</strong>`;
    $(".footer__base").innerHTML = `
      <span>© ${new Date().getFullYear()} ${esc(C.name)}${site.credit ? ` · Site por ${credit}` : ""}</span>
      <span class="mono">${esc(site.disclaimer || "")}</span>`;
  }

  /* ---------------------------------------------------------------------
     Componentes
     --------------------------------------------------------------------- */
  const crumbs = (items, center = false) =>
    `<nav class="crumbs" aria-label="Você está em"${center ? ' style="justify-content:center"' : ""}>${items
      .map((it, i) =>
        i === items.length - 1
          ? `<span aria-current="page">${esc(it[0])}</span>`
          : `<a href="${it[1]}">${esc(it[0])}</a><span aria-hidden="true">/</span>`
      )
      .join("")}</nav>`;

  const pageHead = ({ crumbs: c, eyebrow, title, lead, logo, icon }) => `
    <header class="page-head wrap ${logo || icon ? "page-head--media" : ""}">
      ${logo ? `<div class="page-head__logo">${img(logo, "", "", 'loading="eager"')}</div>` : ""}
      ${icon ? `<div class="page-head__icon">${img(icon, "", "", 'loading="eager"')}</div>` : ""}
      <div class="page-head__text">
        ${c ? crumbs(c) : ""}
        ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
        <h1 style="margin-top:${eyebrow ? "12px" : "0"}">${title}</h1>
        ${lead ? `<p>${lead}</p>` : ""}
      </div>
    </header>`;

  // Título com a última palavra destacada (ex.: "Genesis <Tree>")
  const hlTitle = (t) => {
    const parts = esc(t).split(" ");
    return parts.length > 1 ? `${parts.slice(0, -1).join(" ")} <span class="hl">${parts.at(-1)}</span>` : parts[0];
  };

  const featureBlock = (f, routeHref, extraStyle = "") => {
    if (!f || f.show === false || !f.title) return "";
    return `
      <div class="card feature reveal" ${extraStyle}>
        <div class="feature__avatar">${img(C.avatar, C.name)}<span>${I.crown}</span></div>
        <div>
          ${f.eyebrow ? `<span class="eyebrow">${esc(f.eyebrow)}</span>` : ""}
          <h3>${esc(f.title)}</h3>
          ${f.subtitle ? `<p>${esc(f.subtitle)}</p>` : ""}
        </div>
        <div class="feature__actions">
          ${ext(f.url, `${esc(f.urlLabel || "Abrir")} ${I.ext}`, "btn")}
          ${routeHref ? `<a class="btn btn--ghost" href="${routeHref}">Ver todas</a>` : ""}
        </div>
      </div>`;
  };

  const ctaBlock = (c) => {
    if (!c || c.show === false || !c.title) return "";
    const vid = ytId(c.video);
    return `
      <section class="section section--tight wrap">
        <div class="card banner reveal">
          <div>
            ${c.eyebrow ? `<span class="eyebrow">${esc(c.eyebrow)}</span>` : ""}
            <h2>${esc(c.title)}</h2>
            ${c.desc ? `<p>${esc(c.desc)}</p>` : ""}
          </div>
          ${vid
            ? `<button class="btn" type="button" data-play="${vid}" data-title="${esc(c.title)}" data-sub="">${I.play} ${esc(c.buttonLabel || "Assistir")}</button>`
            : ext(c.url, `${esc(c.buttonLabel || "Abrir")} ${I.ext}`, "btn")}
        </div>
      </section>`;
  };

  const tile = (href, icon, title, text, count, i) => `
    <a class="card card--link tile reveal" href="${href}" style="--d:${i}">
      ${count !== null && count !== undefined ? `<span class="tile__count">${typeof count === "number" ? pad(count) : esc(count)}</span>` : ""}
      <span class="tile__img">${img(icon, "")}</span><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ""}
    </a>`;

  const panelsRow = () => {
    const P = C.panels || {};
    const items = [];
    if (C.subUrl) items.push(`<a class="panel reveal" href="${esc(C.subUrl)}" target="_blank" rel="noopener">${img(P.sub, "Seja Sub")}<span>Seja sub na Twitch ${I.ext}</span></a>`);
    if (C.donateUrl) items.push(`<a class="panel reveal" href="${esc(C.donateUrl)}" target="_blank" rel="noopener" style="--d:1">${img(P.donate, "Doar")}<span>Doe para o ${esc(C.name)} ${I.ext}</span></a>`);
    list(C.partners).forEach((p, i) =>
      items.push(`<a class="panel panel--partner reveal" href="${esc(p.url)}" target="_blank" rel="noopener" style="--d:${i + 2}">${img(p.img, p.name)}<span><b>${esc(p.name)}</b> · ${esc(p.desc)}</span></a>`)
    );
    return items.length ? `<div class="panels">${items.join("")}</div>` : "";
  };

  const supportStrip = () => {
    const row = panelsRow();
    return row ? `
      <section class="section wrap">
        <div class="sec-head">
          <div><span class="eyebrow">Apoie a live</span><h2>Curtiu? Fortalece o canal</h2></div>
          <p>Sub, doação ou os links dos parceiros: tudo ajuda a manter a live e este hub no ar.</p>
        </div>
        ${row}
      </section>` : "";
  };

  /* ---------- Cards de seções ---------- */
  const buildCard = (b, i, cats) => {
    const cat = cats.find((c) => c.id === b.category);
    const vid = ytId(b.video);
    const links = list(b.links).filter((l) => l.url);
    return `
    <article class="card card--link build reveal" style="--d:${i}">
      ${vid ? `<button class="build__thumb" type="button" data-play="${vid}" data-title="${esc(b.title)}" data-sub="${esc([b.subtitle, b.author].filter(Boolean).join(" · "))}" aria-label="Assistir vídeo: ${esc(b.title)}">
        <img src="${ytThumb(vid)}" alt="" loading="lazy" width="480" height="360" />
        ${cat ? `<span class="build__cat">${esc(cat.label)}</span>` : ""}
        ${b.badge ? `<span class="build__flag">${esc(b.badge)}</span>` : ""}
        <span class="build__play">${playIcon}</span>
      </button>` : ""}
      <div class="build__body">
        ${cat && cat.img ? img(cat.img, cat.label, "build__medal") : ""}
        ${b.subtitle ? `<span class="build__asc">${esc(b.subtitle)}</span>` : ""}
        <h3>${esc(b.title)}</h3>
        ${b.author ? `<span class="build__by">por ${b.authorUrl ? `<a href="${esc(b.authorUrl)}" target="_blank" rel="noopener">${esc(b.author)}</a>` : esc(b.author)}</span>` : ""}
        ${links.length ? `<div class="pob-list">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>` : ""}
        <div class="build__actions">
          ${b.url ? ext(b.url, `${esc(b.urlLabel || "Abrir")} ${I.ext}`, "btn btn--sm") : links.length ? "" : `<span class="tbd">${esc(b.urlLabel || "Link")}: em breve</span>`}
          ${vid ? ext(ytUrl(vid), "YouTube " + I.ext) : ""}
        </div>
      </div>
    </article>`;
  };

  const cardItem = (it, i, style) => {
    if (style === "class") {
      return `
      <a class="card card--link cls reveal" href="${esc(it.url)}" target="_blank" rel="noopener" style="--d:${i}">
        <span class="cls__mono" aria-hidden="true">${esc((it.title || " ")[0])}</span>
        ${img(it.img, "", "cls__img")}
        ${it.tag ? `<span class="cls__src">${esc(it.tag)}</span>` : ""}
        <h3>${esc(it.title)}</h3>
        ${it.subtitle ? `<p>${esc(it.subtitle)}</p>` : ""}
        ${it.desc ? `<p style="color:var(--muted);font-weight:400">${esc(it.desc)}</p>` : ""}
        <span class="cls__go">Abrir guia ${I.ext}</span>
      </a>`;
    }
    if (style === "orb") {
      return `
      <a class="card card--link item genesis reveal" href="${esc(it.url)}" target="_blank" rel="noopener" style="--d:${i}">
        <span class="genesis__img">${img(it.img, it.tag)}</span>
        <div>
          ${it.tag ? `<span class="item__type">${esc(it.tag)}</span>` : ""}
          <h3>${esc(it.title)} ${I.ext}</h3>
          ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
          <span class="item__domain">${esc(domain(it.url))}</span>
        </div>
      </a>`;
    }
    return `
    <a class="card card--link item ${it.img ? "item--img" : ""} reveal" href="${esc(it.url)}" target="_blank" rel="noopener" style="--d:${i}">
      ${img(it.img, "", "item__img")}
      <div class="item__main">
        <div class="item__top">
          <span class="item__type">${esc(it.tag || "Link")}</span>
          ${it.badge ? `<span class="item__badge">${esc(it.badge)}</span>` : ""}
        </div>
        <h3>${esc(it.title)} ${I.ext}</h3>
        ${it.subtitle ? `<span class="item__sub">${esc(it.subtitle)}</span>` : ""}
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
        <span class="item__domain">${esc(domain(it.url))}</span>
      </div>
    </a>`;
  };

  /* ---------------------------------------------------------------------
     Renderizadores de seção (por tipo)
     --------------------------------------------------------------------- */
  const SECTION = {
    builds: {
      render(g, s, params, query) {
        const cats = list(s.categories);
        const active = cats.some((c) => c.id === params[0]) ? params[0] : "all";
        const counts = Object.fromEntries(cats.map((c) => [c.id, list(s.items).filter((b) => b.category === c.id).length]));
        return `
          ${featureBlock(s.featured, "", 'style="margin-bottom:32px"')}
          ${cats.length || list(s.items).length > 6 ? `
          <div class="toolbar">
            ${cats.length ? `<div class="chips" role="group" aria-label="Filtrar por categoria">
              <button class="chip" type="button" data-cat="all" aria-pressed="${active === "all"}">Todas <small>${list(s.items).length}</small></button>
              ${cats.map((c) => `<button class="chip" type="button" data-cat="${esc(c.id)}" aria-pressed="${active === c.id}">${img(c.img, "", "chip__img")}${esc(c.label)} <small>${counts[c.id]}</small></button>`).join("")}
            </div>` : "<span></span>"}
            <label class="filter-input">
              ${I.search}
              <input id="buildFilter" type="search" placeholder="Filtrar por nome, classe ou criador" value="${esc(query.q || "")}" aria-label="Filtrar" />
            </label>
          </div>` : ""}
          <p class="cat-desc" id="catDesc"></p>
          <div class="builds" id="buildGrid"></div>`;
      },
      mount(g, s, params, query) {
        const cats = list(s.categories);
        let cat = cats.some((c) => c.id === params[0]) ? params[0] : "all";
        const grid = $("#buildGrid"), input = $("#buildFilter"), desc = $("#catDesc");
        const draw = () => {
          const q = norm(input ? input.value.trim() : "");
          const items = list(s.items).filter(
            (b) => (cat === "all" || b.category === cat) && (!q || norm(`${b.title} ${b.subtitle} ${b.author} ${b.category}`).includes(q))
          );
          const c = cats.find((x) => x.id === cat);
          desc.textContent = c ? c.desc || "" : cats.length ? "Todas, de todos os arquétipos." : "";
          desc.classList.toggle("is-warn", !!(c && c.warn));
          grid.innerHTML = items.length
            ? items.map((b, i) => buildCard(b, i, cats)).join("")
            : `<div class="empty" style="grid-column:1/-1">Nada encontrado${input && input.value ? ` para “${esc(input.value)}”` : ""}.</div>`;
          reveal(grid);
        };
        $$(".chip[data-cat]").forEach((btn) =>
          btn.addEventListener("click", () => {
            cat = btn.dataset.cat;
            $$(".chip[data-cat]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
            history.replaceState(null, "", `#/${g.id}/${s.id}${cat === "all" ? "" : "/" + cat}`);
            draw();
          })
        );
        input?.addEventListener("input", draw);
        draw();
        if (query.q) input?.focus();
      },
    },

    phases: {
      render(g, s, params) {
        const phases = list(s.phases);
        const active = phases.some((p) => p.id === params[0]) ? params[0] : phases[0] && phases[0].id;
        return `
          <div class="phases" role="tablist" aria-label="Fases" style="grid-template-columns:repeat(${Math.min(Math.max(phases.length, 1), 4)},1fr)">
            ${phases.map((p, i) => `<button class="phase" role="tab" type="button" data-phase="${esc(p.id)}" aria-selected="${p.id === active}">
              ${img(p.img, "", "phase__img")}<small>Fase ${pad(i + 1)}${p.subtitle ? ` · ${esc(p.subtitle)}` : ""}</small><b>${esc(p.label)}</b></button>`).join("")}
          </div>
          <div id="phasePanel" role="tabpanel"></div>`;
      },
      mount(g, s, params) {
        const phases = list(s.phases);
        const panel = $("#phasePanel");
        const draw = (id) => {
          const ph = phases.find((p) => p.id === id) || phases[0];
          if (!ph) { panel.innerHTML = `<div class="empty">Nenhuma fase cadastrada ainda.</div>`; return; }
          $$(".phase").forEach((b) => b.setAttribute("aria-selected", b.dataset.phase === ph.id));
          panel.innerHTML = `
            ${ph.intro ? `<p class="atlas-intro">${esc(ph.intro)}</p>` : ""}
            <div class="strats">
              ${list(ph.items).map((it, i) => `
                <article class="card strat reveal" style="--d:${i}">
                  <h3>${esc(it.title)}</h3>
                  ${it.creditName ? `<span class="strat__credit">Feito por ${it.creditUrl ? `<a href="${esc(it.creditUrl)}" target="_blank" rel="noopener">${esc(it.creditName)}</a>` : esc(it.creditName)}</span>` : ""}
                  ${it.map || list(it.tags).length ? `<dl class="spec">
                    ${it.map ? `<dt>Mapa</dt><dd>${esc(it.map)}</dd>` : ""}
                    ${list(it.tags).length ? `<dt>${esc(s.tagsLabel || "Threads")}</dt><dd><ul>${list(it.tags).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></dd>` : ""}
                  </dl>` : ""}
                  ${it.notes ? `<p class="strat__notes">${esc(it.notes)}</p>` : ""}
                  <div class="strat__actions">
                    ${ext(it.url, `${esc(it.urlLabel || "Abrir")} ${I.ext}`, "btn btn--sm")}
                    ${ext(it.extraUrl, `${esc(it.extraLabel || "Mais")} ${I.ext}`)}
                  </div>
                </article>`).join("")}
            </div>`;
          reveal(panel);
        };
        $$(".phase").forEach((b) =>
          b.addEventListener("click", () => {
            history.replaceState(null, "", `#/${g.id}/${s.id}/${b.dataset.phase}`);
            draw(b.dataset.phase);
          })
        );
        draw(params[0]);
      },
    },

    cards: {
      render(g, s) {
        const style = s.style || "thumb";
        const grid = style === "class" ? "classes" : "list-grid";
        const items = list(s.items);
        return `
          <div class="${grid}">${items.length ? items.map((it, i) => cardItem(it, i, style)).join("") : `<div class="empty" style="grid-column:1/-1">Nenhum item ainda.</div>`}</div>
        </section>
        ${ctaBlock(s.cta)}
        <section>`;
      },
    },

    videos: {
      key: (g, s) => (g.id === "poe1" && s.id === "craft" ? "mv-craft-done" : `mv-videos-${g.id}-${s.id}`),
      render(g, s) {
        const items = list(s.items).filter((v) => ytId(v.video));
        const done = new Set(store.get(SECTION.videos.key(g, s), []));
        const n = items.filter((v) => done.has(ytId(v.video))).length;
        return `
          <div class="card craft-top reveal">
            <div class="progress">
              <div class="progress__label"><span>Seu progresso</span><span><b id="vidCount">${n}</b> / ${items.length} vídeos</span></div>
              <div class="progress__bar"><i id="vidBar" style="width:${items.length ? (n / items.length) * 100 : 0}%"></i></div>
            </div>
            ${s.authorUrl ? ext(s.authorUrl, `Canal ${s.authorName ? "do " + esc(s.authorName) : ""} ${I.ext}`) : ""}
          </div>
          <div class="episodes">
            ${items.map((v, i) => {
              const id = ytId(v.video);
              return `
              <article class="card card--link ep reveal ${done.has(id) ? "is-done" : ""}" style="--d:${i}">
                <button class="build__thumb" type="button" data-play="${id}" data-title="Parte ${i + 1} — ${esc(v.title)}" data-sub="${esc(s.title)}${s.authorName ? " · " + esc(s.authorName) : ""}" aria-label="Assistir parte ${i + 1}: ${esc(v.title)}">
                  <img src="${ytThumb(id)}" alt="" loading="lazy" width="480" height="360" />
                  <span class="ep__num"><small>Parte</small>${pad(i + 1)}</span>
                  <span class="build__play">${playIcon}</span>
                </button>
                <div class="ep__body">
                  <p>${esc(v.title)}</p>
                  <button class="check" type="button" data-done="${id}" aria-pressed="${done.has(id)}" aria-label="Marcar parte ${i + 1} como assistida">${I.check}</button>
                </div>
              </article>`;
            }).join("")}
          </div>`;
      },
      mount(g, s) {
        const key = SECTION.videos.key(g, s);
        const total = list(s.items).filter((v) => ytId(v.video)).length;
        $$("[data-done]").forEach((btn) =>
          btn.addEventListener("click", () => {
            const done = new Set(store.get(key, []));
            const id = btn.dataset.done;
            done.has(id) ? done.delete(id) : done.add(id);
            store.set(key, [...done]);
            btn.setAttribute("aria-pressed", done.has(id));
            btn.closest(".ep").classList.toggle("is-done", done.has(id));
            const n = $$(".ep.is-done").length;
            $("#vidCount").textContent = n;
            $("#vidBar").style.width = `${total ? (n / total) * 100 : 0}%`;
          })
        );
      },
    },

    feature: {
      render(g, s) {
        const vid = ytId(s.video);
        return `
          <div class="card banner reveal">
            <div>
              ${s.eyebrow ? `<span class="eyebrow">${esc(s.eyebrow)}</span>` : ""}
              ${s.heading ? `<h2>${esc(s.heading)}</h2>` : ""}
              ${s.desc ? `<p>${esc(s.desc)}</p>` : ""}
            </div>
            ${vid
              ? `<button class="btn" type="button" data-play="${vid}" data-title="${esc(s.heading || s.title)}" data-sub="${esc(g.name)}">${I.play} ${esc(s.urlLabel || "Assistir")}</button>`
              : ext(s.url, `${esc(s.urlLabel || "Abrir")} ${I.ext}`, "btn")}
          </div>
        </section>
        ${s.img ? `
        <section class="section section--tight wrap">
          <a class="card card--link recipe reveal" href="${esc(s.img)}" target="_blank" rel="noopener" title="Abrir imagem em tamanho real">
            ${img(s.img, s.heading || s.title)}
            <span class="recipe__hint">Clique para ampliar ${I.ext}</span>
          </a>
        </section>` : ""}
        <section>`;
      },
    },
  };

  const TYPE_LABEL = { builds: "Builds", phases: "Estratégias", cards: "Links", videos: "Vídeos", feature: "Destaque" };

  /* ---------------------------------------------------------------------
     Páginas
     --------------------------------------------------------------------- */
  const pages = {
    home() {
      const H = D.home || {};
      const t = totals();
      const stats = [
        [t.builds, "Builds"], [t.phases, "Estratégias"], [t.videos, "Vídeos"], [t.cards, "Guias e links"],
      ].filter(([n]) => n > 0);
      const shortcuts = list(H.shortcuts).map(fromRoute).filter((x) => x.g && x.s);
      return `
      <div class="hero-bg" aria-hidden="true" style="background-image:url('${esc(C.banner)}')"></div>
      <section class="hero wrap">
        <div class="hero__grid">
          <div>
            ${img(C.logo, C.name, "hero__logo", 'loading="eager"')}
            ${H.eyebrow ? `<span class="eyebrow">${esc(H.eyebrow)}</span>` : ""}
            <h1>${esc(H.title || "")}${H.highlight ? `<br/><span class="glitch" data-text="${esc(H.highlight)}">${esc(H.highlight)}</span>` : ""}</h1>
            ${H.lead ? `<p class="hero__lead">${esc(H.lead)}</p>` : ""}
            <div class="hero__cta">
              ${H.ctaRoute ? `<a class="btn" href="#/${esc(H.ctaRoute)}">${I.sword} ${esc(H.ctaLabel || "Ver builds")}</a>` : ""}
              <a class="btn btn--twitch" href="${esc(C.twitchUrl)}" target="_blank" rel="noopener">${I.twitch} Assistir</a>
            </div>
            ${stats.length ? `<div class="hero__stats">${stats.map(([n, l]) => `<div class="stat"><b data-count="${n}">0</b><span>${l}</span></div>`).join("")}</div>` : ""}
          </div>
          <div class="card stream reveal">
            <div class="stream__bar">
              <span class="rec" id="streamRec">${img(C.avatar, "", "rec__avatar")}<i></i><span>twitch.tv/${esc(C.twitch)}</span></span>
              <span id="streamState">STANDBY</span>
            </div>
            <div class="stream__frame" id="streamFrame">
              <span class="corner corner--tl"></span><span class="corner corner--br"></span>
              <div class="stream__placeholder" style="background-image:url('${esc(C.banner)}')">
                <button type="button" id="streamLoad">
                  <span class="play">${playIcon}</span>
                  <strong>Carregar a live</strong>
                  <small>Player da Twitch · carrega só quando você clicar</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--tight wrap" id="jogos">
        <div class="sec-head">
          <div><span class="eyebrow">01 // Escolha o jogo</span><h2>Selecione a sua liga</h2></div>
          <p>Cada jogo tem o seu próprio hub com builds, guias e ferramentas.</p>
        </div>
        <div class="games">
          ${games().map((g, i) => `
            <a class="card card--link game reveal" data-g="${esc(g.id)}" href="#/${esc(g.id)}" style="--d:${i}">
              <div class="game__art"></div>
              <div class="game__logo">${img(g.logo, g.name)}</div>
              <span class="game__tag ${g.status === "soon" ? "game__tag--soon" : ""}">${g.status === "soon" ? "Em breve" : "Disponível"}</span>
              <h3>${esc(g.name)}</h3>
              ${g.tagline ? `<p>${esc(g.tagline)}</p>` : ""}
              <span class="game__go">${g.status === "soon" ? "Saiba mais" : "Entrar"} ${I.arrow}</span>
            </a>`).join("")}
        </div>
      </section>

      ${H.featured && H.featured.show !== false && H.featured.title ? `
      <section class="section section--tight wrap">
        <div class="sec-head"><div><span class="eyebrow">02 // Em destaque</span><h2>A build da live</h2></div></div>
        ${featureBlock(H.featured, H.featured.route ? `#/${esc(H.featured.route)}` : "")}
      </section>` : ""}

      ${shortcuts.length ? `
      <section class="section section--tight wrap">
        <div class="sec-head"><div><span class="eyebrow">03 // Acesso rápido</span><h2>Atalhos</h2></div></div>
        <div class="tiles">
          ${shortcuts.map(({ g, s }, i) => tile(`#/${g.id}/${s.id}`, s.icon, s.title, s.tileText, null, i)).join("")}
        </div>
      </section>` : ""}

      <section class="section section--tight wrap">
        <div class="card about reveal">
          <div class="about__avatar">${img(C.avatar, "Avatar do " + C.name)}</div>
          <div class="about__text">
            <span class="eyebrow">04 // Quem é o ${esc(C.name)}</span>
            <h2>${esc(H.aboutTitle || "Sobre o canal")}</h2>
            <p>${esc(C.bio)}</p>
            <div class="about__actions">
              ${socialLinks()}
              <a class="btn btn--ghost btn--sm" href="#/canal">Setup, regras e contato ${I.arrow}</a>
            </div>
          </div>
        </div>
      </section>
      ${supportStrip()}`;
    },

    game(g) {
      if (g.status === "soon" || !list(g.sections).length) return pages.soon(g);
      const featured = list(g.sections).find((s) => s.featured && s.featured.show !== false && s.featured.title);
      return `
      ${pageHead({ crumbs: [["Início", "#/"], [g.name]], eyebrow: "Hub do jogo", title: hlTitle(g.name), lead: esc(g.about), logo: g.logo })}
      <section class="section section--tight wrap">
        <div class="tiles">
          ${list(g.sections).map((s, i) => tile(`#/${g.id}/${s.id}`, s.icon, s.title, s.tileText, sectionCount(s), i)).join("")}
        </div>
      </section>
      ${featured ? `<section class="section section--tight wrap">${featureBlock(featured.featured, `#/${g.id}/${featured.id}`)}</section>` : ""}`;
    },

    section(g, s, params, query) {
      const R = SECTION[s.type];
      if (!R) return pages.notFound();
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], [g.short || g.name, `#/${g.id}`], [s.title]],
        eyebrow: g.name,
        title: hlTitle(s.title),
        lead: esc(s.intro || "").replace(
          esc(s.authorName || "\u0000"),
          s.authorName && s.authorUrl ? `<a href="${esc(s.authorUrl)}" target="_blank" rel="noopener" class="hl">${esc(s.authorName)}</a>` : esc(s.authorName || "")
        ),
        icon: s.icon,
      })}
      <section class="section section--tight wrap">
        ${R.render(g, s, params, query)}
      </section>`;
    },

    soon(g) {
      return `
      <section class="soon wrap">
        ${crumbs([["Início", "#/"], [g.name]], true)}
        <div class="soon__logo">${img(g.logo, g.name, "", 'loading="eager"')}</div>
        <div class="term">// carregando_conteúdo</div>
        <h1>${esc(g.name)}</h1>
        ${g.about ? `<p>${esc(g.about)}</p>` : ""}
        <div class="hero__cta" style="justify-content:center">
          <a class="btn btn--twitch" href="${esc(C.twitchUrl)}" target="_blank" rel="noopener">${I.twitch} Acompanhe na live</a>
          <a class="btn btn--ghost" href="#/">Voltar ao início</a>
        </div>
      </section>`;
    },

    canal() {
      const P = C.panels || {};
      return `
      <div class="hero-bg hero-bg--short" aria-hidden="true" style="background-image:url('${esc(C.banner)}')"></div>
      <section class="channel wrap">
        ${crumbs([["Início", "#/"], ["O canal"]])}
        <div class="channel__head">
          <div class="channel__avatar">${img(C.avatar, "Avatar do " + C.name, "", 'loading="eager"')}</div>
          <div>
            ${img(C.logo, C.name, "channel__logo", 'loading="eager"')}
            <p class="channel__meta">${C.team ? `<span>Equipe <b>${esc(C.team)}</b></span>` : ""}<span>ActionRPG · PT-BR</span></p>
            <p class="channel__bio">${esc(C.bio)}</p>
            <div class="channel__actions">
              <a class="btn btn--twitch" href="${esc(C.twitchUrl)}" target="_blank" rel="noopener">${I.twitch} Seguir na Twitch</a>
              ${socialLinks()}
            </div>
          </div>
        </div>
      </section>
      <section class="section section--tight wrap">
        <div class="info-grid">
          ${list(C.setup).length ? `<article class="card info reveal">
            ${img(P.hardware, "Hardware", "info__panel")}
            <dl class="setup">${list(C.setup).map((x) => `<dt>${esc(x.label)}</dt><dd>${esc(x.value)}</dd>`).join("")}</dl>
          </article>` : ""}
          ${list(C.rules).length ? `<article class="card info reveal" style="--d:1">
            ${img(P.rules, "Regras", "info__panel")}
            <ol class="rules">${list(C.rules).map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
          </article>` : ""}
          ${C.contact ? `<article class="card info reveal" style="--d:2">
            ${img(P.contact, "Contato", "info__panel")}
            <p class="info__text">Parcerias, publicidade e assuntos comerciais:</p>
            <a class="btn btn--ghost btn--sm mail" href="mailto:${esc(C.contact)}">${I.mail} ${esc(C.contact)}</a>
          </article>` : ""}
        </div>
      </section>
      ${supportStrip()}`;
    },

    notFound() {
      return `
      <section class="soon wrap">
        <div class="soon__glyph">${img("assets/img/brand/channel-points.webp", "", "", 'loading="eager"')}</div>
        <div class="term">// erro_404</div>
        <h1>Mapa não encontrado</h1>
        <p>Esse portal se fechou. Volte para a cidade e tente outro caminho.</p>
        <div class="hero__cta" style="justify-content:center"><a class="btn" href="#/">Voltar ao início</a></div>
      </section>`;
    },
  };

  /* ---------------------------------------------------------------------
     Router
     --------------------------------------------------------------------- */
  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [pathPart, qs = ""] = raw.split("?");
    const parts = pathPart.replace(/\/+$/, "").split("/").filter(Boolean);
    const query = Object.fromEntries(new URLSearchParams(qs));

    let html, title, nav = "home", after = null;
    if (!parts.length) {
      html = pages.home(); title = "Builds, Atlas e Guias de ARPG";
      after = () => { $("#streamLoad")?.addEventListener("click", loadStream); paintLive(); };
    } else if (parts[0] === "canal" && parts.length === 1) {
      html = pages.canal(); title = "O canal"; nav = "canal";
    } else {
      const g = gameById(parts[0]);
      const s = g && parts[1] ? sectionOf(g, parts[1]) : null;
      if (g && !parts[1]) { html = pages.game(g); title = g.name; nav = g.id; }
      else if (g && s) {
        html = pages.section(g, s, parts.slice(2), query); title = `${s.title} · ${g.short || g.name}`; nav = g.id;
        after = () => SECTION[s.type] && SECTION[s.type].mount && SECTION[s.type].mount(g, s, parts.slice(2), query);
      } else { html = pages.notFound(); title = "Página não encontrada"; }
    }

    document.body.dataset.game = nav;
    $$(".nav a").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === nav));
    closeMenu();
    main.innerHTML = html;
    document.title = `${title} | ${C.name}`;
    after && after();
    reveal(main);
    countUp();
    embers.retint();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    main.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll + contadores
     --------------------------------------------------------------------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) {
            const d = Math.min(+getComputedStyle(e.target).getPropertyValue("--d") || 0, 8);
            e.target.style.transitionDelay = `${d * 50}ms`;
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
        { rootMargin: "0px 0px -40px 0px" }
      )
    : null;
  function reveal(root) {
    $$(".reveal:not(.is-in)", root).forEach((el) => (io ? io.observe(el) : el.classList.add("is-in")));
  }
  function countUp() {
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / 1100, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------------------------------------------------------------------
     Twitch: status ao vivo + player sob demanda
     --------------------------------------------------------------------- */
  let isLive = null;
  async function checkLive() {
    if (!C.twitch) return;
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(C.twitch)}`, { signal: ctrl.signal });
      const t = (await r.text()).toLowerCase();
      isLive = r.ok && !t.includes("offline") && !t.includes("error") && !t.includes("not found");
    } catch {
      isLive = null;
    }
    paintLive();
  }
  function paintLive() {
    const pill = $("#livePill");
    pill.classList.toggle("is-live", isLive === true);
    $(".live-pill__label", pill).textContent = isLive ? "Ao vivo" : "Twitch";
    const rec = $("#streamRec"), state = $("#streamState");
    if (rec) rec.classList.toggle("is-live", isLive === true);
    if (state) state.textContent = isLive === true ? "● AO VIVO" : isLive === false ? "OFFLINE" : "STANDBY";
  }
  function loadStream() {
    const host = location.hostname;
    const frame = $("#streamFrame");
    if (!host) { window.open(C.twitchUrl, "_blank", "noopener"); return; }
    frame.insertAdjacentHTML(
      "beforeend",
      `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(C.twitch)}&parent=${encodeURIComponent(host)}&muted=false" allowfullscreen allow="autoplay; fullscreen" title="Live do ${esc(C.name)} na Twitch"></iframe>`
    );
    $(".stream__placeholder", frame)?.remove();
  }

  /* ---------------------------------------------------------------------
     Player de vídeo (YouTube nocookie)
     --------------------------------------------------------------------- */
  const player = $("#player");
  let lastFocus = null;
  function openPlayer(id, title, sub) {
    lastFocus = document.activeElement;
    $("#playerFrame").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $("#playerMeta").innerHTML = `<div><b>${esc(title)}</b><small>${esc(sub || "")}</small></div>${ext(ytUrl(id), `Abrir no YouTube ${I.ext}`)}`;
    player.hidden = false;
    document.body.style.overflow = "hidden";
    $(".player__close", player).focus();
  }
  function closePlayer() {
    if (player.hidden) return;
    player.hidden = true;
    $("#playerFrame").innerHTML = "";
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-play]");
    if (t) { e.preventDefault(); openPlayer(t.dataset.play, t.dataset.title, t.dataset.sub); }
  });
  $$("[data-close]", player).forEach((el) => el.addEventListener("click", closePlayer));

  /* ---------------------------------------------------------------------
     Busca global (Ctrl/⌘ + K ou "/")
     Rodando localmente com o editor, digitar "/edit" mostra o atalho do editor.
     --------------------------------------------------------------------- */
  let editorAvailable = false;
  const INDEX = (() => {
    const out = [];
    games().forEach((g) => {
      out.push({ type: "Jogo", title: g.name, sub: g.tagline || "", href: `#/${g.id}` });
      list(g.sections).forEach((s) => {
        out.push({ type: "Página", title: `${s.title}`, sub: g.name, href: `#/${g.id}/${s.id}` });
        const label = `${TYPE_LABEL[s.type] || "Item"}`;
        if (s.type === "builds") {
          if (s.featured && s.featured.title) out.push({ type: "Destaque", title: s.featured.title, sub: s.featured.eyebrow || "", href: s.featured.url, external: true });
          list(s.items).forEach((b) =>
            out.push({ type: "Build", title: [b.title, b.subtitle].filter(Boolean).join(" — "), sub: [g.short || g.name, b.author].filter(Boolean).join(" · "), href: `#/${g.id}/${s.id}/${b.category || ""}?q=${encodeURIComponent(b.title)}`.replace("/?", "?") })
          );
        } else if (s.type === "phases") {
          list(s.phases).forEach((p) => list(p.items).forEach((it) => out.push({ type: s.title, title: it.title, sub: `${p.label}${it.map ? " · " + it.map : ""}`, href: `#/${g.id}/${s.id}/${p.id}` })));
        } else if (s.type === "cards") {
          list(s.items).forEach((it) => out.push({ type: s.title.length > 12 ? label : s.title, title: [it.title, it.subtitle].filter(Boolean).join(" — "), sub: it.desc || it.tag || "", href: it.url, external: true }));
        } else if (s.type === "videos") {
          list(s.items).forEach((v, i) => ytId(v.video) && out.push({ type: s.title, title: `Parte ${i + 1} — ${v.title}`, sub: `Vídeo${s.authorName ? " · " + s.authorName : ""}`, play: ytId(v.video) }));
        }
      });
    });
    out.push({ type: "Página", title: "O canal", sub: `Sobre o ${C.name}`, href: "#/canal" });
    return out.map((o) => ({ ...o, _k: norm(`${o.title} ${o.sub} ${o.type}`) }));
  })();

  const search = $("#search"), sInput = $("#searchInput"), sList = $("#searchResults");
  let sel = 0, results = [];
  const hl = (text, q) => {
    if (!q) return esc(text);
    const i = norm(text).indexOf(q);
    return i < 0 ? esc(text) : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  };
  function drawSearch() {
    const raw = sInput.value.trim();
    const q = norm(raw);
    const terms = q.split(/\s+/).filter(Boolean);
    results = terms.length ? INDEX.filter((o) => terms.every((t) => o._k.includes(t))).slice(0, 30) : INDEX.filter((o) => o.type === "Jogo" || o.type === "Página").slice(0, 12);
    if (editorAvailable && /^\/?edit/.test(q)) results.unshift({ type: "Editor", title: "Abrir o editor do site", sub: "Somente local · altere textos, imagens, cores e publique", href: "/edit", editor: true });
    sel = 0;
    sList.innerHTML = results.length
      ? results.map((r, i) => `<li><a href="${r.play ? "#" : esc(r.href)}" ${r.external ? 'target="_blank" rel="noopener"' : ""} data-i="${i}" role="option" aria-selected="${i === 0}">
            <span class="r-type">${r.editor ? I.gear.replace("<svg", '<svg width="16" height="16"') : esc(r.type)}</span>
            <span class="r-main"><b>${hl(r.title, terms[0])}</b><small>${esc(r.sub)}</small></span>
            ${r.external ? I.ext.replace("<svg", '<svg width="14" height="14"') : ""}
          </a></li>`).join("")
      : `<li class="search__hint">Nada encontrado. Tente “cyclone”, “legion” ou “overlay”.</li>`;
  }
  function moveSel(d) {
    const items = $$("a[data-i]", sList);
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    items.forEach((a, i) => a.setAttribute("aria-selected", i === sel));
    items[sel].scrollIntoView({ block: "nearest" });
  }
  function openSearch(prefill = "") {
    lastFocus = document.activeElement;
    search.hidden = false;
    document.body.style.overflow = "hidden";
    sInput.value = prefill;
    drawSearch();
    setTimeout(() => sInput.focus(), 10);
  }
  function closeSearch() {
    if (search.hidden) return;
    search.hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }
  sInput.addEventListener("input", drawSearch);
  sInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Enter") { e.preventDefault(); $$("a[data-i]", sList)[sel]?.click(); }
  });
  sList.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    const r = results[+a.dataset.i];
    if (r.play) { e.preventDefault(); closeSearch(); openPlayer(r.play, r.title, r.sub); }
    else if (r.editor) { e.preventDefault(); location.href = "/edit"; }
    else closeSearch();
  });
  $$("[data-close]", search).forEach((el) => el.addEventListener("click", closeSearch));
  $("#searchOpen").addEventListener("click", () => openSearch());

  document.addEventListener("keydown", (e) => {
    const typing = /input|textarea|select/i.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.hidden ? openSearch() : closeSearch(); }
    else if (e.key === "/" && !typing && search.hidden) { e.preventDefault(); openSearch(editorAvailable ? "/" : ""); }
    else if (e.key === "Escape") { closeSearch(); closePlayer(); closeMenu(); }
  });

  /* ---------------------------------------------------------------------
     Menu mobile
     --------------------------------------------------------------------- */
  const burger = $("#burger"), nav = $("#nav");
  function closeMenu() { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  /* ---------------------------------------------------------------------
     Fundo: brasas subindo nas duas cores do tema
     --------------------------------------------------------------------- */
  const embers = (() => {
    const c = $("#embers");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!c.getContext || reduce || (D.theme && D.theme.embers === false)) { c.style.display = "none"; return { retint() {} }; }
    const ctx = c.getContext("2d");
    let w, h, dpr, parts = [], rgb = "157,255,58", prgb = "176,38,255", raf;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
      const n = Math.round(Math.min(70, (innerWidth * innerHeight) / 22000));
      parts = Array.from({ length: n }, () => spawn(true));
    };
    const spawn = (any) => ({
      x: Math.random() * w, y: any ? Math.random() * h : h + 10,
      r: (Math.random() * 1.6 + 0.4) * dpr, vy: (Math.random() * 0.5 + 0.2) * dpr,
      vx: (Math.random() - 0.5) * 0.3 * dpr, a: Math.random() * 0.6 + 0.2, f: Math.random() * Math.PI * 2, alt: Math.random() < 0.55,
    });
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.vy; p.f += 0.02; p.x += p.vx + Math.sin(p.f) * 0.25 * dpr;
        if (p.y < -10) Object.assign(p, spawn(false));
        const fade = Math.min(1, p.y / (h * 0.5));
        const col = p.alt ? prgb : rgb;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${col},${p.a * fade})`;
        ctx.shadowColor = `rgba(${col},0.9)`; ctx.shadowBlur = 8 * dpr;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) tick(); });
    resize(); tick();
    return {
      retint() {
        const cs = getComputedStyle(document.documentElement);
        rgb = cs.getPropertyValue("--accent-rgb").trim().replace(/\s+/g, "") || rgb;
        prgb = cs.getPropertyValue("--purple-rgb").trim().replace(/\s+/g, "") || prgb;
      },
    };
  })();

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  applyTheme();
  paintChrome();
  addEventListener("hashchange", route);
  route();
  checkLive();
  setInterval(checkLive, 5 * 60 * 1000);

  // Atalho escondido do editor: só existe rodando localmente com o servidor de edição
  if (IS_LOCAL && !/[?&]preview=1/.test(location.search)) {
    fetch("/api/ping", { cache: "no-store" })
      .then((r) => r.ok && r.json())
      .then((j) => { editorAvailable = !!(j && j.editor); })
      .catch(() => {});
  }
})();
