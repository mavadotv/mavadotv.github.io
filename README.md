# MAVADO_TV — Hub de Builds

Site do streamer **[Mavado_TV](https://www.twitch.tv/mavado_tv)**: builds de Path of Exile 1 e Diablo 4, Atlas por fase da liga, Genesis Tree, série de craft e ferramentas de QoL.

HTML, CSS e JavaScript puros: **sem build e sem dependências**. Funciona em GitHub Pages, Netlify, Vercel ou qualquer host estático.

## Estrutura

```
editar-site.cmd       → abre o editor visual (duplo clique, Windows)
editar-site.sh        → o mesmo para macOS / Linux
editor/               → editor visual local (não vai para o site publicado)
index.html            → casca do site (header, footer, modais)
404.html              → redireciona links antigos (/melee, /atlas, /buildsd4…) para as rotas novas
assets/
  css/style.css       → design system (cores da live, cards, responsivo)
  js/data.js          → TODO o conteúdo do site (gerado pelo editor; é JSON)
  js/app.js           → rotas, páginas, busca, player, status da live
  img/uploads/        → imagens enviadas pelo editor
  img/brand/          → logo, avatar, banner, favicon e imagem de compartilhamento
  img/twitch/         → painéis da live (Seja Sub, Doar, Regras, parceiros…)
  img/games/          → logos dos jogos
  img/poe1/, img/d4/  → ícones de categorias, Atlas, Genesis, ferramentas e classes
netlify.toml          → config Netlify
vercel.json           → config Vercel
.github/workflows/    → deploy automático no GitHub Pages
```

## Editor visual (para quem não programa)

Dá para mudar **textos, imagens, cores, jogos, seções, builds, vídeos e links** sem mexer em código, e depois publicar.

**Precisa:** [Node.js](https://nodejs.org) (versão LTS) instalado. Para publicar, o projeto precisa ter sido clonado com o Git e você precisa ter acesso ao repositório no GitHub.

1. Dê **dois cliques em `editar-site.cmd`**. O editor abre no navegador em `http://localhost:8080/edit`. Deixe a janela preta aberta enquanto edita.
2. No menu da esquerda, escolha o que editar. A prévia do lado direito mostra o resultado na hora (no celular, toque em **Prévia**).
3. **Imagens:** clique no quadrado da imagem ou arraste um arquivo. Ela é redimensionada e convertida para WebP automaticamente.
4. **Salvar** (`Ctrl+S`) grava no computador. **Desfazer** (`Ctrl+Z`) volta a última mudança. Um backup é guardado a cada salvamento em `editor/.backups/`.
5. **Publicar** envia tudo para o GitHub e o site no ar atualiza em 1–2 minutos. Na primeira vez, o Windows pode pedir login no GitHub.

**Atalho escondido:** com o editor rodando, abra o site (`http://localhost:8080`) e digite **`/edit`**.

O editor só existe no seu computador: ele não é publicado e só aceita conexões da própria máquina.

### Como o conteúdo é organizado

Cada **jogo** tem uma lista de **seções**. Cada seção é de um destes tipos:

| Tipo | Para quê | Exemplo atual |
|---|---|---|
| **Builds** | Cards com capa do vídeo, PoB, criador e filtro por categoria | PoE 1 › Builds |
| **Fases / estratégias** | Abas por fase, cada uma com estratégias | PoE 1 › Atlas |
| **Links / cartões** | Links com imagem, em 3 estilos visuais | Utilitários, Genesis Tree, classes do D4 |
| **Série de vídeos** | Aulas numeradas com checklist de progresso | PoE 1 › Craft |
| **Destaque** | Chamada com botão e imagem grande | D4 › Runewords |

Um jogo marcado como **Em breve** (ou sem seções) mostra a página “Em breve”. Os endereços das páginas seguem o padrão `#/<jogo>/<seção>`.

O conteúdo fica em `assets/js/data.js`, no formato `window.MAVADO = { …JSON… }`. Também dá para editá-lo à mão.

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
| `#/<jogo>/<seção>` | Qualquer jogo ou seção criados pelo editor |

As rotas usam `#`, então funcionam em qualquer host sem configurar rewrites.

## Testando localmente

Use o próprio editor (`editar-site.cmd`), que também serve o site em http://localhost:8080. Se preferir só ver o site:

```powershell
python -m http.server 8080
```

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
- Editor visual local com prévia ao vivo, upload de imagens e botão de publicar
- Busca global com **Ctrl+K** ou **/**: builds, criadores, ferramentas, vídeos e farms
- Vídeos tocam num player dentro do site (youtube-nocookie)
- Indicador **AO VIVO** da Twitch (via decapi.me) e player que só carrega quando você clica
- Checklist das aulas de craft salvo no navegador
- Responsivo, navegável por teclado, respeita `prefers-reduced-motion`

---
Conteúdo reunido de criadores da comunidade; os créditos ficam com cada autor. Site por NGL Tech Solutions.
