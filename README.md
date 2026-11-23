# MAVADO_TV — Hub de Builds

Site do streamer **[Mavado_TV](https://www.twitch.tv/mavado_tv)**: builds de Path of Exile 1 e Diablo 4, Atlas por fase da liga, Genesis Tree, série de craft e ferramentas de QoL.

HTML, CSS e JavaScript puros: **sem build e sem dependências**. Funciona em GitHub Pages, Netlify, Vercel ou qualquer host estático.

## Estrutura

```
index.html            → casca do site (header, footer, modais)
404.html              → redireciona links antigos (/melee, /atlas, /buildsd4…) para as rotas novas
assets/
  css/style.css       → design system (cores da live, cards, responsivo)
  js/data.js          → TODO o conteúdo do site (builds, atlas, ferramentas, vídeos…)
  js/app.js           → rotas, páginas, busca, player, status da live
  img/brand/          → logo, avatar, banner, favicon e imagem de compartilhamento
  img/twitch/         → painéis da live (Seja Sub, Doar, Regras, parceiros…)
  img/games/          → logos dos jogos
  img/poe1/, img/d4/  → ícones de categorias, Atlas, Genesis, ferramentas e classes
netlify.toml          → config Netlify
vercel.json           → config Vercel
.github/workflows/    → deploy automático no GitHub Pages
```

## Editando o conteúdo

Tudo fica em **`assets/js/data.js`**. Exemplos:

**Nova build de PoE 1** (dentro de `poe1.builds`):

```js
{ cat: "melee", skill: "Nome da Skill", asc: "Ascendência", by: "Criador",
  byUrl: "https://www.youtube.com/@canal", video: "ID_DO_VIDEO", pob: "https://pobb.in/xxxx" },
```

- `cat`: `melee`, `spell`, `mine`, `projectile`, `minion`, `totem` ou `lab`
- `video`: o ID do YouTube (o que vem depois de `watch?v=`) ou a URL completa
- `pob`: link do PoB, ou `null` se ainda não existir
- `br: true` mostra o selo **PT-BR** na capa

**Trocar a build do Mavado:** edite `poe1.mavadoBuild`.

**Liberar PoE 2 ou HellClock:** hoje aparecem como “Em breve” (`status: "soon"` em `games`).

## Rotas

| Rota | Página |
|---|---|
| `#/` | Início |
| `#/poe1` | Hub PoE 1 |
| `#/poe1/builds` · `#/poe1/builds/melee` | Builds (com filtro por categoria) |
| `#/poe1/atlas` · `#/poe1/atlas/end` | Atlas (`inicial`, `early`, `mid`, `end`) |
| `#/poe1/genesis` | Genesis Tree |
| `#/poe1/utilitarios` | Ferramentas |
| `#/poe1/craft` | Série de craft (o progresso fica salvo no navegador) |
| `#/d4` · `#/d4/builds` · `#/d4/runewords` | Diablo 4 |
| `#/canal` | Sobre o Mavado: bio, setup, regras, contato e parceiros |
| `#/poe2` · `#/hellclock` | Em breve |

As rotas usam `#`, então funcionam em qualquer host sem configurar rewrites.

## Testando localmente

```powershell
python -m http.server 8080
```

Depois abra http://localhost:8080. Abrir o `index.html` direto (file://) também funciona, mas o player da Twitch precisa de um servidor.

## Publicando

### GitHub Pages em `https://mavadotv.github.io`

O endereço `NOME.github.io` só existe para uma **conta ou organização** chamada `NOME`, com um repositório chamado exatamente `NOME.github.io`. Sem precisar de uma conta nova:

1. Logado na sua conta, crie uma **organização gratuita** chamada `mavadotv` em [github.com/organizations/plan](https://github.com/organizations/plan) (plano *Free*). Você vira dono dela e pode convidar o Mavado como membro.
2. Dentro da organização, crie um repositório **público** chamado `mavadotv.github.io`, vazio, sem README.
3. Envie os arquivos para a branch `main`:
   ```powershell
   git init -b main
   git add .
   git commit -m "Site Mavado_TV"
   git remote add origin https://github.com/mavadotv/mavadotv.github.io.git
   git push -u origin main
   ```
4. No repositório, em **Settings → Pages**, em *Source*, escolha **GitHub Actions**.
5. O workflow `.github/workflows/pages.yml` publica a cada push. Em 1–2 minutos o site está em https://mavadotv.github.io.

Se publicar em outro endereço (ex.: `draconyte.github.io/mavado`), o site funciona igual, porque todos os caminhos são relativos. Só troque `https://mavadotv.github.io` em `index.html`, `robots.txt` e `sitemap.xml`, que é usado na imagem de compartilhamento.

(Alternativa sem Actions: *Source* → **Deploy from a branch** → `main` / `root`.)

### Netlify
Arraste a pasta em [app.netlify.com/drop](https://app.netlify.com/drop) ou conecte o repositório. Sem comando de build, diretório de publicação `.`.

### Vercel
Importe o repositório em [vercel.com/new](https://vercel.com/new). Framework preset: **Other**, sem comando de build.

## Recursos

- Visual nas cores da live: verde tóxico + roxo neon, com logo, avatar, banner e painéis do canal
- Ícones originais das categorias, Atlas, Genesis, ferramentas e classes do D4
- Para trocar uma imagem, substitua o arquivo em `assets/img/` mantendo o nome (ou altere o caminho em `data.js`)
- Busca global com **Ctrl+K** ou **/**: builds, criadores, ferramentas, vídeos e farms
- Vídeos tocam num player dentro do site (youtube-nocookie)
- Indicador **AO VIVO** da Twitch (via decapi.me) e player que só carrega quando você clica
- Checklist das aulas de craft salvo no navegador
- Responsivo, navegável por teclado, respeita `prefers-reduced-motion`

---
Conteúdo reunido de criadores da comunidade; os créditos ficam com cada autor. Site por NGL Tech Solutions.
