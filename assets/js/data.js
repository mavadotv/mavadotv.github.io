/* =========================================================================
   MAVADO_TV — BASE DE DADOS DO SITE
   -------------------------------------------------------------------------
   Todo o conteúdo do site vive aqui. Para adicionar/editar uma build,
   ferramenta, vídeo ou estratégia, basta alterar este arquivo.
   - video: ID do YouTube (o trecho depois de "watch?v=") ou URL completa
   - pob:   link do Path of Building (pobb.in, poe.ninja...) ou null
   ========================================================================= */

window.MAVADO = {
  channel: {
    name: "Mavado_TV",
    twitch: "mavado_tv",
    twitchUrl: "https://www.twitch.tv/mavado_tv",
    subUrl: "https://www.twitch.tv/subs/mavado_tv",
    donateUrl: "https://livepix.gg/mavadotv",
    support: { label: "Apoie o criador do site", url: "https://livepix.gg/pwnage" },
    credit: { label: "Pwnage", url: "https://twitch.tv/pwnage_1" },

    img: {
      logo: "assets/img/brand/logo.webp",
      avatar: "assets/img/brand/avatar.webp",
      banner: "assets/img/brand/banner.webp",
    },

    team: "TheNocturnals",
    bio: "Eae rapaziada, me chamo Bruno, mas nos games sou mais conhecido como Mavado. Aqui a gente joga vários ActionRPGs e o intuito da live é ensinar e aprender junto com vocês. Bora que a resenha é garantida!",

    socials: [
      { id: "twitch", label: "Twitch", url: "https://www.twitch.tv/mavado_tv" },
      { id: "youtube", label: "YouTube", url: "https://www.youtube.com/@MavadoTv" },
      { id: "instagram", label: "Instagram", url: "https://www.instagram.com/mavadotv/" },
      { id: "x", label: "X / Twitter", url: "https://x.com/Mavado_Tv" },
    ],

    contact: "contatomavadotv@gmail.com",

    setup: [
      ["Processador", "Ryzen 7 5700X"],
      ["Placa de vídeo", "RTX 4060"],
      ["Placa-mãe", "B550M AORUS ELITE"],
      ["Memória", "32 GB 3600 MHz"],
      ["Webcam", "Logitech C920s Pro"],
      ["Mouse", "Logitech G600"],
      ["Headset", "Morcego V2 Wireless"],
      ["Teclado", "T-Dagger Bora RGB"],
    ],

    rules: [
      "Não toleramos xingamentos.",
      "Sem abuso de mensagens em CAPS LOCK.",
      "Sem spam / flood.",
      "Sem postar links sem permissão.",
      "Se respeitem.",
    ],

    // Painéis do canal (imagens da própria live)
    panels: {
      sub: "assets/img/twitch/seja-sub.webp",
      donate: "assets/img/twitch/doar.webp",
      hardware: "assets/img/twitch/hardware.webp",
      contact: "assets/img/twitch/contato.webp",
      rules: "assets/img/twitch/regras.webp",
    },

    partners: [
      { name: "ExitLag", desc: "50% OFF + 90 dias grátis com o link do Mavado.", url: "https://www.exitlag.com/refer/MAVADO", img: "assets/img/twitch/exitlag.webp", cmd: "!exitlag" },
      { name: "Kaspersky", desc: "Desconto no Kaspersky Premium com o link do canal.", url: "https://www.seguranca.gg/mavadotv/", img: "assets/img/twitch/kaspersky.webp", cmd: "!kaspersky" },
    ],
  },

  games: [
    {
      id: "poe1",
      logo: "assets/img/games/poe1.webp",
      name: "Path of Exile 1",
      short: "PoE 1",
      status: "live",
      tagline: "Builds, Atlas, Genesis Tree, Craft e QoL para a sua liga.",
      about:
        "Conteúdo para ajudar no seu progresso durante a liga: builds de criadores de conteúdo, Atlas para starter e endgame e ferramentas de QoL.",
    },
    {
      id: "d4",
      logo: "assets/img/games/d4.webp",
      name: "Diablo 4",
      short: "Diablo 4",
      status: "live",
      tagline: "Leveling builds por classe e receitas de Runeword da season.",
      about:
        "Conteúdo para ajudar no seu progresso durante a season: builds de criadores de conteúdo, trees para o seu planner e QoL.",
    },
    {
      id: "poe2",
      logo: "assets/img/games/poe2.webp",
      name: "Path of Exile 2",
      short: "PoE 2",
      status: "soon",
      tagline: "Builds, Atlas para starter e endgame e QoL.",
      about:
        "Em breve: builds de criadores de conteúdo, Atlas para o seu starter e endgame e QoL para quem joga Path of Exile 2.",
    },
    {
      id: "hellclock",
      logo: "assets/img/games/hellclock.webp",
      name: "HellClock",
      short: "HellClock",
      status: "soon",
      tagline: "Guias para a sua jogatina.",
      about: "Em breve: conteúdo para ajudar no seu progresso durante a sua jogatina de HellClock.",
    },
  ],

  /* ---------------------------------------------------------------------
     PATH OF EXILE 1
     --------------------------------------------------------------------- */
  poe1: {
    mavadoBuild: {
      skill: "Reap of Butchery",
      asc: "Elementalist",
      pob: "https://pobb.in/Gb7Q3LXSBXRg",
    },

    categories: [
      { id: "melee", img: "assets/img/poe1/cat/melee.webp", label: "Melee", desc: "Corpo a corpo: league starters e builds de endgame." },
      { id: "spell", img: "assets/img/poe1/cat/spell.webp", label: "Spell", desc: "Feitiços para limpar mapa e derreter bosses." },
      { id: "mine", img: "assets/img/poe1/cat/mine.webp", label: "Mine", desc: "Minas: dano massivo detonado à distância." },
      { id: "projectile", img: "assets/img/poe1/cat/projectile.webp", label: "Projectile", desc: "Ataques à distância e projéteis." },
      { id: "minion", img: "assets/img/poe1/cat/minion.webp", label: "Minion", desc: "Deixe o exército fazer o trabalho." },
      { id: "totem", img: "assets/img/poe1/cat/totem.webp", label: "Totem", desc: "Totens e ballistas para jogar com segurança." },
      { id: "lab", img: "assets/img/poe1/cat/lab.webp", label: "Laboratório", desc: "Builds diferentonas. Não é área para novatos — cuidado para não se decepcionar, exilado!" },
    ],

    builds: [
      // ---------- MELEE ----------
      { cat: "melee", skill: "Dual Strike of Ambidexterity", asc: "Gladiator", by: "Chem", byUrl: "https://www.youtube.com/@TPR_ChemicaL", video: "UVTteaOw3vg", pob: "https://pobb.in/o-HoiIcybtuK" },
      { cat: "melee", skill: "Cyclone Shockwave", asc: "Slayer", by: "Sanavixx", byUrl: "https://www.youtube.com/@SaNaViXX", video: "JFsK67lgLhI", pob: "https://pobb.in/z0EcCeyCadzN" },
      { cat: "melee", skill: "Boneshatter of Complex Trauma", asc: "Juggernaut", by: "Zizaran", byUrl: "https://www.youtube.com/@Zizaran", video: "D79KG-lJoWU", pob: "https://pobb.in/6Mu4iCb2L9eP" },
      { cat: "melee", skill: "Earthshatter", asc: "Berserker", by: "Everseen", byUrl: "https://www.youtube.com/@everseenTV", video: "iGR5qEDfvi8", pob: "https://pobb.in/oKu3Sq1BWdM-" },
      { cat: "melee", skill: "Viper Strike of the Mamba", asc: "Pathfinder", by: "AnimePrincess", byUrl: "https://www.youtube.com/@anime.princess", video: "S2mtIrX4xXU", pob: "https://pobb.in/7HNEMzScQyDR" },
      { cat: "melee", skill: "Ice Crash Ignite", asc: "Chieftain", by: "CrouchingTuna", byUrl: "https://www.youtube.com/@CrouchingTuna", video: "YTTcKnqipOM", pob: "https://pobb.in/5SUgW1uNvC2F" },
      { cat: "melee", skill: "Ground Slam Earthshaking", asc: "Slayer", by: "PhazePlays", byUrl: "https://www.youtube.com/@PhazePlays_", video: "3kmz88dm5Zw", pob: "https://pobb.in/QKoFv0repDMz" },
      { cat: "melee", skill: "Viper Strike of the Mamba", asc: "Assassin", by: "Jungroan", byUrl: "https://www.youtube.com/@jungroan", video: "FzGUSetP99o", pob: "https://pobb.in/Nri6OJD1SmV4" },
      { cat: "melee", skill: "Cast When Stunned", asc: "Chieftain", by: "Emiracle", byUrl: "https://www.youtube.com/@HolyFkingShit", video: "PJI_gQk7IFs", pob: "https://pobb.in/jWfO4r4GGeB2" },

      // ---------- SPELL ----------
      { cat: "spell", skill: "Crackling Lance", asc: "Elementalist", by: "Peuget2", byUrl: "https://www.youtube.com/@Peuget2", video: "H_k45J_60Mo", pob: "https://pobb.in/WbE85wk1-bX2" },
      { cat: "spell", skill: "Righteous Fire", asc: "Chieftain", by: "Pohx", byUrl: "https://www.youtube.com/pohxkappa", video: "7flriI9ltHM", pob: "https://pobb.in/Sit6hlQU1uuZ" },
      { cat: "spell", skill: "Archmage Shock Nova of Procession", asc: "Hierophant", by: "Goratha", byUrl: "https://www.youtube.com/@Goratha", video: "gYQvyebX8ZM", pob: "https://pobb.in/-VqGZTsuXsCt" },
      { cat: "spell", skill: "Penance Brand", asc: "Elementalist", by: "Goratha", byUrl: "https://www.youtube.com/@Goratha", video: "42t9yK-9_Go", pob: "https://pobb.in/GdRDXlLb4QNW" },
      { cat: "spell", skill: "Energy Blade", asc: "Inquisitor", by: "CaptainLance9", byUrl: "https://www.youtube.com/@CaptainLance9", video: "MZcElp_q_94", pob: "https://pobb.in/mi4DpMHwyr1J" },
      { cat: "spell", skill: "Essence Drain Contagion", asc: "Occultist", by: "Sasaki", byUrl: "https://www.youtube.com/@FSasakiTV", video: "UTFL9ZRNpbk", pob: "https://pobb.in/PfrGHW7YkQqU", br: true },
      { cat: "spell", skill: "Essence Drain Contagion", asc: "Occultist", by: "Goratha", byUrl: "https://www.youtube.com/@Goratha", video: "b4DX6FqZXIs", pob: "https://pobb.in/PfrGHW7YkQqU" },

      // ---------- MINE ----------
      { cat: "mine", skill: "Glacial Cascade of the Fissure", asc: "Elementalist", by: "Asmodeus", byUrl: "https://www.youtube.com/@AsmodeusClips", video: "CJ5BscET7H0", pob: "https://pobb.in/acqa6APXHx2T" },
      { cat: "mine", skill: "Glacial Cascade of the Fissure", asc: "Elementalist", by: "Smokie777", byUrl: "https://www.youtube.com/@smokie_777", video: "XbPkEupMSbo", pob: "https://poe.ninja/poe1/pob/9244b" },

      // ---------- PROJECTILE ----------
      { cat: "projectile", skill: "Elemental Hit of the Spectrum", asc: "Deadeye", by: "Fubgun", byUrl: "https://www.youtube.com/@Fubgun", video: "Ov5KpoNcvr4", pob: "https://pobb.in/0YXDuYOquaI5" },
      { cat: "projectile", skill: "Toxic Rain", asc: "Pathfinder", by: "Path of Evening", byUrl: "https://www.youtube.com/@PathofEvening", video: "UHm_-qgAtyg", pob: "https://pobb.in/nv8Tqwq5OMvW" },
      { cat: "projectile", skill: "Poisonous Concoction of Bouncing", asc: "Pathfinder", by: "AnimePrincess", byUrl: "https://www.youtube.com/@anime.princess", video: "-ag64ohx7DI", pob: "https://pobb.in/Xb6N6JirbqBc" },
      { cat: "projectile", skill: "Poisonous Concoction of Bouncing", asc: "Assassin", by: "Jungroan", byUrl: "https://www.youtube.com/@jungroan", video: "jyVJ1qGd9Fw", pob: "https://pobb.in/oI4me6qfpJAX" },
      { cat: "projectile", skill: "Kinetic Fusillade", asc: "Hierophant", by: "Palsteron", byUrl: "https://www.youtube.com/@Palsteron", video: "7n0fMQ4NPlA", pob: "https://pobb.in/6a4dyX89Oo1d" },
      { cat: "projectile", skill: "Kinetic Blast of Clustering", asc: "Necromancer", by: "Redviles", byUrl: "https://www.youtube.com/@Redvilespoe", video: "QOXeHiSK-9U", pob: "https://pobb.in/eNA2PgSpYH6A" },
      { cat: "projectile", skill: "Power Siphon", asc: "Assassin", by: "Afana", byUrl: "https://www.youtube.com/@afanapoe", video: "oTWbO2cGQq0", pob: "https://pobb.in/K3l1pb2mO6MP" },

      // ---------- MINION ----------
      { cat: "minion", skill: "Summon Raging Spirit", asc: "Necromancer", by: "Deadpool", byUrl: "https://www.youtube.com/@xlDeaDPooLL", video: "vnBcqgADVjw", pob: "https://pobb.in/RwZ_dDjmMbhP" },
      { cat: "minion", skill: "Absolution", asc: "Guardian", by: "Ronarray", byUrl: "https://www.youtube.com/@ronarray", video: "Z4tVWAIqOkE", pob: "https://pobb.in/6413_j4sca4m" },
      { cat: "minion", skill: "Animated Weapon", asc: "Necromancer", by: "Rusei", byUrl: "https://www.youtube.com/@RuSeI-s7j", video: "9JiHNYdS5E8", pob: "https://pobb.in/AVF66KF5oUZB" },
      { cat: "minion", skill: "Poison BAMA", asc: "Necromancer", by: "Pr3vie", byUrl: "https://www.youtube.com/@Pr3vie", video: "RoMJe0wcg5c", pob: "https://pobb.in/kfDhid-eNgUz" },
      { cat: "minion", skill: "Lightning BAMA", asc: "Necromancer", by: "Pr3vie", byUrl: "https://www.youtube.com/@Pr3vie", video: "j7ucFX2cBSw", pob: "https://pobb.in/5J9UmhP_LcnX" },
      { cat: "minion", skill: "Summon Phantasm", asc: "Occultist", by: "Afana", byUrl: "https://www.youtube.com/@afanapoe", video: "cy3Lvu6lBhw", pob: "https://pobb.in/O72rvygu4DC1" },

      // ---------- TOTEM ----------
      { cat: "totem", skill: "Explosive Arrow Ballista", asc: "Elementalist", by: "Palsteron", byUrl: "https://www.youtube.com/@Palsteron", video: "dVsDkiJNNfQ", pob: "https://pobb.in/sTMjoSd2wzfK" },
      { cat: "totem", skill: "Siege Ballista", asc: "Hierophant", by: "POEGuy", byUrl: "https://www.youtube.com/@poeguy007", video: "XXIGBMWkM-Q", pob: null },
      { cat: "totem", skill: "Storm Burst Totem", asc: "Hierophant", by: "aer0planeGaming", byUrl: "https://www.youtube.com/@aer0planegaming781", video: "fCnYDU84q18", pob: "https://pobb.in/6Er4J2m8HEpZ" },

      // ---------- LABORATÓRIO ----------
      { cat: "lab", skill: "Spark Archmage", asc: "Hierophant", by: "Big Ducks", byUrl: "https://www.youtube.com/@BigDucks", video: "DpHXNVNeH88", pob: "https://pobb.in/oLWVUO1gqaMo" },
      { cat: "lab", skill: "Flicker Strike", asc: "Slayer", by: "MAGEFIST", byUrl: "https://www.youtube.com/@MAGEFIST", video: "ZxXjPVJQyk8", pob: "https://pobb.in/OIn3OsF4nVvR" },
      {
        cat: "lab", skill: "Leveling", asc: "Todas as classes", by: "LazyExile", byUrl: "https://www.youtube.com/@LazyExile", video: "zULWkgfvtok", pob: null,
        pobs: [
          ["Duelist", "https://pobb.in/kZ6hMjJjzDQ-"],
          ["Marauder", "https://pobb.in/6eLzfDOsWEx9"],
          ["Ranger", "https://pobb.in/slLESaekWjCx"],
          ["Scion", "https://pobb.in/S8XrSF0fgWHg"],
          ["Shadow", "https://pobb.in/5cdIywKvpyYO"],
          ["Templar", "https://pobb.in/hIWmVH9A1mM4"],
          ["Witch", "https://pobb.in/JtcQ9ivQmN8I"],
        ],
      },
    ],

    atlas: [
      {
        id: "inicial", img: "assets/img/poe1/atlas/inicial.webp", label: "Atlas Inicial", phase: "Início",
        intro: "Tree inicial para progredir nos seus mapas durante o league start.",
        strats: [
          { name: "Atlas de progressão", url: "https://encurtador.com.br/TPDH", notes: "Abra o planner, copie a tree e comece a subir de tier com segurança." },
        ],
      },
      {
        id: "early", img: "assets/img/poe1/atlas/early.webp", label: "Early Game", phase: "Início da liga",
        intro: "Farms para o começo da liga, quando o objetivo é fazer gold e currency rápido.",
        strats: [
          { name: "Gold + Currency", url: "https://poeplanner.com/a/64JH", map: "Tier 16 com Pack Size 25%+", notes: "Não tem muito o que dizer: abra o mapa e corra!" },
        ],
      },
      {
        id: "mid", img: "assets/img/poe1/atlas/mid.webp", label: "Mid Game", phase: "Meio da liga",
        intro: "Estratégias para quando a build já está de pé e é hora de escalar o lucro.",
        strats: [
          { name: "Legion — Explosão de Itens", url: "https://poeplanner.com/a/6RtO", map: "Tier 16", threads: ["Legion Thread x1 – x8"], notes: "Quanto mais threads, melhor o loot." },
          {
            name: "Essence + Invitation", url: "https://poeplanner.com/a/64Ls", credit: ["Shineray50cc", "https://www.twitch.tv/shineray50cc"], map: "Shaper Guardian Map",
            notes: "Leve algumas Vaal Orbs no inventário. Corrompa as essências uma vez para roletar; se vierem essências que podem se transformar, corrompa novamente. Essências que se transformam: Misery, Envy, Scorn e Dread.",
          },
          { name: "Harvest + Red Altars", url: "https://wealthyexile.com/strategies/8298/harvest__red_altars__map_farming", map: "Tier 16 (Strand) · Atlas Drop 60%+", threads: ["Breach Thread x1", "Incursion Thread x1", "Ritual Thread x1"], notes: "Mapas com 6 mods e 60%+ de Atlas Drop. É só ser feliz com as frutinhas e os drops dos altares do Searing." },
          { name: "Farm de EXP", url: "https://poeplanner.com/a/64Nn", map: "Tier 16 (Jungle Valley tem o melhor layout)", threads: ["Breach Thread x1", "Abyss Thread x1"], notes: "Mate os mobs e seja feliz com a sua exp subindo!" },
          { name: "Stacked Deck + Ritual", url: "https://farmofexile.com/poe1/article/allflame-stacked-deck-farming-with-ritual", map: "Tier 16.5 ou Mirage Map", threads: ["Ritual Thread x1", "Expedition Thread x1", "Incursion Thread x1"], notes: "Explicação completa do farm no link." },
          { name: "Boss Rush — Covens", url: "https://atlas-blush-beta.vercel.app/#oQL-K9b2MF5bF9siOL4rq_Hr2V-fDfUuovrnWILZVC0BTtA", map: "Tier 16 com 26%+ Pack Size", threads: ["Use as threads mais baratas (ex.: Expedition x1, Incursion x1)"], notes: "Explicação do farm em vídeo.", extra: ["Peuget2 — explicação no YouTube", "https://www.youtube.com/watch?v=9dBc6PvaQVs"] },
          { name: "Blight", url: "https://poeplanner.com/a/64lN", map: "Tier 16 (Waste Pool) · Atlas Drop 80%+", threads: ["Blight Thread x2 (+2 do Atlas)"], notes: "Anoint nos anéis: Chilling Tower Freeze e Meteor Tower Burning Ground. Procure a linha de Currency (dentro da Mirage, se houver); se não tiver, saia e abra outro mapa. O foco é achar as linhas de Currency!", extra: ["Blight Helper — oils", "https://blight.raelys.com/"] },
        ],
      },
      {
        id: "end", img: "assets/img/poe1/atlas/end.webp", label: "End Game", phase: "Fim da liga",
        intro: "Farms pesados de fim de liga. A build precisa ter clear bom e aguentar porrada.",
        strats: [
          { name: "Legion — Drop de Divines", url: "https://poeplanner.com/a/64JU", map: "Tier 16 com 6 ou 8 mods · Tier 16.5 (melhor opção)", threads: ["Legion Thread x8 + 2 do Atlas"], notes: "Você vai ouvir alguns \"xuins\" durante os mapas — mas cuidado, a build precisa ter clear bom e aguentar a porrada!" },
          { name: "Abyss + Legion", url: "https://atlas-blush-beta.vercel.app/#oSC5qzXRl9qXPj1HFjXMXlx7befn7gd38Q79r_tPOk8wgA", map: "Tier 16.5 com Rarity 100%+", threads: ["Legion Thread x8", "Abyss Thread x8", "Bestiary Thread x8"], notes: "Aqui a coisa fica séria: mapa ultra difícil, mas pode ter certeza que divine vai ter!" },
          { name: "Boss Rush — Catarina", url: "https://youtu.be/a41COU0bwyo", map: "Syndicate Medallion no Map Device", notes: "Compre Syndicate Medallion, abra no Map Device, corra o mapa e mate a Catarina. O objetivo é dropar a Cynderswallow Urn e vender como achar melhor — identificada ou não." },
        ],
      },
    ],

    genesis: [
      { name: "Cintos Únicos", img: "assets/img/poe1/genesis/belts.webp", url: "https://maxroll.gg/poe/poe-genesis-tree/dcf4pr0t", tag: "Headhunter / Mageblood", desc: "Para quem quer tentar pegar o Headhunter ou o Mageblood e mostrar que não foi sorte, e sim \"o destino da GGG\". Ou se frustrar tentando… hehe" },
      { name: "Currency", img: "assets/img/poe1/genesis/currency.webp", url: "https://maxroll.gg/poe/poe-genesis-tree/dxf63n0t", tag: "Farm de currency", desc: "Para quem quer ver a currency dropar. Tá afim de ouvir um \"xuin\"? É aqui mesmo. Quem sabe não cai o tão sonhado Mirror of Kalandra 🪞" },
      { name: "Rathpith", img: "assets/img/poe1/genesis/rathpith.webp", url: "https://maxroll.gg/poe/poe-genesis-tree/4l7ub0lu", tag: "Rathpith Globe", desc: "Tree focada no farm do Rathpith Globe." },
      { name: "Vis Mortis", img: "assets/img/poe1/genesis/vismortis.webp", url: "https://maxroll.gg/poe/poe-genesis-tree/4y5v00li", tag: "Vis Mortis", desc: "Tree focada no farm do Vis Mortis." },
      { name: "Severed in Sleep", img: "assets/img/poe1/genesis/severed.webp", url: "https://maxroll.gg/poe/poe-genesis-tree/nq5tc0lo", tag: "Severed in Sleep", desc: "Tree focada no farm do Severed in Sleep." },
    ],

    tools: [
      { name: "Wickerman Ledger", img: "assets/img/poe1/tools/wickerman.webp", sub: "Witchcraft of the Coven", url: "https://wickermanledger.site/", type: "Site", desc: "Com a liga 3.30 chegou o Wickerman, um espantalho onde você coloca equipamentos para ganhar buffs. Planeje os seus aqui." },
      { name: "Path of Building", img: "assets/img/poe1/tools/pob.webp", url: "https://pathofbuilding.community/", type: "Programa", desc: "A ferramenta perfeita para acompanhar as builds dos criadores de conteúdo ou criar a sua do zero." },
      { name: "PoE Overlay", img: "assets/img/poe1/tools/poeoverlay.webp", url: "https://www.poeoverlay.com/download", type: "Overlay", desc: "Overlay para price-check de itens e informações do jogo." },
      { name: "Awakened PoE Trade", img: "assets/img/poe1/tools/apt.webp", url: "https://snosme.github.io/awakened-poe-trade/download", type: "Overlay", badge: "Mais leve", desc: "Outra opção de overlay para price-check de itens e informações do jogo." },
      { name: "Vorici Chromatic Calculator", img: "assets/img/poe1/tools/vorici.webp", url: "https://siveran.github.io/calc.html", type: "Calculadora", desc: "Descubra a melhor probabilidade para conseguir a combinação de cores de socket que você quer." },
      { name: "PoE Leveling", img: "assets/img/poe1/tools/leveling.webp", url: "https://poe-leveling.com/", type: "Guia", desc: "Passo a passo para progredir da melhor forma pelos atos da campanha." },
      { name: "Heist Overlay", img: "assets/img/poe1/tools/heist.webp", url: "https://github.com/devArthurA/HeistOverlay/releases", type: "Overlay", desc: "Ajuda nas runs de Heist mostrando o preço de cada item sem precisar buscar em sites externos." },
      { name: "Blight Helper", img: "assets/img/poe1/tools/blight.webp", url: "https://blight.raelys.com/", type: "Calculadora", desc: "Descubra qual combinação de oils usar para fazer o anoint do seu amuleto." },
      { name: "Mercenary Trade Search", img: "assets/img/poe1/tools/merc-search.webp", url: "https://pob.codes/tools/mercenaries/", type: "Site", desc: "Ache o seu mercenário perfeito." },
      { name: "Mercenary Price Check", img: "assets/img/poe1/tools/merc-price.webp", url: "https://xddbsns.com/mercenary-price-check.html", type: "Site", desc: "Quer saber quanto vale o seu mercenário? É aqui." },
    ],

    craft: {
      intro: "Uma série completa ensinando tudo o que você precisa saber sobre craft no Path of Exile 1. Créditos ao grande amigo Sasaki por disponibilizar esse conteúdo.",
      author: ["Sasaki", "https://www.youtube.com/@FSasakiTV"],
      videos: [
        ["07jTAhK5-mw", "Como entender Prefix, Suffix, Implícitos e Enchants"],
        ["kK5t4ql2JyU", "Como funcionam Tiers, iLvl e pesos dos modificadores"],
        ["0IL5EeJgQX8", "O que são Tags e Famílias dos modificadores"],
        ["vsQDACqzqBA", "Como escolher a base certa para craftar"],
        ["-MoaebYFlD0", "Para que servem a Crafting Bench e Metamods"],
        ["TvnR2ZYk5fg", "O que são mods Locais e Globais?"],
        ["x1L48pIBhhk", "Itens Fractured: o que são e como funcionam"],
        ["SdiSIDEts1U", "Itens e mods de influência: o que são e como funcionam"],
        ["r2lD-HJsobA", "Mods de mecânicas: Alva, Jun e Delve"],
        ["MN45iLU45gA", "Como usar Veiled Mods, Veiled Chaos e Veiled Exalted"],
        ["iV0S0rYXVxo", "Tudo sobre Awakener's Orb e Orb of Dominance"],
        ["OWu-Z9kQH0A", "Beastcraft: como funcionam Menagerie e Einhar"],
        ["IqsjkBWN_Y8", "Como usar as Eldritch Currency e Orb of Conflict"],
        ["WZ4lnusiano", "O que são as Essences e como usá-las na prática"],
        ["xSaWdqkzLEQ", "Para que servem Fossils e Resonators?"],
        ["R3yGl6KkE0M", "Harvest: como funciona e como usar Horticrafting"],
      ],
    },
  },

  /* ---------------------------------------------------------------------
     DIABLO 4
     --------------------------------------------------------------------- */
  d4: {
    tierlist: { label: "Tierlist de leveling (YouTube)", video: "yiHuHJ2FM_8" },
    classes: [
      { name: "Barbarian", img: "assets/img/d4/barbarian.webp", build: "Whirlwind", url: "https://mobalytics.gg/diablo-4/builds/barbarian-whirlwind-leveling-barb", src: "Mobalytics" },
      { name: "Druid", img: "assets/img/d4/druid.webp", build: "Lightning Storm", url: "https://mobalytics.gg/diablo-4/builds/druid-screamhearts-lightningstorm-leveling", src: "Mobalytics" },
      { name: "Spiritborn", img: "assets/img/d4/spiritborn.webp", build: "Stinger", url: "https://mobalytics.gg/diablo-4/builds/spiritborn-stinger-leveling-build-guide", src: "Mobalytics" },
      { name: "Paladin", img: "assets/img/d4/paladin.webp", build: "Hammerdin Arbiter (1–60)", url: "https://mobalytics.gg/diablo-4/builds/hammerdin-arbiter-levelling-guide-1-60", src: "Mobalytics" },
      { name: "Warlock", img: "assets/img/d4/warlock.webp", build: "Blazing Scream", url: "https://mobalytics.gg/diablo-4/builds/warlock-blazing-scream-leveling", src: "Mobalytics" },
      { name: "Necromancer", img: "assets/img/d4/necromancer.webp", build: "Minion", url: "https://maxroll.gg/d4/build-guides/minion-necromancer-leveling-guide", src: "Maxroll" },
      { name: "Rogue", img: "assets/img/d4/rogue.webp", build: "Dance of Knives", url: "https://mobalytics.gg/diablo-4/builds/rogue-dance-of-knives-leveling", src: "Mobalytics" },
      { name: "Sorcerer", img: "assets/img/d4/sorcerer.webp", build: "Leveling em vídeo", url: "https://www.youtube.com/watch?v=o-ElB6WqaHU", src: "YouTube" },
    ],
    runewords: {
      season: "Season 15",
      img: "assets/img/d4/runeword-recipe.webp",
      title: "Receitas de Runeword",
      desc: "Novas receitas escondidas do cubo: runewords, equipamentos, runas e miscelânea. A lista completa e atualizada fica no guia da Auscraft.",
      url: "https://d4.auscraft.games/s15/s15-secrets.html#new-hidden-cube-recipes-runeword-gear-runes-miscellaneous",
    },
  },
};
