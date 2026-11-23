/* =========================================================================
   MAVADO_TV — App (SPA com hash routing, sem dependências)
   Funciona em GitHub Pages, Netlify, Vercel ou qualquer host estático.
   ========================================================================= */
(() => {
  "use strict";

  const D = window.MAVADO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const main = $("#main");

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ytId = (v) => {
    if (!v) return null;
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = String(v).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  };
  const ytUrl = (v) => `https://www.youtube.com/watch?v=${ytId(v)}`;
  const ytThumb = (v) => `https://i.ytimg.com/vi/${ytId(v)}/hqdefault.jpg`;
  const domain = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const ext = (href, label, cls = "btn btn--sm btn--ghost") =>
    `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
  };

  /* ---------------------------------------------------------------------
     Ícones (SVG inline, herdam currentColor)
     --------------------------------------------------------------------- */
  const S = (d, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const I = {
    arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    ext: S('<path d="M7 17 17 7M9 7h8v8"/>'),
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    // Marcas (formas simplificadas, preenchidas)
    twitch: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.57 4.71h1.72v5.15h-1.72zm4.72 0H18v5.15h-1.71zM6 0 1.71 4.29v15.42h5.15V24l4.28-4.29h3.43L22.29 12V0zm14.57 11.14-3.43 3.43h-3.43l-3 3v-3H6.86V1.71h13.71z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z"/></svg>',
    instagram: S('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>', 'stroke-width="2"'),
    mail: S('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    heart: S('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    check: S('<path d="m5 12 5 5 9-10"/>', 'stroke-width="3"'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    // Categorias / seções
    sword: S('<path d="M14.5 3H21v6.5L10 20.5 3.5 14z"/><path d="m7 17-3 3M5 13l6 6"/>'),
    spark: S('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
    mine: S('<path d="m12 2 8.7 5v10L12 22l-8.7-5V7z"/><circle cx="12" cy="12" r="3"/>'),
    bow: S('<path d="M4 20 20 4M14 4h6v6"/><path d="M4 9a11 11 0 0 1 11 11"/>'),
    skull: S('<path d="M12 3a8 8 0 0 0-5 14.3V21h10v-3.7A8 8 0 0 0 12 3z"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><path d="M10 21v-3M14 21v-3"/>'),
    totem: S('<rect x="7" y="3" width="10" height="6" rx="1"/><rect x="6" y="9" width="12" height="6" rx="1"/><path d="M8 15v6h8v-6M10 6h.01M14 6h.01"/>'),
    flask: S('<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>'),
    map: S('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>'),
    tree: S('<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="12" cy="13" r="2"/><path d="M12 7v4M10.5 14.5l-4 3M13.5 14.5l4 3"/>'),
    wrench: S('<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.6-6.7a4 4 0 0 1-5-5L8 3 3 8l3 3"/>'),
    anvil: S('<path d="M3 7h13a5 5 0 0 0 5-3v6a4 4 0 0 1-4 3h-1l1 4H7l1-4a5 5 0 0 1-5-5z"/><path d="M6 21h12"/>'),
    crown: S('<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'),
    rune: S('<circle cx="12" cy="12" r="9"/><path d="M12 3v18M5 7l14 10M19 7 5 17"/><circle cx="12" cy="12" r="3"/>'),
    shield: S('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    orb: S('<circle cx="12" cy="12" r="6"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>'),
    hourglass: S('<path d="M6 3h12M6 21h12M7 3c0 6 10 6 10 9s-10 3-10 9M17 3c0 6-10 6-10 9s10 3 10 9"/>'),
  };

  // Imagens
  const C = D.channel;
  const img = (src, alt = "", cls = "", extra = "") =>
    `<img src="${esc(src)}" alt="${esc(alt)}" class="${cls}" loading="lazy" decoding="async" ${extra} />`;
  const gameById = (id) => D.games.find((g) => g.id === id);
  const catById = (id) => D.poe1.categories.find((c) => c.id === id);
  const HUB = (k) => `assets/img/poe1/hub/${k}.webp`;

  const socialLinks = (cls = "socials") =>
    `<div class="${cls}">${C.socials
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}" data-s="${s.id}">${I[s.id]}</a>`)
      .join("")}</div>`;

  /* ---------------------------------------------------------------------
     Componentes
     --------------------------------------------------------------------- */
  const crumbs = (items) =>
    `<nav class="crumbs" aria-label="Você está em">${items
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

  const buildCard = (b, i) => {
    const cat = catById(b.cat);
    const vid = ytId(b.video);
    const pobBtn = b.pob
      ? ext(b.pob, "PoB " + I.ext, "btn btn--sm")
      : b.pobs ? "" : `<span class="tbd">PoB: em breve</span>`;
    return `
    <article class="card card--link build reveal" style="--d:${i}">
      ${vid ? `<button class="build__thumb" type="button" data-play="${vid}" data-title="${esc(b.skill)}" data-sub="${esc(b.asc + " · " + b.by)}" aria-label="Assistir vídeo: ${esc(b.skill)}">
        <img src="${ytThumb(vid)}" alt="" loading="lazy" width="480" height="360" />
        <span class="build__cat">${esc(cat ? cat.label : b.cat)}</span>
        ${b.br ? `<span class="build__flag">PT-BR</span>` : ""}
        <span class="build__play">${I.play}</span>
      </button>` : ""}
      <div class="build__body">
        ${cat ? img(cat.img, cat.label, "build__medal") : ""}
        <span class="build__asc">${esc(b.asc)}</span>
        <h3>${esc(b.skill)}</h3>
        <span class="build__by">por <a href="${esc(b.byUrl)}" target="_blank" rel="noopener">${esc(b.by)}</a></span>
        ${b.pobs ? `<div class="pob-list">${b.pobs.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join("")}</div>` : ""}
        <div class="build__actions">
          ${pobBtn}
          ${vid ? ext(ytUrl(vid), "YouTube " + I.ext) : ""}
        </div>
      </div>
    </article>`;
  };

  const linkItem = (it, i) => `
    <a class="card card--link item item--img reveal" href="${esc(it.url)}" target="_blank" rel="noopener" style="--d:${i}">
      ${it.img ? img(it.img, "", "item__img") : ""}
      <div class="item__main">
      <div class="item__top">
        <span class="item__type">${esc(it.type || "Link")}</span>
        ${it.badge ? `<span class="item__badge">${esc(it.badge)}</span>` : ""}
      </div>
      <h3>${esc(it.name)} ${I.ext}</h3>
      ${it.sub ? `<span class="item__sub">${esc(it.sub)}</span>` : ""}
      <p>${esc(it.desc)}</p>
      <span class="item__domain">${esc(domain(it.url))}</span>
      </div>
    </a>`;

  // Painéis da live: Seja Sub / Doar + parceiros
  const panelsRow = () => `
    <div class="panels">
      <a class="panel reveal" href="${C.subUrl}" target="_blank" rel="noopener">
        ${img(C.panels.sub, "Seja Sub")}<span>Seja sub na Twitch ${I.ext}</span>
      </a>
      <a class="panel reveal" href="${C.donateUrl}" target="_blank" rel="noopener" style="--d:1">
        ${img(C.panels.donate, "Doar")}<span>Doe para o Mavado (LivePix) ${I.ext}</span>
      </a>
      ${C.partners
        .map(
          (p, i) => `<a class="panel panel--partner reveal" href="${esc(p.url)}" target="_blank" rel="noopener" style="--d:${i + 2}">
            ${img(p.img, p.name)}<span><b>${esc(p.name)}</b> · ${esc(p.desc)}</span>
          </a>`
        )
        .join("")}
    </div>`;

  const supportStrip = () => `
    <section class="section wrap">
      <div class="sec-head">
        <div><span class="eyebrow">Apoie a live</span><h2>Curtiu? Fortalece o canal</h2></div>
        <p>Sub, doação ou os links dos parceiros: tudo ajuda a manter a live e este hub no ar.</p>
      </div>
      ${panelsRow()}
    </section>`;

  /* ---------------------------------------------------------------------
     Páginas
     --------------------------------------------------------------------- */
  const totalBuilds = D.poe1.builds.length + 1;
  const totalStrats = D.poe1.atlas.reduce((n, p) => n + p.strats.length, 0);

  const pages = {
    home() {
      const mb = D.poe1.mavadoBuild;
      return `
      <div class="hero-bg" aria-hidden="true" style="background-image:url('${C.img.banner}')"></div>
      <section class="hero wrap">
        <div class="hero__grid">
          <div>
            ${img(C.img.logo, "Mavado_TV", "hero__logo", 'loading="eager" width="663" height="331"')}
            <span class="eyebrow">Streamer · ARPG · Builds</span>
            <h1>Bem-vindo,<br/><span class="glitch" data-text="Exilado">Exilado</span></h1>
            <p class="hero__lead">O hub do <strong>Mavado_TV</strong>: builds de criadores de conteúdo, Atlas para o seu starter e endgame, série completa de craft e as ferramentas de QoL que fazem diferença na liga.</p>
            <div class="hero__cta">
              <a class="btn" href="#/poe1/builds">${I.sword} Ver builds</a>
              <a class="btn btn--twitch" href="${D.channel.twitchUrl}" target="_blank" rel="noopener">${I.twitch} Assistir</a>
            </div>
            <div class="hero__stats">
              <div class="stat"><b data-count="${totalBuilds}">0</b><span>Builds PoE</span></div>
              <div class="stat"><b data-count="${totalStrats}">0</b><span>Farms de Atlas</span></div>
              <div class="stat"><b data-count="${D.poe1.craft.videos.length}">0</b><span>Aulas de craft</span></div>
              <div class="stat"><b data-count="${D.poe1.tools.length}">0</b><span>Ferramentas</span></div>
            </div>
          </div>
          <div class="card stream reveal">
            <div class="stream__bar">
              <span class="rec" id="streamRec">${img(C.img.avatar, "", "rec__avatar")}<i></i><span>twitch.tv/${esc(C.twitch)}</span></span>
              <span id="streamState">STANDBY</span>
            </div>
            <div class="stream__frame" id="streamFrame">
              <span class="corner corner--tl"></span><span class="corner corner--br"></span>
              <div class="stream__placeholder" style="background-image:url('${C.img.banner}')">
                <button type="button" id="streamLoad">
                  <span class="play">${I.play}</span>
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
          ${D.games
            .map(
              (g, i) => `
            <a class="card card--link game reveal" data-g="${g.id}" href="#/${g.id}" style="--d:${i}">
              <div class="game__art"></div>
              <div class="game__logo">${img(g.logo, g.name)}</div>
              <span class="game__tag ${g.status === "soon" ? "game__tag--soon" : ""}">${g.status === "soon" ? "Em breve" : "Disponível"}</span>
              <h3>${esc(g.name)}</h3>
              <p>${esc(g.tagline)}</p>
              <span class="game__go">${g.status === "soon" ? "Saiba mais" : "Entrar"} ${I.arrow}</span>
            </a>`
            )
            .join("")}
        </div>
      </section>

      <section class="section section--tight wrap">
        <div class="sec-head">
          <div><span class="eyebrow">02 // Em destaque</span><h2>A build da live</h2></div>
        </div>
        <div class="card feature reveal">
          <div class="feature__avatar">${img(C.img.avatar, "Mavado")}<span>${I.crown}</span></div>
          <div>
            <span class="eyebrow">Build do Mavado · PoE 1</span>
            <h3>${esc(mb.skill)}</h3>
            <p>${esc(mb.asc)} — a build que o seu streamer favorito está jogando agora.</p>
          </div>
          <div class="feature__actions">
            ${ext(mb.pob, "Abrir PoB " + I.ext, "btn")}
            <a class="btn btn--ghost" href="#/poe1/builds">Todas as builds</a>
          </div>
        </div>
      </section>

      <section class="section section--tight wrap">
        <div class="sec-head">
          <div><span class="eyebrow">03 // Acesso rápido</span><h2>Atalhos</h2></div>
        </div>
        <div class="tiles">
          ${[
            ["#/poe1/atlas", HUB("atlas"), "Atlas", "Do league start ao farm de divines."],
            ["#/poe1/craft", HUB("craft"), "Craft", "Série em 16 partes, do básico ao Harvest."],
            ["#/poe1/genesis", HUB("genesis"), "Genesis Tree", "Trees para farmar uniques e currency."],
            ["#/d4/builds", "assets/img/d4/builds.webp", "Leveling D4", "Uma build de leveling por classe."],
          ]
            .map(
              ([h, ic, t, d], i) => `
            <a class="card card--link tile reveal" href="${h}" style="--d:${i}">
              <span class="tile__img">${img(ic, "")}</span><h3>${t}</h3><p>${d}</p>
            </a>`
            )
            .join("")}
        </div>
      </section>

      <section class="section section--tight wrap">
        <div class="card about reveal">
          <div class="about__avatar">${img(C.img.avatar, "Avatar do Mavado")}</div>
          <div class="about__text">
            <span class="eyebrow">04 // Quem é o Mavado</span>
            <h2>Ensinar e aprender junto</h2>
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

    poe1() {
      const p = D.poe1;
      const tiles = [
        ["#/poe1/builds", HUB("builds"), "Builds", "Build do Mavado + builds por arquétipo.", totalBuilds],
        ["#/poe1/atlas", HUB("atlas"), "Atlas", "Trees de Atlas por fase da liga.", totalStrats],
        ["#/poe1/genesis", HUB("genesis"), "Genesis Tree", "Farm de uniques e currency.", p.genesis.length],
        ["#/poe1/utilitarios", HUB("utilitarios"), "Utilitários", "Overlays, calculadoras e programas.", p.tools.length],
        ["#/poe1/craft", HUB("craft"), "Craft", "Série completa de craft por Sasaki.", p.craft.videos.length],
      ];
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["Path of Exile 1"]],
        eyebrow: "Hub do jogo",
        title: `Path of <span class="hl">Exile 1</span>`,
        lead: esc(D.games[0].about),
        logo: gameById("poe1").logo,
      })}
      <section class="section section--tight wrap">
        <div class="tiles">
          ${tiles
            .map(
              ([h, ic, t, d, n], i) => `
            <a class="card card--link tile reveal" href="${h}" style="--d:${i}">
              <span class="tile__count">${String(n).padStart(2, "0")}</span>
              <span class="tile__img">${img(ic, "")}</span><h3>${t}</h3><p>${d}</p>
            </a>`
            )
            .join("")}
        </div>
      </section>
      <section class="section section--tight wrap">
        <div class="card feature reveal">
          <div class="feature__avatar">${img(C.img.avatar, "Mavado")}<span>${I.crown}</span></div>
          <div>
            <span class="eyebrow">Build atual do streamer</span>
            <h3>${esc(p.mavadoBuild.skill)}</h3>
            <p>${esc(p.mavadoBuild.asc)}</p>
          </div>
          <div class="feature__actions">${ext(p.mavadoBuild.pob, "Abrir PoB " + I.ext, "btn")}</div>
        </div>
      </section>`;
    },

    builds(params, query) {
      const p = D.poe1;
      const active = params[0] && p.categories.some((c) => c.id === params[0]) ? params[0] : "all";
      const counts = Object.fromEntries(p.categories.map((c) => [c.id, p.builds.filter((b) => b.cat === c.id).length]));
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["PoE 1", "#/poe1"], ["Builds"]],
        eyebrow: "Path of Exile 1",
        title: `Builds`,
        icon: HUB("builds"),
        lead: "League starters e builds de endgame dos melhores criadores de conteúdo. Clique na capa para assistir o guia sem sair do site.",
      })}
      <section class="section section--tight wrap">
        <div class="card feature reveal" style="margin-bottom:32px">
          <div class="feature__avatar">${img(C.img.avatar, "Mavado")}<span>${I.crown}</span></div>
          <div>
            <span class="eyebrow">Build do Mavado</span>
            <h3>${esc(p.mavadoBuild.skill)}</h3>
            <p>${esc(p.mavadoBuild.asc)} — a build atual do seu streamer favorito, <a href="${D.channel.twitchUrl}" target="_blank" rel="noopener" style="color:var(--accent)">@Mavado_TV</a>.</p>
          </div>
          <div class="feature__actions">${ext(p.mavadoBuild.pob, "Abrir PoB " + I.ext, "btn")}</div>
        </div>

        <div class="toolbar">
          <div class="chips" role="group" aria-label="Filtrar por categoria">
            <button class="chip" type="button" data-cat="all" aria-pressed="${active === "all"}">Todas <small>${p.builds.length}</small></button>
            ${p.categories
              .map((c) => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${active === c.id}">${img(c.img, "", "chip__img")}${c.label} <small>${counts[c.id]}</small></button>`)
              .join("")}
          </div>
          <label class="filter-input">
            ${I.search}
            <input id="buildFilter" type="search" placeholder="Filtrar por skill, classe ou criador" value="${esc(query.q || "")}" aria-label="Filtrar builds" />
          </label>
        </div>
        <p class="cat-desc" id="catDesc"></p>
        <div class="builds" id="buildGrid"></div>
      </section>`;
    },

    atlas(params) {
      const phases = D.poe1.atlas;
      const active = phases.find((p) => p.id === params[0]) ? params[0] : phases[0].id;
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["PoE 1", "#/poe1"], ["Atlas"]],
        eyebrow: "Path of Exile 1",
        title: `Atlas`,
        icon: HUB("atlas"),
        lead: "Trees e estratégias de farm para cada momento da liga — do primeiro mapa ao farm de divines.",
      })}
      <section class="section section--tight wrap">
        <div class="phases" role="tablist" aria-label="Fase da liga">
          ${phases
            .map(
              (p, i) => `<button class="phase" role="tab" type="button" data-phase="${p.id}" aria-selected="${p.id === active}">
                ${img(p.img, "", "phase__img")}<small>Fase ${String(i + 1).padStart(2, "0")} · ${esc(p.phase)}</small><b>${esc(p.label)}</b></button>`
            )
            .join("")}
        </div>
        <div id="atlasPanel" role="tabpanel"></div>
      </section>`;
    },

    genesis() {
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["PoE 1", "#/poe1"], ["Genesis Tree"]],
        eyebrow: "Path of Exile 1",
        title: `Genesis <span class="hl">Tree</span>`,
        icon: HUB("genesis"),
        lead: "Trees prontas para focar o farm no que você quer ver cair. Todas abrem no planner da Maxroll.",
      })}
      <section class="section section--tight wrap">
        <div class="list-grid">
          ${D.poe1.genesis
            .map(
              (g, i) => `
            <a class="card card--link item genesis reveal" href="${esc(g.url)}" target="_blank" rel="noopener" style="--d:${i}">
              <span class="genesis__img">${img(g.img, g.tag)}</span>
              <div>
                <span class="item__type">${esc(g.tag)}</span>
                <h3>${esc(g.name)} ${I.ext}</h3>
                <p>${esc(g.desc)}</p>
                <span class="item__domain">maxroll.gg</span>
              </div>
            </a>`
            )
            .join("")}
        </div>
      </section>`;
    },

    utilitarios() {
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["PoE 1", "#/poe1"], ["Utilitários"]],
        eyebrow: "Path of Exile 1",
        title: `Utilitários`,
        icon: HUB("utilitarios"),
        lead: "Programas, overlays e sites que deixam a sua liga mais fácil.",
      })}
      <section class="section section--tight wrap">
        <div class="list-grid">${D.poe1.tools.map(linkItem).join("")}</div>
      </section>`;
    },

    craft() {
      const c = D.poe1.craft;
      const done = new Set(store.get("mv-craft-done", []));
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["PoE 1", "#/poe1"], ["Craft"]],
        eyebrow: "Série completa · PT-BR",
        title: `Craft`,
        icon: HUB("craft"),
        lead: `${esc(c.intro.replace("Sasaki", "\u0000"))}`.replace("\u0000", `<a href="${c.author[1]}" target="_blank" rel="noopener" class="hl">Sasaki</a>`),
      })}
      <section class="section section--tight wrap">
        <div class="card craft-top reveal">
          <div class="progress">
            <div class="progress__label"><span>Seu progresso</span><span><b id="craftCount">${done.size}</b> / ${c.videos.length} aulas</span></div>
            <div class="progress__bar"><i id="craftBar" style="width:${(done.size / c.videos.length) * 100}%"></i></div>
          </div>
          ${ext(c.author[1], `Canal do Sasaki ${I.ext}`)}
        </div>
        <div class="episodes">
          ${c.videos
            .map(
              ([id, title], i) => `
            <article class="card card--link ep reveal ${done.has(id) ? "is-done" : ""}" data-ep="${id}" style="--d:${i}">
              <button class="build__thumb" type="button" data-play="${id}" data-title="Parte ${i + 1} — ${esc(title)}" data-sub="Craft no PoE 1 · Sasaki" aria-label="Assistir parte ${i + 1}: ${esc(title)}">
                <img src="${ytThumb(id)}" alt="" loading="lazy" width="480" height="360" />
                <span class="ep__num"><small>Parte</small>${String(i + 1).padStart(2, "0")}</span>
                <span class="build__play">${I.play}</span>
              </button>
              <div class="ep__body">
                <p>${esc(title)}</p>
                <button class="check" type="button" data-done="${id}" aria-pressed="${done.has(id)}" aria-label="Marcar parte ${i + 1} como assistida">${I.check}</button>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>`;
    },

    d4() {
      const d = D.d4;
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["Diablo 4"]],
        eyebrow: "Hub do jogo",
        title: `Diablo <span class="hl">4</span>`,
        lead: esc(D.games[1].about),
        logo: gameById("d4").logo,
      })}
      <section class="section section--tight wrap">
        <div class="tiles">
          <a class="card card--link tile reveal" href="#/d4/builds">
            <span class="tile__count">${String(d.classes.length).padStart(2, "0")}</span>
            <span class="tile__img">${img("assets/img/d4/builds.webp", "")}</span><h3>Builds</h3><p>Leveling builds para todas as classes.</p>
          </a>
          <a class="card card--link tile reveal" href="#/d4/runewords">
            <span class="tile__count">${esc(d.runewords.season.replace("Season ", "S"))}</span>
            <span class="tile__img">${img("assets/img/d4/runeword.webp", "")}</span><h3>Runewords</h3><p>Receitas de Runeword da ${esc(d.runewords.season)}.</p>
          </a>
        </div>
      </section>`;
    },

    d4builds() {
      const d = D.d4;
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["Diablo 4", "#/d4"], ["Builds"]],
        eyebrow: "Diablo 4 · Leveling",
        title: `Leveling <span class="hl">Builds</span>`,
        icon: "assets/img/d4/builds.webp",
        lead: "Uma build de leveling recomendada para cada classe. Escolha a sua e suba rápido.",
      })}
      <section class="section section--tight wrap">
        <div class="classes">
          ${d.classes
            .map(
              (c, i) => `
            <a class="card card--link cls reveal" href="${esc(c.url)}" target="_blank" rel="noopener" style="--d:${i}">
              <span class="cls__mono" aria-hidden="true">${esc(c.name[0])}</span>
              ${img(c.img, "", "cls__img")}
              <span class="cls__src">${esc(c.src)}</span>
              <h3>${esc(c.name)}</h3>
              <p>${esc(c.build)}</p>
              <span class="cls__go">Abrir guia ${I.ext}</span>
            </a>`
            )
            .join("")}
        </div>
      </section>
      <section class="section section--tight wrap">
        <div class="card banner reveal">
          <div>
            <span class="eyebrow">Tierlist</span>
            <h2>Qual classe upar primeiro?</h2>
            <p>Confira a tierlist de leveling em vídeo antes de escolher o seu personagem.</p>
          </div>
          <button class="btn" type="button" data-play="${ytId(d.tierlist.video)}" data-title="${esc(d.tierlist.label)}" data-sub="Diablo 4">${I.play.replace("<svg", '<svg fill="currentColor"')} Assistir tierlist</button>
        </div>
      </section>`;
    },

    runewords() {
      const r = D.d4.runewords;
      return `
      ${pageHead({
        crumbs: [["Início", "#/"], ["Diablo 4", "#/d4"], ["Runewords"]],
        eyebrow: `Diablo 4 · ${r.season}`,
        title: `Runeword <span class="hl">Recipes</span>`,
        icon: "assets/img/d4/runeword.webp",
      })}
      <section class="section section--tight wrap">
        <div class="card banner reveal">
          <div class="banner__rune">${I.rune.replace('stroke-width="1.8"', 'stroke-width="0.6"')}</div>
          <div>
            <span class="eyebrow">${esc(r.season)}</span>
            <h2>${esc(r.title)}</h2>
            <p>${esc(r.desc)}</p>
          </div>
          ${ext(r.url, `Ver lista completa ${I.ext}`, "btn")}
        </div>
      </section>
      <section class="section section--tight wrap">
        <a class="card card--link recipe reveal" href="${esc(r.img)}" target="_blank" rel="noopener" title="Abrir imagem em tamanho real">
          ${img(r.img, "Tabela de receitas de Runeword da " + r.season)}
          <span class="recipe__hint">Clique para ampliar ${I.ext}</span>
        </a>
      </section>`;
    },

    soon(gameId) {
      const g = D.games.find((x) => x.id === gameId);
      return `
      <section class="soon wrap">
        ${crumbs([["Início", "#/"], [g.name]]).replace('class="crumbs"', 'class="crumbs" style="justify-content:center"')}
        <div class="soon__logo">${img(g.logo, g.name, "", 'loading="eager"')}</div>
        <div class="term">// carregando_conteúdo</div>
        <h1>${esc(g.name)}</h1>
        <p>${esc(g.about)}</p>
        <div class="hero__cta" style="justify-content:center">
          <a class="btn btn--twitch" href="${D.channel.twitchUrl}" target="_blank" rel="noopener">${I.twitch} Acompanhe na live</a>
          <a class="btn btn--ghost" href="#/">Voltar ao início</a>
        </div>
      </section>`;
    },

    canal() {
      return `
      <div class="hero-bg hero-bg--short" aria-hidden="true" style="background-image:url('${C.img.banner}')"></div>
      <section class="channel wrap">
        ${crumbs([["Início", "#/"], ["O canal"]])}
        <div class="channel__head">
          <div class="channel__avatar">${img(C.img.avatar, "Avatar do Mavado", "", 'loading="eager"')}</div>
          <div>
            ${img(C.img.logo, "Mavado_TV", "channel__logo", 'loading="eager"')}
            <p class="channel__meta"><span>Equipe <b>${esc(C.team)}</b></span><span>ActionRPG · PT-BR</span></p>
            <p class="channel__bio">${esc(C.bio)}</p>
            <div class="channel__actions">
              <a class="btn btn--twitch" href="${C.twitchUrl}" target="_blank" rel="noopener">${I.twitch} Seguir na Twitch</a>
              ${socialLinks()}
            </div>
          </div>
        </div>
      </section>

      <section class="section section--tight wrap">
        <div class="info-grid">
          <article class="card info reveal">
            ${img(C.panels.hardware, "Hardware", "info__panel")}
            <dl class="setup">${C.setup.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
          </article>
          <article class="card info reveal" style="--d:1">
            ${img(C.panels.rules, "Regras", "info__panel")}
            <ol class="rules">${C.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
          </article>
          <article class="card info reveal" style="--d:2">
            ${img(C.panels.contact, "Contato", "info__panel")}
            <p class="info__text">Parcerias, publicidade e assuntos comerciais:</p>
            <a class="btn btn--ghost btn--sm mail" href="mailto:${esc(C.contact)}">${I.mail} ${esc(C.contact)}</a>
          </article>
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
     Comportamentos por página (montados após render)
     --------------------------------------------------------------------- */
  const mount = {
    home() {
      $("#streamLoad")?.addEventListener("click", loadStream);
      paintLive();
    },

    builds(params, query) {
      const p = D.poe1;
      let cat = params[0] && p.categories.some((c) => c.id === params[0]) ? params[0] : "all";
      const grid = $("#buildGrid");
      const input = $("#buildFilter");
      const desc = $("#catDesc");

      const draw = () => {
        const q = norm(input.value.trim());
        const list = p.builds.filter(
          (b) => (cat === "all" || b.cat === cat) && (!q || norm(`${b.skill} ${b.asc} ${b.by} ${b.cat}`).includes(q))
        );
        const c = p.categories.find((x) => x.id === cat);
        desc.textContent = c ? c.desc : "Todas as builds, de todos os arquétipos.";
        desc.classList.toggle("is-warn", cat === "lab");
        grid.innerHTML = list.length
          ? list.map(buildCard).join("")
          : `<div class="empty" style="grid-column:1/-1">Nenhuma build encontrada para “${esc(input.value)}”.</div>`;
        reveal(grid);
      };

      $$(".chip[data-cat]").forEach((btn) =>
        btn.addEventListener("click", () => {
          cat = btn.dataset.cat;
          $$(".chip[data-cat]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
          history.replaceState(null, "", `#/poe1/builds${cat === "all" ? "" : "/" + cat}`);
          draw();
        })
      );
      input.addEventListener("input", draw);
      draw();
      if (query.q) input.focus();
    },

    atlas(params) {
      const phases = D.poe1.atlas;
      const panel = $("#atlasPanel");
      const draw = (id) => {
        const ph = phases.find((p) => p.id === id) || phases[0];
        $$(".phase").forEach((b) => b.setAttribute("aria-selected", b.dataset.phase === ph.id));
        panel.innerHTML = `
          <p class="atlas-intro">${esc(ph.intro)}</p>
          <div class="strats">
            ${ph.strats
              .map(
                (s, i) => `
              <article class="card strat reveal" style="--d:${i}">
                <h3>${esc(s.name)}</h3>
                ${s.credit ? `<span class="strat__credit">Feito por <a href="${esc(s.credit[1])}" target="_blank" rel="noopener">${esc(s.credit[0])}</a></span>` : ""}
                ${s.map || s.threads ? `<dl class="spec">
                  ${s.map ? `<dt>Mapa</dt><dd>${esc(s.map)}</dd>` : ""}
                  ${s.threads ? `<dt>Threads</dt><dd><ul>${s.threads.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></dd>` : ""}
                </dl>` : ""}
                <p class="strat__notes">${esc(s.notes)}</p>
                <div class="strat__actions">
                  ${ext(s.url, `${/youtu/.test(s.url) ? "Ver vídeo" : "Abrir Atlas"} ${I.ext}`, "btn btn--sm")}
                  ${s.extra ? ext(s.extra[1], `${esc(s.extra[0])} ${I.ext}`) : ""}
                </div>
              </article>`
              )
              .join("")}
          </div>`;
        reveal(panel);
      };
      $$(".phase").forEach((b) =>
        b.addEventListener("click", () => {
          history.replaceState(null, "", `#/poe1/atlas/${b.dataset.phase}`);
          draw(b.dataset.phase);
        })
      );
      draw(params[0]);
    },

    craft() {
      const total = D.poe1.craft.videos.length;
      $$("[data-done]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const done = new Set(store.get("mv-craft-done", []));
          const id = btn.dataset.done;
          done.has(id) ? done.delete(id) : done.add(id);
          store.set("mv-craft-done", [...done]);
          btn.setAttribute("aria-pressed", done.has(id));
          btn.closest(".ep").classList.toggle("is-done", done.has(id));
          $("#craftCount").textContent = done.size;
          $("#craftBar").style.width = `${(done.size / total) * 100}%`;
        })
      );
    },
  };

  /* ---------------------------------------------------------------------
     Router
     --------------------------------------------------------------------- */
  const ROUTES = [
    [/^$/, "home", "home"],
    [/^poe1$/, "poe1", "poe1"],
    [/^poe1\/builds(?:\/([\w-]+))?$/, "builds", "poe1"],
    [/^poe1\/atlas(?:\/([\w-]+))?$/, "atlas", "poe1"],
    [/^poe1\/genesis$/, "genesis", "poe1"],
    [/^poe1\/utilitarios$/, "utilitarios", "poe1"],
    [/^poe1\/craft$/, "craft", "poe1"],
    [/^d4$/, "d4", "d4"],
    [/^d4\/builds$/, "d4builds", "d4"],
    [/^d4\/runewords$/, "runewords", "d4"],
    [/^canal$/, "canal", "canal"],
    [/^poe2$/, "soon:poe2", "poe2"],
    [/^hellclock$/, "soon:hellclock", "hellclock"],
  ];

  const TITLES = {
    home: "Builds, Atlas e Guias de ARPG", poe1: "Path of Exile 1", builds: "Builds · PoE 1", atlas: "Atlas · PoE 1",
    genesis: "Genesis Tree · PoE 1", utilitarios: "Utilitários · PoE 1", craft: "Craft · PoE 1", d4: "Diablo 4",
    d4builds: "Leveling Builds · Diablo 4", runewords: "Runewords · Diablo 4", "soon:poe2": "Path of Exile 2",
    "soon:hellclock": "HellClock", canal: "O canal", notFound: "Página não encontrada",
  };

  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [pathPart, qs = ""] = raw.split("?");
    const path = pathPart.replace(/\/+$/, "");
    const query = Object.fromEntries(new URLSearchParams(qs));

    let page = "notFound", game = "home", params = [];
    for (const [re, name, g] of ROUTES) {
      const m = path.match(re);
      if (m) { page = name; game = g; params = m.slice(1).filter(Boolean); break; }
    }

    document.body.dataset.game = game;
    $$(".nav a").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === game));
    closeMenu();

    main.innerHTML = page.startsWith("soon:") ? pages.soon(page.split(":")[1]) : pages[page](params, query);
    document.title = `${TITLES[page]} | Mavado_TV`;
    mount[page]?.(params, query);
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
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(`https://decapi.me/twitch/uptime/${D.channel.twitch}`, { signal: ctrl.signal });
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
    if (!host) { window.open(D.channel.twitchUrl, "_blank", "noopener"); return; }
    frame.insertAdjacentHTML(
      "beforeend",
      `<iframe src="https://player.twitch.tv/?channel=${D.channel.twitch}&parent=${encodeURIComponent(host)}&muted=false" allowfullscreen allow="autoplay; fullscreen" title="Live do Mavado_TV na Twitch"></iframe>`
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
     --------------------------------------------------------------------- */
  const INDEX = (() => {
    const out = [];
    const catLabel = (id) => D.poe1.categories.find((c) => c.id === id)?.label || id;
    out.push({ type: "Página", title: "Path of Exile 1", sub: "Hub do jogo", href: "#/poe1" });
    out.push({ type: "Página", title: "Diablo 4", sub: "Hub do jogo", href: "#/d4" });
    out.push({ type: "Página", title: "Atlas", sub: "PoE 1 · Trees por fase da liga", href: "#/poe1/atlas" });
    out.push({ type: "Página", title: "Craft", sub: "PoE 1 · Série do Sasaki", href: "#/poe1/craft" });
    out.push({ type: "Página", title: "Runewords", sub: `Diablo 4 · ${D.d4.runewords.season}`, href: "#/d4/runewords" });
    out.push({ type: "Build", title: `${D.poe1.mavadoBuild.skill} — ${D.poe1.mavadoBuild.asc}`, sub: "Build do Mavado", href: D.poe1.mavadoBuild.pob, external: true });
    D.poe1.builds.forEach((b) =>
      out.push({ type: "Build PoE", title: `${b.skill} — ${b.asc}`, sub: `${catLabel(b.cat)} · ${b.by}`, href: `#/poe1/builds/${b.cat}?q=${encodeURIComponent(b.skill)}` })
    );
    D.poe1.atlas.forEach((p) =>
      p.strats.forEach((s) => out.push({ type: "Atlas", title: s.name, sub: `${p.label}${s.map ? " · " + s.map : ""}`, href: `#/poe1/atlas/${p.id}` }))
    );
    D.poe1.genesis.forEach((g) => out.push({ type: "Genesis", title: g.name, sub: g.tag, href: g.url, external: true }));
    D.poe1.tools.forEach((t) => out.push({ type: "Ferramenta", title: t.name, sub: t.desc, href: t.url, external: true }));
    D.poe1.craft.videos.forEach(([id, t], i) => out.push({ type: "Craft", title: `Parte ${i + 1} — ${t}`, sub: "Vídeo · Sasaki", play: id }));
    D.d4.classes.forEach((c) => out.push({ type: "Build D4", title: `${c.name} — ${c.build}`, sub: `Leveling · ${c.src}`, href: c.url, external: true }));
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
    const q = norm(sInput.value.trim());
    const terms = q.split(/\s+/).filter(Boolean);
    results = terms.length ? INDEX.filter((o) => terms.every((t) => o._k.includes(t))).slice(0, 30) : INDEX.filter((o) => o.type === "Página");
    sel = 0;
    sList.innerHTML = results.length
      ? results
          .map(
            (r, i) => `<li><a href="${r.play ? "#" : esc(r.href)}" ${r.external ? 'target="_blank" rel="noopener"' : ""} ${r.play ? `data-sres-play="${r.play}"` : ""} data-i="${i}" role="option" aria-selected="${i === 0}">
              <span class="r-type">${esc(r.type)}</span>
              <span class="r-main"><b>${hl(r.title, terms[0])}</b><small>${esc(r.sub)}</small></span>
              ${r.external ? I.ext.replace("<svg", '<svg width="14" height="14"') : ""}
            </a></li>`
          )
          .join("")
      : `<li class="search__hint">Nada encontrado. Tente “cyclone”, “legion” ou “overlay”.</li>`;
  }
  function moveSel(d) {
    const items = $$("a[data-i]", sList);
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    items.forEach((a, i) => a.setAttribute("aria-selected", i === sel));
    items[sel].scrollIntoView({ block: "nearest" });
  }
  function openSearch() {
    lastFocus = document.activeElement;
    search.hidden = false;
    document.body.style.overflow = "hidden";
    sInput.value = "";
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
    else closeSearch();
  });
  $$("[data-close]", search).forEach((el) => el.addEventListener("click", closeSearch));
  $("#searchOpen").addEventListener("click", openSearch);

  document.addEventListener("keydown", (e) => {
    const typing = /input|textarea|select/i.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.hidden ? openSearch() : closeSearch(); }
    else if (e.key === "/" && !typing && search.hidden) { e.preventDefault(); openSearch(); }
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
     Fundo: brasas subindo (cor acompanha o jogo)
     --------------------------------------------------------------------- */
  const embers = (() => {
    const c = $("#embers");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!c.getContext || reduce) return { retint() {} };
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
        ctx.beginPath();
        const col = p.alt ? prgb : rgb;
        ctx.fillStyle = `rgba(${col},${p.a * fade})`;
        ctx.shadowColor = `rgba(${col},0.9)`; ctx.shadowBlur = 8 * dpr;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) tick(); });
    resize(); tick();
    return { retint() { rgb = getComputedStyle(document.body).getPropertyValue("--accent-rgb").trim() || rgb; } };
  })();

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  $("#year").textContent = new Date().getFullYear();
  addEventListener("hashchange", route);
  route();
  checkLive();
  setInterval(checkLive, 5 * 60 * 1000);
})();
