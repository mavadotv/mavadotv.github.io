/* =========================================================================
   MAVADO_TV — Editor visual (roda só localmente, via editor/server.mjs)
   ========================================================================= */
(() => {
  "use strict";

  const TOKEN = document.querySelector('meta[name="editor-token"]').content;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "style") el.style.cssText = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }
  const icon = (d) => {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.innerHTML = d;
    return s;
  };
  const IC = {
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 1 0 0 20c1 0 1.5-.8 1.5-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.5 1.6-1.5H16a6 6 0 0 0 6-6c0-4.9-4.5-8.5-10-8.5z"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
  };
  const TYPE_ICON = { builds: "⚔", phases: "🗺", cards: "🔗", videos: "▶", feature: "★" };

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const slug = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const ytId = (v) => {
    if (!v) return "";
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = String(v).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : "";
  };
  const list = (a) => (Array.isArray(a) ? a : []);
  const uniqueId = (base, arr, key = "id") => {
    let id = slug(base) || "item", n = 1;
    const ids = new Set(arr.map((x) => x[key]));
    while (ids.has(id)) id = `${slug(base) || "item"}-${++n}`;
    return id;
  };

  async function api(path, opts = {}) {
    const r = await fetch(path, {
      method: opts.method || "GET",
      headers: { "X-Editor-Token": TOKEN, ...(opts.json !== undefined ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) },
      body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || `Erro ${r.status}`), { data: j });
    return j;
  }

  let toastT;
  function toast(msg, kind = "") {
    const t = $("#toast");
    t.textContent = msg;
    t.className = `toast ${kind ? "is-" + kind : ""}`;
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.hidden = true), 3200);
  }

  /* ---------------------------------------------------------------------
     Estado
     --------------------------------------------------------------------- */
  let data = null;
  let savedJSON = "";
  let current = { kind: "home" };
  const history = [];
  let lastSnap = "";

  const isDirty = () => JSON.stringify(data) !== savedJSON;
  function setState(state, text) {
    const el = $("#state");
    el.dataset.state = state;
    $("span", el).textContent = text;
  }
  function refreshState() {
    const d = isDirty();
    $("#saveBtn").disabled = !d;
    $("#undoBtn").disabled = history.length === 0;
    setState(d ? "dirty" : "saved", d ? "Alterações não salvas" : "Tudo salvo");
  }

  let snapT, previewT, treeT;
  function changed({ tree = false } = {}) {
    clearTimeout(snapT);
    snapT = setTimeout(() => {
      const now = JSON.stringify(data);
      if (now !== lastSnap) { history.push(lastSnap); if (history.length > 80) history.shift(); lastSnap = now; }
      refreshState();
    }, 450);
    refreshState();
    clearTimeout(previewT);
    previewT = setTimeout(pushPreview, 500);
    if (tree) { clearTimeout(treeT); treeT = setTimeout(renderTree, 250); }
  }

  function undo() {
    if (!history.length) return;
    const prev = history.pop();
    data = JSON.parse(prev);
    lastSnap = prev;
    validateCurrent();
    renderAll();
    pushPreview();
    refreshState();
    toast("Alteração desfeita");
  }

  /* ---------------------------------------------------------------------
     Prévia ao vivo
     --------------------------------------------------------------------- */
  const frame = $("#frame");
  let previewRoute = "";
  async function pushPreview() {
    try {
      await api("/api/draft", { method: "POST", json: data });
      reloadFrame();
    } catch (e) { toast("Não foi possível atualizar a prévia: " + e.message, "err"); }
  }
  function reloadFrame() {
    let y = 0;
    try { y = frame.contentWindow.scrollY; } catch { /* ignora */ }
    frame.addEventListener("load", function once() {
      frame.removeEventListener("load", once);
      setTimeout(() => { try { frame.contentWindow.scrollTo(0, y); } catch { /* ignora */ } }, 350);
    });
    frame.src = `/preview?preview=1&t=${Date.now()}#/${previewRoute}`;
  }
  function routeFor(node) {
    if (node.kind === "home" || node.kind === "theme" || node.kind === "site") return "";
    if (node.kind === "channel") return "canal";
    const g = data.games[node.gi];
    if (!g) return "";
    if (node.kind === "section") { const s = g.sections[node.si]; return s ? `${g.id}/${s.id}` : g.id; }
    return g.id;
  }
  function navigatePreview() {
    const r = routeFor(current);
    if (r === previewRoute) return;
    previewRoute = r;
    try { frame.contentWindow.location.hash = `#/${r}`; } catch { reloadFrame(); }
  }

  /* ---------------------------------------------------------------------
     Opções dinâmicas
     --------------------------------------------------------------------- */
  const routeOptions = () => {
    const out = [["", "— nenhum —"]];
    list(data.games).forEach((g) => {
      out.push([g.id, `${g.name} (hub do jogo)`]);
      list(g.sections).forEach((s) => out.push([`${g.id}/${s.id}`, `${g.name} › ${s.title}`]));
    });
    out.push(["canal", "Página do canal"]);
    return out;
  };
  const sectionRoutes = () => {
    const out = [];
    list(data.games).forEach((g) => list(g.sections).forEach((s) => out.push([`${g.id}/${s.id}`, `${g.short || g.name} › ${s.title}`, s.icon])));
    return out;
  };

  /* ---------------------------------------------------------------------
     Esquemas dos formulários
     --------------------------------------------------------------------- */
  const F = {
    text: (k, label, o = {}) => ({ t: "text", k, label, ...o }),
    area: (k, label, o = {}) => ({ t: "textarea", k, label, wide: true, ...o }),
    url: (k, label, o = {}) => ({ t: "url", k, label, ...o }),
    img: (k, label, o = {}) => ({ t: "image", k, label, wide: true, ...o }),
    video: (k, label, o = {}) => ({ t: "video", k, label, wide: true, ...o }),
    check: (k, label, o = {}) => ({ t: "check", k, label, ...o }),
    color: (k, label, o = {}) => ({ t: "color", k, label, ...o }),
    select: (k, label, options, o = {}) => ({ t: "select", k, label, options, ...o }),
    lines: (k, label, o = {}) => ({ t: "lines", k, label, wide: true, ...o }),
    slug: (k, label, o = {}) => ({ t: "slug", k, label, ...o }),
    route: (k, label, o = {}) => ({ t: "select", k, label, options: routeOptions, ...o }),
    group: (k, label, fields, o = {}) => ({ t: "group", k, label, fields, ...o }),
    list: (k, label, fields, o = {}) => ({ t: "list", k, label, fields, wide: true, ...o }),
  };

  const THEME_PRESET = { accent: "#9dff3a", purple: "#b026ff", highlight: "#c45bff", bg: "#0a0612", panel: "#1a1228", text: "#ecebe8", embers: true };

  const SCHEMA = {
    theme: [
      { box: "Cores", help: "As cores são aplicadas no site inteiro. Veja o resultado na prévia ao lado.", fields: [
        F.color("accent", "Cor principal", { help: "Botões, destaques e títulos coloridos." }),
        F.color("purple", "Cor dos brilhos", { help: "Brilhos, bordas e fundo animado." }),
        F.color("highlight", "Cor secundária", { help: "Detalhes e links destacados." }),
        F.color("text", "Cor do texto"),
        F.color("bg", "Cor de fundo"),
        F.color("panel", "Cor dos cartões"),
        F.check("embers", "Mostrar partículas animadas no fundo"),
      ] },
    ],
    site: [
      { box: "Rodapé e créditos", fields: [
        F.area("description", "Texto do rodapé"),
        F.text("credit", "Site feito por", { help: "Aparece como “Site por …” no rodapé." }),
        F.url("creditUrl", "Link de quem fez o site (opcional)"),
        F.text("disclaimer", "Aviso de marcas", { wide: true }),
      ] },
    ],
    home: [
      { box: "Topo da página inicial", fields: [
        F.text("eyebrow", "Texto pequeno acima do título"),
        F.text("title", "Título"),
        F.text("highlight", "Palavra em destaque (animada)"),
        F.area("lead", "Texto de apresentação"),
        F.text("ctaLabel", "Texto do botão principal"),
        F.route("ctaRoute", "Botão principal leva para"),
      ] },
      { box: "Build em destaque", fields: [
        F.group("featured", "", [
          F.check("show", "Mostrar o destaque na página inicial", { wide: true }),
          F.text("eyebrow", "Texto pequeno"),
          F.text("title", "Título (ex.: nome da build)"),
          F.text("subtitle", "Descrição", { wide: true }),
          F.url("url", "Link do botão (ex.: PoB)"),
          F.text("urlLabel", "Texto do botão"),
          F.route("route", "Botão “Ver todas” leva para"),
        ]),
      ] },
      { box: "Atalhos", help: "Escolha quais páginas aparecem como atalho na página inicial.", fields: [{ t: "routes", k: "shortcuts", wide: true }] },
      { box: "Bloco “Quem é”", fields: [F.text("aboutTitle", "Título do bloco", { wide: true })] },
    ],
    channel: [
      { box: "Identidade", fields: [
        F.text("name", "Nome do canal"),
        F.text("team", "Equipe"),
        F.img("logo", "Logo (de preferência com fundo transparente)"),
        F.img("avatar", "Foto / avatar"),
        F.img("banner", "Banner (fundo do topo)"),
        F.area("bio", "Biografia"),
      ] },
      { box: "Twitch e apoio", fields: [
        F.text("twitch", "Usuário da Twitch", { help: "Só o nome, ex.: mavado_tv" }),
        F.url("twitchUrl", "Link do canal na Twitch"),
        F.url("subUrl", "Link para dar sub"),
        F.url("donateUrl", "Link de doação"),
        F.text("supportLabel", "Texto do link de apoio ao site"),
        F.url("supportUrl", "Link de apoio ao site"),
      ] },
      { box: "Redes sociais", fields: [
        F.list("socials", "", [
          F.select("network", "Rede", [["twitch", "Twitch"], ["youtube", "YouTube"], ["instagram", "Instagram"], ["x", "X / Twitter"], ["tiktok", "TikTok"], ["discord", "Discord"], ["link", "Outro link"]]),
          F.text("label", "Nome exibido"),
          F.url("url", "Link", { wide: true }),
        ], { title: (s) => s.label || s.network, create: () => ({ network: "link", label: "", url: "" }), addLabel: "Adicionar rede" }),
      ] },
      { box: "Painéis da live", help: "Imagens usadas nos blocos de apoio e na página do canal.", fields: [
        F.group("panels", "", [
          F.img("sub", "Painel “Seja Sub”"), F.img("donate", "Painel “Doar”"), F.img("hardware", "Painel “Hardware”"),
          F.img("rules", "Painel “Regras”"), F.img("contact", "Painel “Contato”"),
        ]),
      ] },
      { box: "Parceiros", fields: [
        F.list("partners", "", [
          F.text("name", "Nome"), F.url("url", "Link"), F.text("desc", "Descrição", { wide: true }), F.img("img", "Imagem"),
        ], { title: (p) => p.name, thumb: (p) => p.img, create: () => ({ name: "Novo parceiro", desc: "", url: "", img: "" }), addLabel: "Adicionar parceiro" }),
      ] },
      { box: "Página do canal", fields: [
        F.list("setup", "Setup / hardware", [F.text("label", "Item"), F.text("value", "Modelo")], { title: (x) => `${x.label}: ${x.value}`, create: () => ({ label: "", value: "" }), addLabel: "Adicionar item do setup" }),
        F.lines("rules", "Regras do chat", { help: "Uma regra por linha." }),
        F.text("contact", "E-mail de contato", { wide: true }),
      ] },
    ],
  };

  const GAME_FIELDS = [
    { box: "Informações do jogo", fields: [
      F.text("name", "Nome do jogo"),
      F.text("short", "Nome curto (menu)"),
      F.slug("id", "Endereço (URL)", { help: "Aparece no link: site/#/endereço. Use só letras minúsculas, números e hífen." }),
      F.select("status", "Situação", [["live", "Disponível"], ["soon", "Em breve"]]),
      F.img("logo", "Logo do jogo"),
      F.text("tagline", "Frase curta (card da página inicial)", { wide: true }),
      F.area("about", "Descrição (topo do hub do jogo)"),
    ] },
  ];

  const SECTION_BASE = [
    F.text("title", "Título da página"),
    F.slug("id", "Endereço (URL)", { help: "Ex.: builds → site/#/jogo/builds" }),
    F.img("icon", "Ícone / medalhão"),
    F.text("tileText", "Texto do atalho (card do hub)", { wide: true }),
    F.area("intro", "Introdução (topo da página)"),
  ];

  const SECTION_TYPES = {
    builds: {
      name: "Builds", desc: "Cards com capa do vídeo, link do PoB, criador e filtro por categoria.",
      create: () => ({ type: "builds", title: "Builds", intro: "", tileText: "", icon: "", featured: { show: false, eyebrow: "", title: "", subtitle: "", url: "", urlLabel: "Abrir" }, categories: [], items: [] }),
      boxes: (s) => [
        { box: "Destaque no topo", fields: [F.group("featured", "", [
          F.check("show", "Mostrar destaque", { wide: true }), F.text("eyebrow", "Texto pequeno"), F.text("title", "Título"),
          F.text("subtitle", "Descrição", { wide: true }), F.url("url", "Link do botão"), F.text("urlLabel", "Texto do botão"),
        ])] },
        { box: "Categorias", help: "Viram os filtros (Melee, Spell…). Opcional.", fields: [F.list("categories", "", [
          F.text("label", "Nome"), F.slug("id", "Código"), F.img("img", "Ícone"), F.text("desc", "Descrição do filtro", { wide: true }), F.check("warn", "Destacar descrição como aviso"),
        ], { title: (c) => c.label, thumb: (c) => c.img, create: (arr) => ({ id: uniqueId("categoria", arr), label: "Nova categoria", img: "", desc: "", warn: false }), addLabel: "Adicionar categoria" })] },
        { box: "Builds", fields: [F.list("items", "", [
          F.select("category", "Categoria", () => [["", "— sem categoria —"], ...list(s.categories).map((c) => [c.id, c.label])]),
          F.text("title", "Nome (skill)"), F.text("subtitle", "Classe / ascendência"),
          F.text("author", "Criador"), F.url("authorUrl", "Canal do criador"),
          F.video("video", "Vídeo do YouTube (link ou código)"),
          F.url("url", "Link principal (PoB)"), F.text("urlLabel", "Texto do botão"),
          F.text("badge", "Selo na capa (ex.: PT-BR)"),
          F.list("links", "Links extras (ex.: um PoB por classe)", [F.text("label", "Texto"), F.url("url", "Link")], { title: (l) => l.label, create: () => ({ label: "", url: "" }), addLabel: "Adicionar link" }),
        ], { title: (b) => b.title, sub: (b) => b.subtitle, thumb: (b) => ytId(b.video) && `https://i.ytimg.com/vi/${ytId(b.video)}/default.jpg`, filter: true,
          create: () => ({ category: "", title: "Nova build", subtitle: "", author: "", authorUrl: "", video: "", url: "", urlLabel: "PoB", badge: "", links: [] }), addLabel: "Adicionar build" })] },
      ],
    },
    phases: {
      name: "Fases / estratégias", desc: "Abas por fase (ex.: Early, Mid, End game), cada uma com várias estratégias.",
      create: () => ({ type: "phases", title: "Estratégias", intro: "", tileText: "", icon: "", tagsLabel: "Threads", phases: [{ id: "inicio", label: "Início", subtitle: "", img: "", intro: "", items: [] }] }),
      boxes: () => [
        { box: "Opções", fields: [F.text("tagsLabel", "Nome das etiquetas (ex.: Threads)")] },
        { box: "Fases", fields: [F.list("phases", "", [
          F.text("label", "Nome da fase"), F.slug("id", "Código"), F.text("subtitle", "Subtítulo"), F.img("img", "Imagem"), F.area("intro", "Introdução"),
          F.list("items", "Estratégias", [
            F.text("title", "Nome"), F.text("map", "Mapa"), F.url("url", "Link principal"), F.text("urlLabel", "Texto do botão"),
            F.lines("tags", "Etiquetas", { help: "Uma por linha (ex.: Legion Thread x8)." }),
            F.area("notes", "Observações"),
            F.text("creditName", "Feito por (opcional)"), F.url("creditUrl", "Link de quem fez"),
            F.text("extraLabel", "Botão extra: texto"), F.url("extraUrl", "Botão extra: link"),
          ], { title: (x) => x.title, sub: (x) => x.map, filter: true, create: () => ({ title: "Nova estratégia", url: "", urlLabel: "Abrir", map: "", tags: [], notes: "", creditName: "", creditUrl: "", extraLabel: "", extraUrl: "" }), addLabel: "Adicionar estratégia" }),
        ], { title: (p) => p.label, sub: (p) => `${list(p.items).length} estratégias`, thumb: (p) => p.img, create: (arr) => ({ id: uniqueId("fase", arr), label: "Nova fase", subtitle: "", img: "", intro: "", items: [] }), addLabel: "Adicionar fase" })] },
      ],
    },
    cards: {
      name: "Links / cartões", desc: "Lista de links com imagem: ferramentas, guias, classes, trees…",
      create: () => ({ type: "cards", style: "thumb", title: "Links", intro: "", tileText: "", icon: "", items: [], cta: { show: false, eyebrow: "", title: "", desc: "", video: "", url: "", buttonLabel: "Assistir" } }),
      boxes: () => [
        { box: "Aparência", fields: [F.select("style", "Estilo dos cartões", [["thumb", "Lista com miniatura redonda (ferramentas)"], ["orb", "Ícone flutuante (itens / trees)"], ["class", "Cartão grande com imagem (classes)"]], { wide: true })] },
        { box: "Itens", fields: [F.list("items", "", [
          F.text("title", "Título"), F.text("subtitle", "Subtítulo"), F.text("tag", "Etiqueta (ex.: Overlay)"), F.text("badge", "Selo (ex.: Mais leve)"),
          F.url("url", "Link", { wide: true }), F.area("desc", "Descrição"), F.img("img", "Imagem"),
        ], { title: (x) => x.title, sub: (x) => x.tag, thumb: (x) => x.img, filter: true, create: () => ({ title: "Novo item", subtitle: "", tag: "", badge: "", url: "", desc: "", img: "" }), addLabel: "Adicionar item" })] },
        { box: "Chamada no fim da página (opcional)", fields: [F.group("cta", "", [
          F.check("show", "Mostrar chamada", { wide: true }), F.text("eyebrow", "Texto pequeno"), F.text("title", "Título"),
          F.area("desc", "Descrição"), F.video("video", "Vídeo do YouTube (abre no player)"), F.url("url", "…ou um link"), F.text("buttonLabel", "Texto do botão"),
        ])] },
      ],
    },
    videos: {
      name: "Série de vídeos", desc: "Aulas numeradas com capa, player no site e checklist de progresso.",
      create: () => ({ type: "videos", title: "Vídeos", intro: "", tileText: "", icon: "", authorName: "", authorUrl: "", items: [] }),
      boxes: () => [
        { box: "Autor", fields: [F.text("authorName", "Nome do autor"), F.url("authorUrl", "Canal do autor")] },
        { box: "Vídeos", fields: [F.list("items", "", [F.video("video", "Vídeo do YouTube"), F.text("title", "Título", { wide: true })], {
          title: (v) => v.title, thumb: (v) => ytId(v.video) && `https://i.ytimg.com/vi/${ytId(v.video)}/default.jpg`, numbered: true,
          create: () => ({ video: "", title: "Novo vídeo" }), addLabel: "Adicionar vídeo" })] },
      ],
    },
    feature: {
      name: "Destaque", desc: "Uma página com chamada, botão e imagem grande (ex.: tabela de receitas).",
      create: () => ({ type: "feature", title: "Destaque", intro: "", tileText: "", icon: "", eyebrow: "", heading: "", desc: "", url: "", urlLabel: "Abrir", video: "", img: "" }),
      boxes: () => [
        { box: "Conteúdo", fields: [
          F.text("eyebrow", "Texto pequeno"), F.text("heading", "Título do bloco"), F.area("desc", "Descrição"),
          F.url("url", "Link do botão"), F.text("urlLabel", "Texto do botão"), F.video("video", "…ou um vídeo do YouTube"), F.img("img", "Imagem grande"),
        ] },
      ],
    },
  };

  /* ---------------------------------------------------------------------
     Motor de formulários
     --------------------------------------------------------------------- */
  let fieldSeq = 0;
  const fid = () => `f${++fieldSeq}`;

  function renderBoxes(boxes, obj) {
    return boxes.map((b) =>
      h("fieldset", { class: `fieldset ${b.danger ? "danger-zone" : ""}` },
        b.box ? h("legend", {}, b.box) : null,
        b.help ? h("p", { class: "fs-help" }, b.help) : null,
        h("div", { class: "fields" }, b.fields.map((f) => renderField(f, obj)))
      )
    );
  }

  function wrap(f, control, id) {
    return h("div", { class: `field ${f.wide || f.t === "group" ? "field--wide" : ""}` },
      f.label && f.t !== "check" ? h("label", { for: id }, f.label) : null,
      control,
      f.help ? h("span", { class: "help" }, f.help) : null
    );
  }

  function renderField(f, obj) {
    const id = fid();
    const set = (v, opts) => { obj[f.k] = v; changed(opts); };
    const isTitle = ["title", "name", "label", "short", "id"].includes(f.k);

    switch (f.t) {
      case "text":
      case "url": {
        const inp = h("input", { id, type: f.t === "url" ? "url" : "text", value: obj[f.k] ?? "", placeholder: f.t === "url" ? "https://…" : f.ph || "", spellcheck: f.t === "url" ? "false" : "true" });
        inp.addEventListener("input", () => set(inp.value, { tree: isTitle }));
        return wrap(f, inp, id);
      }
      case "textarea": {
        const ta = h("textarea", { id, rows: f.rows || 3 });
        ta.value = obj[f.k] ?? "";
        ta.addEventListener("input", () => set(ta.value));
        return wrap(f, ta, id);
      }
      case "lines": {
        const ta = h("textarea", { id, rows: 5 });
        ta.value = list(obj[f.k]).join("\n");
        ta.addEventListener("input", () => set(ta.value.split("\n").map((x) => x.trim()).filter(Boolean)));
        return wrap(f, ta, id);
      }
      case "slug": {
        const inp = h("input", { id, type: "text", value: obj[f.k] ?? "", spellcheck: "false", class: "img-path" });
        inp.addEventListener("input", () => {
          const v = slug(inp.value.replace(/\s/g, "-")) || "";
          set(v, { tree: true });
          inp.closest(".field").classList.toggle("is-invalid", !v);
        });
        inp.addEventListener("blur", () => { inp.value = obj[f.k] || ""; });
        return wrap(f, inp, id);
      }
      case "check": {
        const inp = h("input", { id, type: "checkbox" });
        inp.checked = !!obj[f.k];
        inp.addEventListener("change", () => set(inp.checked));
        return wrap(f, h("label", { class: "check", for: id }, inp, f.label), id);
      }
      case "color": {
        const val = obj[f.k] || "#000000";
        const pick = h("input", { type: "color", value: val, "aria-label": f.label });
        const txt = h("input", { id, type: "text", value: val, maxlength: "7", spellcheck: "false" });
        pick.addEventListener("input", () => { txt.value = pick.value; set(pick.value); });
        txt.addEventListener("input", () => { if (/^#[\da-f]{6}$/i.test(txt.value)) { pick.value = txt.value; set(txt.value.toLowerCase()); } });
        return wrap(f, h("div", { class: "color" }, pick, txt), id);
      }
      case "select": {
        const opts = typeof f.options === "function" ? f.options() : f.options;
        const sel = h("select", { id }, opts.map(([v, l]) => h("option", { value: v }, l)));
        sel.value = obj[f.k] ?? "";
        if (sel.value !== (obj[f.k] ?? "") && obj[f.k]) sel.append(h("option", { value: obj[f.k], selected: true }, `${obj[f.k]} (não encontrado)`));
        sel.addEventListener("change", () => set(sel.value, { tree: f.k === "status" }));
        return wrap(f, sel, id);
      }
      case "image": return wrap(f, imageControl(obj, f.k, id), id);
      case "video": {
        const inp = h("input", { id, type: "text", value: obj[f.k] ?? "", placeholder: "https://www.youtube.com/watch?v=…", spellcheck: "false" });
        const th = h("div", { class: "vid-thumb" });
        const paint = () => { const v = ytId(inp.value); th.style.backgroundImage = v ? `url(https://i.ytimg.com/vi/${v}/mqdefault.jpg)` : ""; };
        inp.addEventListener("input", () => { const v = ytId(inp.value); set(v || inp.value.trim()); paint(); });
        inp.addEventListener("blur", () => { const v = ytId(inp.value); if (v) inp.value = v; });
        paint();
        return wrap(f, h("div", { class: "vid-field" }, inp, th), id);
      }
      case "routes": {
        const cur = new Set(list(obj[f.k]));
        const box = h("div", { class: "routes" }, sectionRoutes().map(([v, l]) => {
          const cb = h("input", { type: "checkbox", value: v });
          cb.checked = cur.has(v);
          cb.addEventListener("change", () => {
            const order = sectionRoutes().map((r) => r[0]);
            const now = new Set($$("input:checked", box).map((x) => x.value));
            set(order.filter((r) => now.has(r)));
          });
          return h("label", {}, cb, l);
        }));
        return wrap(f, box, id);
      }
      case "group": {
        if (!obj[f.k] || typeof obj[f.k] !== "object") obj[f.k] = {};
        return h("div", { class: "field field--wide" }, f.label ? h("span", { class: "lbl" }, f.label) : null,
          h("div", { class: "fields" }, f.fields.map((ff) => renderField(ff, obj[f.k]))));
      }
      case "list": return listControl(f, obj);
      default: return h("div", {}, `Campo desconhecido: ${f.t}`);
    }
  }

  /* ---------- Lista de itens (adicionar, reordenar, duplicar, remover) ---------- */
  function listControl(f, obj) {
    if (!Array.isArray(obj[f.k])) obj[f.k] = [];
    const arr = obj[f.k];
    const wrapEl = h("div", { class: "field field--wide" });
    const body = h("div", { class: "list" });
    const count = h("span", { class: "count" });
    let filterText = "";

    const filterInput = f.filter ? h("input", { type: "search", class: "input list__filter", placeholder: "Filtrar…", "aria-label": "Filtrar itens" }) : null;
    filterInput?.addEventListener("input", () => { filterText = filterInput.value.toLowerCase(); draw(); });

    function itemTitle(it, i) {
      const t = (f.title && f.title(it)) || "(sem título)";
      return `${f.numbered ? `${String(i + 1).padStart(2, "0")} · ` : ""}${t}`;
    }

    function draw(openIndex = -1) {
      body.innerHTML = "";
      count.textContent = `${arr.length} ${arr.length === 1 ? "item" : "itens"}`;
      arr.forEach((it, i) => {
        if (filterText && !JSON.stringify(it).toLowerCase().includes(filterText)) return;
        const thumb = f.thumb && f.thumb(it);
        const titleEl = h("span", { class: "item__title" }, itemTitle(it, i), f.sub && f.sub(it) ? h("small", {}, f.sub(it)) : null);
        const tool = (ic, label, fn, cls = "") => h("button", { type: "button", title: label, "aria-label": label, class: cls, onclick: (e) => { e.preventDefault(); e.stopPropagation(); fn(); } }, icon(IC[ic]));
        const det = h("details", { class: "item" },
          h("summary", {},
            (() => { const s = icon(IC.chev); s.classList.add("chev"); return s; })(),
            thumb ? h("img", { class: "item__thumb", src: thumb.startsWith("http") ? thumb : "/" + thumb, alt: "" }) : null,
            titleEl,
            h("span", { class: "item__tools" },
              tool("up", "Mover para cima", () => move(i, -1)),
              tool("down", "Mover para baixo", () => move(i, 1)),
              tool("copy", "Duplicar", () => { arr.splice(i + 1, 0, clone(it)); changed({ tree: true }); draw(i + 1); }),
              tool("trash", "Remover", () => {
                if (!confirm(`Remover “${(f.title && f.title(it)) || "item"}”?`)) return;
                arr.splice(i, 1); changed({ tree: true }); draw();
              }, "del"),
            )
          )
        );
        // Corpo montado só quando abrir (listas grandes ficam leves)
        let built = false;
        det.addEventListener("toggle", () => {
          if (!det.open || built) return;
          built = true;
          const inner = h("div", { class: "item__body" }, h("div", { class: "fields" }, f.fields.map((ff) => renderField(ff, it))));
          inner.addEventListener("input", () => { titleEl.firstChild.textContent = itemTitle(it, i); });
          inner.addEventListener("change", () => { titleEl.firstChild.textContent = itemTitle(it, i); });
          det.append(inner);
        });
        body.append(det);
        if (i === openIndex) { det.open = true; setTimeout(() => det.scrollIntoView({ block: "nearest", behavior: "smooth" }), 30); }
      });
    }
    function move(i, d) {
      const j = i + d;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      changed({ tree: true });
      draw();
    }

    const add = h("button", { type: "button", class: "add-btn", onclick: () => {
      arr.push(f.create ? f.create(arr) : {});
      if (filterInput) { filterInput.value = ""; filterText = ""; }
      changed({ tree: true });
      draw(arr.length - 1);
    } }, icon(IC.plus), f.addLabel || "Adicionar");

    wrapEl.append(
      h("div", { class: "list__head" }, h("span", { class: "lbl" }, f.label || ""), h("span", { style: "display:flex;gap:10px;align-items:center" }, filterInput, count)),
      body,
      add
    );
    draw();
    return wrapEl;
  }

  /* ---------- Imagem: prévia, enviar, escolher da galeria, arrastar ---------- */
  function imageControl(obj, k, id) {
    const thumb = h("div", { class: "img-thumb", title: "Clique ou arraste uma imagem aqui" });
    const pathInp = h("input", { id, type: "text", class: "img-path", value: obj[k] || "", placeholder: "assets/img/…", spellcheck: "false" });
    const paint = () => {
      thumb.innerHTML = "";
      thumb.append(obj[k] ? h("img", { src: /^https?:/.test(obj[k]) ? obj[k] : "/" + obj[k], alt: "" }) : h("span", { class: "empty" }, "Sem imagem"));
    };
    const setVal = (v) => { obj[k] = v; pathInp.value = v; paint(); changed({ tree: true }); };
    pathInp.addEventListener("change", () => setVal(pathInp.value.trim()));

    const doUpload = async (file) => {
      if (!file) return;
      thumb.classList.add("is-busy");
      try { setVal(await uploadImage(file)); toast("Imagem enviada", "ok"); }
      catch (e) { toast(e.message, "err"); }
      finally { thumb.classList.remove("is-busy"); }
    };
    const pickFile = () => {
      const fi = $("#fileInput");
      fi.value = "";
      fi.onchange = () => doUpload(fi.files[0]);
      fi.click();
    };
    thumb.addEventListener("click", pickFile);
    thumb.addEventListener("dragover", (e) => { e.preventDefault(); thumb.classList.add("is-drag"); });
    thumb.addEventListener("dragleave", () => thumb.classList.remove("is-drag"));
    thumb.addEventListener("drop", (e) => { e.preventDefault(); thumb.classList.remove("is-drag"); doUpload(e.dataTransfer.files[0]); });

    paint();
    return h("div", { class: "img-field" }, thumb,
      h("div", {}, pathInp,
        h("div", { class: "img-actions" },
          h("button", { type: "button", class: "btn btn--sm", onclick: pickFile }, icon(IC.upload), "Enviar imagem"),
          h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => openGallery(setVal) }, icon(IC.image), "Escolher existente"),
          obj[k] ? h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => setVal("") }, "Remover") : null,
        )
      )
    );
  }

  // Redimensiona e converte para WebP no navegador antes de enviar
  async function uploadImage(file) {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) throw new Error("Use uma imagem PNG, JPG, WEBP ou GIF.");
    let blob = file, name = file.name;
    if (file.type !== "image/gif") {
      try {
        const bmp = await createImageBitmap(file);
        const max = 1600, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
        const webp = await new Promise((r) => c.toBlob(r, "image/webp", 0.86));
        if (webp && webp.type === "image/webp" && webp.size < file.size * 1.2) { blob = webp; name = name.replace(/\.\w+$/, "") + ".webp"; }
      } catch { /* envia o original */ }
    }
    if (blob.size > 15 * 1024 * 1024) throw new Error("Imagem muito grande (máx. 15 MB).");
    const r = await api(`/api/upload?name=${encodeURIComponent(name)}`, { method: "POST", body: blob, headers: { "Content-Type": "application/octet-stream" } });
    return r.path;
  }

  async function openGallery(onPick) {
    const body = h("div", {}, h("p", { class: "loading" }, "Carregando imagens…"));
    openModal("Escolher imagem", body);
    let imgs = [];
    try { imgs = await api("/api/images"); } catch (e) { body.innerHTML = ""; body.append(h("p", { class: "msg-err" }, e.message)); return; }
    const search = h("input", { type: "search", class: "input", placeholder: "Filtrar por nome ou pasta…", style: "width:100%;min-height:40px;padding:8px 12px;border-radius:8px;background:var(--bg);border:1px solid var(--line-2)" });
    const grid = h("div", { class: "gallery" });
    const draw = () => {
      const q = search.value.toLowerCase();
      grid.innerHTML = "";
      imgs.filter((i) => i.path.toLowerCase().includes(q)).forEach((i) =>
        grid.append(h("button", { type: "button", title: i.path, onclick: () => { onPick(i.path); closeModal(); } },
          h("span", { class: "g-img" }, h("img", { src: "/" + i.path, alt: "", loading: "lazy" })),
          h("small", {}, i.path.replace("assets/img/", ""))))
      );
    };
    search.addEventListener("input", draw);
    body.innerHTML = "";
    body.append(search, grid);
    draw();
    setTimeout(() => search.focus(), 50);
  }

  /* ---------------------------------------------------------------------
     Modal
     --------------------------------------------------------------------- */
  const modal = $("#modal");
  function openModal(title, content) {
    $("#modalTitle").textContent = title;
    const b = $("#modalBody");
    b.innerHTML = "";
    b.append(content);
    modal.hidden = false;
  }
  function closeModal() { modal.hidden = true; }
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));

  /* ---------------------------------------------------------------------
     Árvore lateral
     --------------------------------------------------------------------- */
  const same = (a, b) => a.kind === b.kind && a.gi === b.gi && a.si === b.si;
  function node(target, label, { img, ic, sub, cls = "", small } = {}) {
    const btn = h("button", { type: "button", class: `node ${cls}`, "aria-current": same(target, current) ? "true" : null, onclick: () => select(target) },
      img ? h("img", { src: "/" + img, alt: "" }) : h("span", { class: "ph" }, typeof ic === "string" && ic.length < 3 ? ic : icon(ic || IC.globe)),
      h("span", { class: "t" }, label),
      small ? h("small", {}, small) : null
    );
    return btn;
  }
  function renderTree() {
    const t = $("#tree");
    t.innerHTML = "";
    t.append(
      h("div", { class: "tree-group" },
        h("div", { class: "tree-label" }, "Geral"),
        node({ kind: "theme" }, "Aparência e cores", { ic: IC.palette }),
        node({ kind: "home" }, "Página inicial", { ic: IC.home }),
        node({ kind: "channel" }, "Canal e redes", { img: data.channel.avatar, ic: IC.user }),
        node({ kind: "site" }, "Rodapé e créditos", { ic: IC.globe }),
      )
    );
    const gg = h("div", { class: "tree-group" },
      h("div", { class: "tree-label" }, "Jogos", h("button", { type: "button", onclick: addGame }, "+ Novo jogo")));
    data.games.forEach((g, gi) => {
      gg.append(node({ kind: "game", gi }, g.name || "(sem nome)", { img: g.logo, ic: IC.gamepad, small: g.status === "soon" ? "em breve" : "" }));
      list(g.sections).forEach((s, si) =>
        gg.append(node({ kind: "section", gi, si }, s.title || "(sem título)", { img: s.icon, ic: TYPE_ICON[s.type] || "•", cls: "node--sub" }))
      );
      gg.append(h("button", { type: "button", class: "node node--add", onclick: () => select({ kind: "new-section", gi }) }, icon(IC.plus), "Nova seção"));
    });
    t.append(gg);
  }

  /* ---------------------------------------------------------------------
     Painel central
     --------------------------------------------------------------------- */
  function head(crumb, title, desc, imgSrc) {
    return h("div", { class: "ed-head" },
      imgSrc ? h("img", { src: "/" + imgSrc, alt: "" }) : null,
      h("div", {}, h("span", { class: "crumb" }, crumb), h("h1", {}, title), desc ? h("p", {}, desc) : null));
  }

  function renderEditor() {
    const ed = $("#editor");
    ed.innerHTML = "";
    fieldSeq = 0;
    const c = current;

    if (c.kind === "theme") {
      data.theme = data.theme || clone(THEME_PRESET);
      ed.append(head("Geral", "Aparência e cores", "Mude as cores do site e veja na hora na prévia."),
        h("div", { class: "ed-tools" }, h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => { data.theme = clone(THEME_PRESET); changed(); renderEditor(); toast("Cores da live restauradas"); } }, "Restaurar cores da live")),
        ...renderBoxes(SCHEMA.theme, data.theme));
    } else if (c.kind === "site") {
      data.site = data.site || {};
      ed.append(head("Geral", "Rodapé e créditos"), ...renderBoxes(SCHEMA.site, data.site));
    } else if (c.kind === "home") {
      data.home = data.home || {};
      ed.append(head("Geral", "Página inicial", "Textos do topo, build em destaque e atalhos."), ...renderBoxes(SCHEMA.home, data.home));
    } else if (c.kind === "channel") {
      ed.append(head("Geral", "Canal e redes", "Logo, avatar, banner, redes sociais, parceiros, setup e regras."), ...renderBoxes(SCHEMA.channel, data.channel));
    } else if (c.kind === "game") {
      const g = data.games[c.gi];
      ed.append(head("Jogo", g.name || "(sem nome)", "Informações que aparecem no card da página inicial e no hub do jogo.", g.logo), ...renderBoxes(GAME_FIELDS, g));
      ed.append(h("fieldset", { class: "fieldset" }, h("legend", {}, "Seções deste jogo"),
        h("p", { class: "fs-help" }, list(g.sections).length ? "Clique numa seção no menu à esquerda para editar. Use as setas para mudar a ordem." : "Este jogo ainda não tem seções. Enquanto estiver sem seções (ou “Em breve”), aparece a página de “Em breve”."),
        h("div", { class: "list" }, list(g.sections).map((s, si) =>
          h("div", { class: "item" }, h("div", { style: "display:flex;align-items:center;gap:10px;padding:10px 12px" },
            s.icon ? h("img", { class: "item__thumb", src: "/" + s.icon, alt: "", style: "object-fit:contain;background:none" }) : h("span", { class: "item__thumb", style: "display:grid;place-items:center" }, TYPE_ICON[s.type] || "•"),
            h("span", { class: "item__title" }, s.title, h("small", {}, SECTION_TYPES[s.type]?.name || s.type)),
            h("span", { class: "item__tools" },
              h("button", { type: "button", title: "Mover para cima", onclick: () => moveSection(c.gi, si, -1) }, icon(IC.up)),
              h("button", { type: "button", title: "Mover para baixo", onclick: () => moveSection(c.gi, si, 1) }, icon(IC.down)),
              h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => select({ kind: "section", gi: c.gi, si }) }, "Editar"))))
        )),
        h("button", { type: "button", class: "add-btn", style: "margin-top:8px", onclick: () => select({ kind: "new-section", gi: c.gi }) }, icon(IC.plus), "Adicionar seção")));
      ed.append(h("fieldset", { class: "fieldset danger-zone" }, h("legend", {}, "Organizar"),
        h("div", { class: "ed-tools", style: "margin:0" },
          h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => moveGame(c.gi, -1) }, icon(IC.up), "Mover jogo para cima"),
          h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => moveGame(c.gi, 1) }, icon(IC.down), "Mover para baixo"),
          h("button", { type: "button", class: "btn btn--sm btn--danger", onclick: () => removeGame(c.gi) }, icon(IC.trash), "Excluir jogo"))));
    } else if (c.kind === "section") {
      const g = data.games[c.gi], s = g.sections[c.si];
      const T = SECTION_TYPES[s.type];
      ed.append(head(`${g.name} › ${T ? T.name : s.type}`, s.title || "(sem título)", T ? T.desc : "", s.icon),
        ...renderBoxes([{ box: "Página", fields: SECTION_BASE }], s),
        ...(T ? renderBoxes(T.boxes(s), s) : [h("p", {}, "Tipo de seção desconhecido.")]),
        h("fieldset", { class: "fieldset danger-zone" }, h("legend", {}, "Organizar"),
          h("div", { class: "ed-tools", style: "margin:0" },
            h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => duplicateSection(c.gi, c.si) }, icon(IC.copy), "Duplicar seção"),
            h("button", { type: "button", class: "btn btn--sm btn--danger", onclick: () => removeSection(c.gi, c.si) }, icon(IC.trash), "Excluir seção"))));
    } else if (c.kind === "new-section") {
      const g = data.games[c.gi];
      ed.append(head(g.name, "Nova seção", "Escolha o tipo de página que você quer adicionar a este jogo."),
        h("div", { class: "types" }, Object.entries(SECTION_TYPES).map(([type, T]) =>
          h("button", { type: "button", class: "type", onclick: () => addSection(c.gi, type) }, h("b", {}, `${TYPE_ICON[type]}  ${T.name}`), h("span", {}, T.desc)))));
    }
    ed.scrollTop = 0;
  }

  /* ---------------------------------------------------------------------
     Ações de jogos e seções
     --------------------------------------------------------------------- */
  function addGame() {
    const inp = h("input", { type: "text", class: "input", id: "newGameName", placeholder: "Ex.: Last Epoch", style: "width:100%;min-height:42px;padding:8px 12px;border-radius:8px;background:var(--bg);border:1px solid var(--line-2)" });
    const create = () => {
      const name = inp.value.trim();
      if (!name) { inp.focus(); return; }
      const id = uniqueId(name, data.games.concat([{ id: "canal" }]));
      data.games.push({ id, name, short: name, status: "soon", logo: "", tagline: "", about: "", sections: [] });
      closeModal();
      changed({ tree: true });
      select({ kind: "game", gi: data.games.length - 1 });
      toast("Jogo criado. Ele aparece como “Em breve” até você mudar a situação.", "ok");
    };
    inp.addEventListener("keydown", (e) => e.key === "Enter" && create());
    openModal("Novo jogo", h("div", {},
      h("div", { class: "field" }, h("label", { for: "newGameName" }, "Nome do jogo"), inp),
      h("div", { class: "modal__foot" },
        h("button", { type: "button", class: "btn btn--ghost", onclick: closeModal }, "Cancelar"),
        h("button", { type: "button", class: "btn", onclick: create }, icon(IC.plus), "Criar jogo"))));
    setTimeout(() => inp.focus(), 50);
  }
  function moveGame(gi, d) {
    const j = gi + d;
    if (j < 0 || j >= data.games.length) return;
    [data.games[gi], data.games[j]] = [data.games[j], data.games[gi]];
    changed({ tree: true });
    select({ kind: "game", gi: j });
  }
  function removeGame(gi) {
    const g = data.games[gi];
    if (!confirm(`Excluir o jogo “${g.name}” e todas as suas seções?\n\nVocê ainda pode desfazer antes de salvar.`)) return;
    data.games.splice(gi, 1);
    changed({ tree: true });
    select({ kind: "home" });
  }
  function addSection(gi, type) {
    const g = data.games[gi];
    g.sections = list(g.sections);
    const s = SECTION_TYPES[type].create();
    s.id = uniqueId(s.title, g.sections);
    g.sections.push(s);
    if (g.status === "soon" && g.sections.length === 1) toast("Dica: mude a situação do jogo para “Disponível” para mostrar as seções.");
    changed({ tree: true });
    select({ kind: "section", gi, si: g.sections.length - 1 });
  }
  function moveSection(gi, si, d) {
    const arr = data.games[gi].sections, j = si + d;
    if (j < 0 || j >= arr.length) return;
    [arr[si], arr[j]] = [arr[j], arr[si]];
    changed({ tree: true });
    renderAll();
  }
  function duplicateSection(gi, si) {
    const arr = data.games[gi].sections;
    const copy = clone(arr[si]);
    copy.title += " (cópia)";
    copy.id = uniqueId(copy.title, arr);
    arr.splice(si + 1, 0, copy);
    changed({ tree: true });
    select({ kind: "section", gi, si: si + 1 });
  }
  function removeSection(gi, si) {
    const s = data.games[gi].sections[si];
    if (!confirm(`Excluir a seção “${s.title}”?\n\nVocê ainda pode desfazer antes de salvar.`)) return;
    data.games[gi].sections.splice(si, 1);
    changed({ tree: true });
    select({ kind: "game", gi });
  }

  /* ---------------------------------------------------------------------
     Navegação
     --------------------------------------------------------------------- */
  function validateCurrent() {
    const c = current;
    if ((c.kind === "game" || c.kind === "new-section") && !data.games[c.gi]) current = { kind: "home" };
    if (c.kind === "section" && !(data.games[c.gi] && data.games[c.gi].sections[c.si])) current = { kind: "home" };
  }
  function select(target) {
    current = target;
    validateCurrent();
    renderAll();
    navigatePreview();
    document.body.classList.remove("show-side");
    $("#scrim").hidden = true;
    $("#menuBtn").setAttribute("aria-expanded", "false");
    try { sessionStorage.setItem("mv-editor-node", JSON.stringify(current)); } catch { /* ignora */ }
  }
  function renderAll() { renderTree(); renderEditor(); }

  /* ---------------------------------------------------------------------
     Salvar e publicar
     --------------------------------------------------------------------- */
  async function save() {
    if (!isDirty()) return true;
    setState("saving", "Salvando…");
    try {
      await api("/api/save", { method: "POST", json: data });
      savedJSON = JSON.stringify(data);
      refreshState();
      toast("Salvo no computador", "ok");
      return true;
    } catch (e) {
      setState("error", "Erro ao salvar");
      toast(e.message, "err");
      return false;
    }
  }

  async function publishFlow() {
    const body = h("div", {}, h("p", { class: "loading" }, "Verificando o projeto…"));
    openModal("Publicar no site", body);
    if (isDirty() && !(await save())) { body.innerHTML = ""; body.append(h("p", { class: "msg-err" }, "Corrija o erro de salvamento antes de publicar.")); return; }
    let st;
    try { st = await api("/api/status"); } catch (e) { body.innerHTML = ""; body.append(h("p", { class: "msg-err" }, e.message)); return; }
    body.innerHTML = "";
    if (!st.repo) { body.append(h("p", { class: "msg-err" }, "Esta pasta não está ligada a um repositório do GitHub. Peça para quem configurou o projeto.")); return; }

    const msg = h("input", { type: "text", class: "input", value: "Atualização do conteúdo pelo editor", maxlength: "200", style: "width:100%;min-height:40px;padding:8px 12px;border-radius:8px;background:var(--bg);border:1px solid var(--line-2)" });
    const out = h("div");
    const go = h("button", { type: "button", class: "btn btn--publish" }, icon(IC.upload), "Publicar agora");
    body.append(
      h("p", {}, st.files.length
        ? `Há ${st.files.length} arquivo(s) alterado(s) que serão enviados para o GitHub. O site atualiza sozinho em 1–2 minutos.`
        : "Nenhuma alteração nova. Você pode publicar mesmo assim para enviar alterações salvas anteriormente."),
      st.files.length ? h("ul", { class: "files" }, st.files.map((f) => h("li", {}, h("b", {}, f.state === "??" ? "+" : f.state === "D" ? "−" : "~"), f.file))) : null,
      h("div", { class: "field", style: "margin-top:16px" }, h("label", {}, "Descreva o que mudou (opcional)"), msg),
      h("p", { class: "help", style: "color:var(--dim);font-size:12px;margin-top:8px" }, `Repositório: ${st.remote || "—"} · branch ${st.branch}. Se o Windows pedir login do GitHub, entre com uma conta que tenha acesso ao projeto.`),
      h("div", { class: "modal__foot" }, h("button", { type: "button", class: "btn btn--ghost", onclick: closeModal }, "Cancelar"), go),
      out
    );
    go.addEventListener("click", async () => {
      go.disabled = true;
      go.lastChild.textContent = "Publicando…";
      out.innerHTML = "";
      try {
        const r = await api("/api/publish", { method: "POST", json: { message: msg.value } });
        const site = siteUrl(st.remote);
        out.append(h("p", { class: "msg-ok", style: "margin-top:14px" }, "✔ Publicado! O site atualiza em 1–2 minutos."),
          site ? h("p", {}, h("a", { href: site, target: "_blank", rel: "noopener" }, `Abrir ${site} ↗`)) : null,
          h("details", {}, h("summary", { style: "cursor:pointer;color:var(--dim)" }, "Detalhes técnicos"), h("pre", { class: "log" }, r.log)));
        go.lastChild.textContent = "Publicado";
        toast("Publicado no GitHub", "ok");
      } catch (e) {
        out.append(h("p", { class: "msg-err", style: "margin-top:14px" }, "✖ " + e.message),
          h("p", { style: "color:var(--muted)" }, "Suas alterações continuam salvas no computador. Tente de novo ou peça ajuda a quem configurou o projeto."),
          e.data && e.data.log ? h("pre", { class: "log" }, e.data.log) : null);
        go.disabled = false;
        go.lastChild.textContent = "Tentar de novo";
      }
    });
  }
  function siteUrl(remote) {
    const m = String(remote || "").match(/github\.com[:/]([^/]+)\/([^/.]+(?:\.github\.io)?)/i);
    if (!m) return "";
    const [, owner, repo] = m;
    return repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${repo.toLowerCase()}/` : `https://${owner.toLowerCase()}.github.io/${repo}/`;
  }

  function showHelp() {
    openModal("Como funciona", h("div", {},
      h("ol", { class: "help-list" },
        h("li", {}, h("b", {}, "Escolha o que editar"), " no menu à esquerda: cores, página inicial, canal, jogos e as seções de cada jogo."),
        h("li", {}, h("b", {}, "Veja na hora"), " o resultado na pré-visualização (no celular, toque em “Prévia”)."),
        h("li", {}, h("b", {}, "Imagens:"), " clique no quadrado da imagem ou arraste um arquivo. Ela é otimizada automaticamente."),
        h("li", {}, h("b", {}, "Salvar"), " grava as mudanças no seu computador (", h("kbd", {}, "Ctrl"), " + ", h("kbd", {}, "S"), "). ", h("b", {}, "Desfazer"), ": ", h("kbd", {}, "Ctrl"), " + ", h("kbd", {}, "Z"), "."),
        h("li", {}, h("b", {}, "Publicar"), " envia tudo para o GitHub e o site no ar atualiza em 1–2 minutos. Precisa de acesso ao repositório."),
        h("li", {}, "Um backup do conteúdo é guardado a cada salvamento em ", h("kbd", {}, "editor/.backups"), ".")
      )));
  }

  /* ---------------------------------------------------------------------
     Eventos globais
     --------------------------------------------------------------------- */
  $("#saveBtn").addEventListener("click", save);
  $("#undoBtn").addEventListener("click", undo);
  $("#publishBtn").addEventListener("click", publishFlow);
  $("#helpBtn").addEventListener("click", showHelp);
  $("#reloadPreview").addEventListener("click", reloadFrame);
  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    $$(".seg button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    $("#stage").classList.toggle("is-mobile", b.dataset.size === "mobile");
  }));
  $("#menuBtn").addEventListener("click", () => {
    const open = !document.body.classList.contains("show-side");
    document.body.classList.toggle("show-side", open);
    $("#scrim").hidden = !open;
    $("#menuBtn").setAttribute("aria-expanded", String(open));
  });
  $("#scrim").addEventListener("click", () => $("#menuBtn").click());
  $("#previewBtn").addEventListener("click", () => {
    const on = !document.body.classList.contains("show-preview");
    document.body.classList.toggle("show-preview", on);
    $("#previewBtn").setAttribute("aria-pressed", String(on));
  });
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
    else if (mod && e.key.toLowerCase() === "z" && !/input|textarea/i.test(e.target.tagName)) { e.preventDefault(); undo(); }
    else if (e.key === "Escape" && !modal.hidden) closeModal();
  });
  window.addEventListener("beforeunload", (e) => { if (data && isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------------------------------------------------------------------
     Início
     --------------------------------------------------------------------- */
  (async () => {
    try {
      data = await api("/api/saved");
      await api("/api/draft", { method: "DELETE" });
    } catch (e) {
      $("#editor").innerHTML = "";
      $("#editor").append(h("p", { class: "msg-err" }, "Não foi possível carregar o conteúdo: " + e.message));
      return;
    }
    savedJSON = JSON.stringify(data);
    lastSnap = savedJSON;
    try { const n = JSON.parse(sessionStorage.getItem("mv-editor-node")); if (n && n.kind) current = n; } catch { /* ignora */ }
    validateCurrent();
    renderAll();
    previewRoute = routeFor(current);
    reloadFrame();
    refreshState();
  })();
})();
