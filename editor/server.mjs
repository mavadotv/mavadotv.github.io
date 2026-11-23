#!/usr/bin/env node
/* =========================================================================
   MAVADO_TV — Servidor local do editor
   -------------------------------------------------------------------------
   Uso:  node editor/server.mjs            (ou dê dois cliques em editar-site.cmd)
   Abre: http://localhost:8080/edit
   - Serve o site e o editor visual
   - Salva o conteúdo em assets/js/data.js (com backup em editor/.backups)
   - Recebe imagens em assets/img/uploads
   - Publica no GitHub (git add / commit / pull --rebase / push)
   Só aceita conexões do próprio computador (127.0.0.1).
   Sem dependências: apenas Node.js 18+.
   ========================================================================= */
import http from "node:http";
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "assets/js/data.js");
const UPLOAD_DIR = path.join(ROOT, "assets/img/uploads");
const BACKUP_DIR = path.join(ROOT, "editor/.backups");
const TOKEN = crypto.randomBytes(24).toString("hex");
const args = process.argv.slice(2);
let PORT = Number((args.find((a) => a.startsWith("--port=")) || "").split("=")[1]) || 8080;
const OPEN = args.includes("--open");

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2",
};
const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

let draft = null; // conteúdo em edição (pré-visualização), ainda não salvo

/* ---------------------------------------------------------------------- */
const HEADER = `/* =========================================================================
   MAVADO_TV — CONTEÚDO DO SITE
   -------------------------------------------------------------------------
   Este arquivo é gerado/atualizado pelo editor visual (editar-site.cmd).
   Também pode ser editado à mão: é um objeto JSON comum.
   ========================================================================= */
`;

async function readData() {
  const code = await fs.readFile(DATA_FILE, "utf8");
  const ctx = { window: {} };
  vm.runInNewContext(code, ctx, { timeout: 1000 });
  return JSON.parse(JSON.stringify(ctx.window.MAVADO));
}

function validate(data) {
  if (!data || typeof data !== "object") throw new Error("Conteúdo inválido.");
  for (const k of ["channel", "games"]) if (!(k in data)) throw new Error(`Campo obrigatório ausente: ${k}`);
  if (!Array.isArray(data.games)) throw new Error("A lista de jogos está corrompida.");
  const ids = new Set();
  for (const g of data.games) {
    if (!g.id || !/^[a-z0-9-]+$/.test(g.id)) throw new Error(`Jogo "${g.name || "?"}": o endereço só pode ter letras minúsculas, números e hífen.`);
    if (ids.has(g.id) || g.id === "canal") throw new Error(`Endereço de jogo repetido ou reservado: ${g.id}`);
    ids.add(g.id);
    const sids = new Set();
    for (const s of g.sections || []) {
      if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) throw new Error(`Seção "${s.title || "?"}" em ${g.name}: endereço inválido.`);
      if (sids.has(s.id)) throw new Error(`Seção com endereço repetido em ${g.name}: ${s.id}`);
      sids.add(s.id);
    }
  }
}

async function writeData(data) {
  validate(data);
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.copyFile(DATA_FILE, path.join(BACKUP_DIR, `data-${stamp}.js`)).catch(() => {});
  const backups = (await fs.readdir(BACKUP_DIR)).filter((f) => f.startsWith("data-")).sort();
  for (const old of backups.slice(0, Math.max(0, backups.length - 30))) await fs.unlink(path.join(BACKUP_DIR, old)).catch(() => {});
  const tmp = DATA_FILE + ".tmp";
  await fs.writeFile(tmp, `${HEADER}window.MAVADO = ${JSON.stringify(data, null, 2)};\n`, "utf8");
  await fs.rename(tmp, DATA_FILE);
}

async function listImages() {
  const out = [];
  async function walk(dir) {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (IMG_EXT.has(path.extname(e.name).toLowerCase())) {
        const st = await fs.stat(full);
        out.push({ path: path.relative(ROOT, full).split(path.sep).join("/"), size: st.size, mtime: st.mtimeMs });
      }
    }
  }
  await walk(path.join(ROOT, "assets/img"));
  return out.sort((a, b) => b.mtime - a.mtime);
}

const slug = (s) =>
  String(s || "imagem").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "imagem";

function git(argv, opts = {}) {
  return new Promise((resolve) => {
    execFile("git", argv, { cwd: ROOT, timeout: opts.timeout || 120000, windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } }, (err, stdout, stderr) =>
      resolve({ ok: !err, code: err ? err.code : 0, out: `${stdout || ""}${stderr || ""}`.trim() })
    );
  });
}

async function gitStatus() {
  const inside = await git(["rev-parse", "--is-inside-work-tree"]);
  if (!inside.ok) return { repo: false };
  const [branch, status, last, remote] = await Promise.all([
    git(["rev-parse", "--abbrev-ref", "HEAD"]),
    git(["status", "--porcelain"]),
    git(["log", "-1", "--format=%h · %s · %cr"]),
    git(["remote", "get-url", "origin"]),
  ]);
  const files = status.out
    ? status.out.split(/\r?\n/).map((l) => l.trim().match(/^(\S{1,2})\s+(.+)$/)).filter(Boolean).map(([, state, file]) => ({ state, file }))
    : [];
  return { repo: true, branch: branch.out, files, last: last.out, remote: remote.ok ? remote.out : "" };
}

async function publish(message) {
  const log = [];
  const step = async (label, argv, opts) => {
    const r = await git(argv, opts);
    log.push(`$ git ${argv.join(" ")}\n${r.out}`);
    if (!r.ok) throw Object.assign(new Error(label), { log });
    return r;
  };
  const st = await gitStatus();
  if (!st.repo) throw Object.assign(new Error("Esta pasta não é um repositório git."), { log });
  if (st.files.length) {
    await step("Falha ao adicionar arquivos", ["add", "-A"]);
    await step("Falha ao criar o commit", ["commit", "-m", message || "Atualização pelo editor"]);
  }
  await step("Falha ao baixar atualizações do GitHub (pull)", ["pull", "--rebase", "--autostash"], { timeout: 180000 });
  await step("Falha ao enviar para o GitHub (push). Verifique se você tem acesso ao repositório.", ["push"], { timeout: 180000 });
  return log;
}

/* ---------------------------------------------------------------------- */
function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req, limit = 20 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("Arquivo grande demais.")); req.destroy(); }
      else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function serveFile(res, rel, transform) {
  const full = path.resolve(ROOT, "." + path.posix.normalize("/" + decodeURIComponent(rel)));
  if (!full.startsWith(ROOT + path.sep) && full !== ROOT) return send(res, 403, "Proibido", "text/plain");
  if (/[\\/](\.git|\.backups)([\\/]|$)/.test(full)) return send(res, 403, "Proibido", "text/plain");
  let target = full;
  try {
    if ((await fs.stat(target)).isDirectory()) target = path.join(target, "index.html");
    let body = await fs.readFile(target);
    if (transform) body = transform(body.toString("utf8"));
    return send(res, 200, body, MIME[path.extname(target).toLowerCase()] || "application/octet-stream");
  } catch {
    return send(res, 404, "Não encontrado", "text/plain; charset=utf-8");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    // Proteção contra DNS rebinding: só aceita Host local
    const host = (req.headers.host || "").replace(/:\d+$/, "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) return send(res, 403, "Acesso apenas local", "text/plain");

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const p = url.pathname;

    // Chamadas que alteram algo exigem o token do editor
    if (p.startsWith("/api/") && req.method !== "GET" && req.headers["x-editor-token"] !== TOKEN)
      return send(res, 403, { error: "Token inválido. Recarregue o editor." });

    if (p === "/api/ping") return send(res, 200, { editor: true });
    if (p === "/api/data" && req.method === "GET") return send(res, 200, draft || (await readData()));
    if (p === "/api/saved" && req.method === "GET") return send(res, 200, await readData());

    if (p === "/api/draft" && req.method === "POST") {
      draft = JSON.parse((await readBody(req)).toString("utf8"));
      return send(res, 200, { ok: true });
    }
    if (p === "/api/draft" && req.method === "DELETE") { draft = null; return send(res, 200, { ok: true }); }
    if (p === "/api/draft.js") {
      const data = draft || (await readData());
      return send(res, 200, `window.MAVADO = ${JSON.stringify(data)};`, MIME[".js"]);
    }

    if (p === "/api/save" && req.method === "POST") {
      const data = JSON.parse((await readBody(req)).toString("utf8"));
      try { await writeData(data); } catch (e) { return send(res, 400, { error: e.message }); }
      draft = null;
      return send(res, 200, { ok: true });
    }

    if (p === "/api/images") return send(res, 200, await listImages());

    if (p === "/api/upload" && req.method === "POST") {
      const ext = path.extname(url.searchParams.get("name") || "").toLowerCase();
      if (!IMG_EXT.has(ext)) return send(res, 400, { error: "Formato não suportado. Use PNG, JPG, WEBP ou GIF." });
      const buf = await readBody(req, 15 * 1024 * 1024);
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const name = `${slug(path.basename(url.searchParams.get("name"), ext))}-${crypto.randomBytes(3).toString("hex")}${ext}`;
      await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
      return send(res, 200, { path: `assets/img/uploads/${name}`, size: buf.length });
    }

    if (p === "/api/status") return send(res, 200, await gitStatus());
    if (p === "/api/publish" && req.method === "POST") {
      const { message } = JSON.parse((await readBody(req)).toString("utf8") || "{}");
      try {
        const log = await publish(String(message || "").slice(0, 200));
        return send(res, 200, { ok: true, log: log.join("\n\n") });
      } catch (e) {
        return send(res, 500, { error: e.message, log: (e.log || []).join("\n\n") });
      }
    }

    if (p.startsWith("/api/")) return send(res, 404, { error: "Rota desconhecida" });

    // Editor (token injetado na página)
    if (p === "/edit" || p === "/edit/")
      return serveFile(res, "editor/index.html", (html) => html.replace("__EDITOR_TOKEN__", TOKEN));

    // Pré-visualização: o site usando o rascunho em memória
    if (p === "/preview")
      return serveFile(res, "index.html", (html) =>
        html.replace('<head>', '<head>\n  <base href="/" />').replace('src="assets/js/data.js"', `src="/api/draft.js?t=${Date.now()}"`)
      );

    if (p.startsWith("/editor/") && p !== "/editor/editor.js" && p !== "/editor/editor.css") return send(res, 404, "Não encontrado", "text/plain");
    return serveFile(res, p === "/" ? "index.html" : p.slice(1));
  } catch (e) {
    console.error(e);
    send(res, 500, { error: e.message || "Erro interno" });
  }
});

function openBrowser(url) {
  const cmd = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  try { spawn(cmd[0], cmd[1], { detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch { /* ignora */ }
}

function listen(tries = 0) {
  server.once("error", (e) => {
    if (e.code === "EADDRINUSE" && tries < 10) { PORT += 1; listen(tries + 1); }
    else { console.error("Não foi possível iniciar o servidor:", e.message); process.exit(1); }
  });
  server.listen(PORT, "127.0.0.1", () => {
    const url = `http://localhost:${PORT}/edit`;
    console.log(`\n  MAVADO_TV · editor rodando\n\n  Editor:  ${url}\n  Site:    http://localhost:${PORT}/\n\n  Para encerrar, feche esta janela (ou Ctrl+C).\n`);
    if (OPEN) openBrowser(url);
  });
}

if (!fss.existsSync(DATA_FILE)) { console.error("assets/js/data.js não encontrado."); process.exit(1); }
listen();
