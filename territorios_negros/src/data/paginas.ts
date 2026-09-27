// paginas.ts
//
// Conteúdo das páginas de texto do app, editável no painel (aba "Páginas").
//
// Cada página é gravada em app_config numa chave própria:
//   pagina_intro · pagina_vitoria · pagina_conceito · pagina_fim · pagina_contato
//
// Se a chave não existir (ou vier incompleta), o app mostra o texto padrão
// definido aqui — que é exatamente o texto original de cada página.

import LINKS from "./links.json";

export interface ItemLink {
  texto: string;
  url: string;
}

export interface BlocoConteudo {
  /** símbolo do bloco (ex: ◉ ✦ ✓) */
  icone: string;
  titulo: string;
  /** parágrafos separados por linha em branco (linha simples vira <br>) */
  texto: string;
  /** lista com travessão (um item por linha no painel) */
  itens: string[];
  /** caixa destacada dentro do bloco */
  destaque: string;
  /** lista de links */
  links: ItemLink[];
}

export interface BotaoConteudo {
  texto: string;
  url: string;
  estilo: "btn" | "outline";
}

export interface PaginaConteudo {
  titulo: string;
  subtitulo: string;
  /** bloco destacado de abertura */
  destaque: string;
  blocos: BlocoConteudo[];
  /** caixa destacada final (com um link: mapa, TCC...) */
  rodapeTexto: string;
  rodapeLinkTexto: string;
  rodapeUrl: string;
  botoes: BotaoConteudo[];
  /** classe extra aplicada ao redor da página (ex: "fim") */
  classe?: string;
}

/** página sem blocos/botões: usada só como base dos padrões */
const VAZIO: PaginaConteudo = {
  titulo: "",
  subtitulo: "",
  destaque: "",
  blocos: [],
  rodapeTexto: "",
  rodapeLinkTexto: "",
  rodapeUrl: "",
  botoes: [],
};

function bloco(parcial: Partial<BlocoConteudo>): BlocoConteudo {
  return {
    icone: "",
    titulo: "",
    texto: "",
    itens: [],
    destaque: "",
    links: [],
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────── Antes de caminhar

export const INTRO_PADRAO: PaginaConteudo = {
  ...VAZIO,
  titulo: "Antes de caminhar",
  destaque:
    "Este guia propõe uma leitura da cidade de Vitória - ES a partir dos " +
    "**Territórios Negros**. Não se trata de um guia de turismo, mas de uma experiência " +
    "de reconhecimento e interpretação da cidade para além das narrativas oficiais, a " +
    "partir das lentes da geografia, da história e da sociabilidade da população negra.",
  blocos: [
    bloco({
      icone: "✓",
      titulo: "O que levar e como se preparar",
      itens: [
        "Leve água e mantenha-se hidratado(a)",
        "Use protetor solar e roupas confortáveis",
        "Prefira calçados adequados para caminhada",
        "Planeje pausas para descanso ao longo do percurso",
      ],
    }),
    bloco({
      icone: "◉",
      titulo: "Como usar este app",
      itens: [
        "Leia o essencial em cada ponto e observe o espaço ao redor",
        "Use o corpo como instrumento de leitura do território",
        "Não transforme a experiência em apenas consumo turístico. Contribua para valorização, preservação e proteção dos territórios negros.",
      ],
    }),
  ],
  botoes: [
    { texto: "Ir para base teórica", url: "/conceito", estilo: "btn" },
    { texto: "Ir direto para os roteiros", url: "/roteiros", estilo: "outline" },
    { texto: "A cidade de Vitória - ES", url: "/vitoria", estilo: "outline" },
  ],
};

// ─────────────────────────────────────────────────────── A cidade de Vitória

export const VITORIA_PADRAO: PaginaConteudo = {
  ...VAZIO,
  titulo: "A cidade de Vitória",
  subtitulo: "Espírito Santo - ES",
  destaque:
    "Vitória é a capital do Espírito Santo e uma **cidade-ilha**: seu núcleo histórico " +
    "ocupa uma ilha na Baía de Vitória, cercada por manguezais, morros e pelo continente. " +
    "Foi fundada em **8 de setembro de 1551** e hoje reúne cerca de **322 mil habitantes** " +
    "(Censo 2022), num território de aproximadamente 93 km².",
  blocos: [
    bloco({
      icone: "◉",
      titulo: "O centro histórico: Cidade Alta e Cidade Baixa",
      texto:
        "O centro se organiza em dois planos. A **Cidade Alta** concentra igrejas, conventos, " +
        "o Palácio e as ruas de administração colonial. A **Cidade Baixa** nasceu ligada ao " +
        "porto, ao comércio e ao trabalho: mercados, trapiches, praças e escadarias que ainda " +
        "hoje ligam os dois níveis.",
    }),
    bloco({
      icone: "✦",
      titulo: "Uma cidade construída com presença negra",
      texto:
        "A história de Vitória foi feita também pelo trabalho, pela fé e pela sociabilidade da " +
        "população negra: irmandades religiosas, igrejas de homens pretos e pardos, o " +
        "pelourinho, os mercados, as ruas de moradia popular, as escolas de samba, as bandas " +
        "de congo e os quintais.\n\n" +
        "Boa parte dessa presença foi apagada, renomeada ou naturalizada na narrativa oficial. " +
        "Reencontrá-la no espaço é o que este guia propõe.",
    }),
    bloco({
      icone: "✓",
      titulo: "Como observar a cidade durante o percurso",
      itens: [
        "Repare nos dois níveis do centro: o que fica em cima e o que fica embaixo",
        "Observe as escadarias, ladeiras e becos: são caminhos de circulação negra",
        "Procure os nomes das ruas e pergunte o que eles homenageiam",
        "Note onde há placa, museu e monumento -- e onde há ausência de narrativa",
        "Use os manguezais e o mar como referência do que a cidade aterrou e transformou",
      ],
    }),
  ],
  rodapeTexto: "Mapa do centro histórico:",
  rodapeLinkTexto: "Abrir no mapa",
  rodapeUrl: "https://www.openstreetmap.org/#map=16/-20.3207/-40.3369",
  botoes: [{ texto: "Ir para os roteiros", url: "/roteiros", estilo: "btn" }],
};

// ─────────────────────────────────────────────────────── Base teórica

export const CONCEITO_PADRAO: PaginaConteudo = {
  ...VAZIO,
  titulo: "Base teórica",
  subtitulo: "Territórios Negros - Vitória - ES",
  destaque:
    "Esta seção apresenta os fundamentos conceituais que orientam o uso educativo do app.",
  blocos: [
    bloco({
      icone: "◉",
      titulo: "O que é território negro",
      texto:
        "O conceito de **território negro** apresentado neste aplicativo é uma construção " +
        "autoral, desenvolvida por **Aingrid Fabiane de Souza**, a partir da articulação de " +
        "diferentes bases teóricas sobre território, territorialidade, memória e presença " +
        "negra no espaço urbano.\n\n" +
        "Ele se fundamenta nas perspectivas de território e territorialidade elaboradas por " +
        "**Claude Raffestin**, **Milton Santos**, **Rogério Haesbaert** e " +
        "**Kaira Pedrosa Bicalho**.",
      destaque:
        "**Território negro** é compreendido como espaço ocupado, produzido e sustentado " +
        "pela população negra, ainda que seus limites não sejam fixos ou oficialmente " +
        "reconhecidos.",
    }),
    bloco({
      icone: "⌁",
      titulo: "Camadas, apagamentos e permanências",
      texto:
        "A cidade de Vitória - ES é lida aqui como espaço de camadas temporais. Um mesmo " +
        "lugar pode ter sido ladeira, pelourinho, escadaria, praça, mercado, parque, rota de " +
        "trabalho, ponto de sociabilidade ou lugar de culto.\n\n" +
        "O app parte da ideia de que a presença negra nem sempre aparece na narrativa oficial " +
        "da cidade. Muitas vezes ela permanece apagada, deslocada, renomeada ou naturalizada.",
    }),
    bloco({
      icone: "◎",
      titulo: "Por que ler a cidade a partir dos territórios negros",
      texto:
        "Porque a cidade não é neutra. Vitória - ES foi construída com a presença, o " +
        "trabalho, a circulação, a religiosidade, a cultura e a resistência da população negra.",
    }),
    bloco({
      icone: "ⓘ",
      titulo: "Sobre o app",
      texto:
        "Este aplicativo é um guia educacional de leitura territorial, criado para apoiar " +
        "caminhadas, aulas de campo e experiências formativas sobre os territórios negros no " +
        "Centro de Vitória - ES.\n\n" +
        "**Autoria:** Aingrid Fabiane de Souza, licenciada em Geografia (UFES).\n" +
        "**Base teórica:** TCC “Territórios Negros na cidade de Vitória - ES (2024)”.",
    }),
    bloco({
      icone: "♪",
      titulo: "Produções associadas ao projeto",
      links: [
        { texto: "Vitória, Não Apague Nossa Cor", url: LINKS.musica1 },
        { texto: "Mulher Raiz Ancestral", url: LINKS.musica2 },
        { texto: "Documentário – Coisas de Negres", url: LINKS.documentario },
      ],
    }),
  ],
  rodapeTexto: "TCC completo:",
  rodapeLinkTexto: "Acessar no Repositório da UFES",
  rodapeUrl: LINKS.tcc,
  botoes: [
    { texto: "Ir para os roteiros", url: "/roteiros", estilo: "btn" },
    { texto: "Enviar uma mensagem", url: "/contato", estilo: "outline" },
  ],
};

// ─────────────────────────────────────────────────────── Fim do percurso

export const FIM_PADRAO: PaginaConteudo = {
  ...VAZIO,
  titulo: "Fim do percurso",
  destaque:
    "A cidade não termina aqui. Os territórios negros permanecem — visíveis ou não. " +
    "Continue observando.",
  botoes: [
    { texto: "Escolher outro roteiro", url: "/roteiros", estilo: "btn" },
    { texto: "Enviar uma mensagem para a autoria", url: "/contato", estilo: "outline" },
  ],
  classe: "fim",
};

// ─────────────────────────────────────────────────────── Fale com a autoria

export const CONTATO_PADRAO: PaginaConteudo = {
  ...VAZIO,
  titulo: "Fale com a autoria",
  subtitulo: "Dúvidas, sugestões ou pedido de visita guiada.",
  destaque:
    "Envie sua mensagem pelo formulário abaixo. Ela chega direto para a autoria do guia.",
};

// ─────────────────────────────────────────────────────── normalização

function textoDe(valor: unknown, padrao: string): string {
  return typeof valor === "string" ? valor : padrao;
}

function normalizarBlocos(valor: unknown, padrao: BlocoConteudo[]): BlocoConteudo[] {
  if (!Array.isArray(valor)) return padrao;

  return valor
    .filter((b) => b && typeof b === "object")
    .map((b) => {
      const o = b as Record<string, unknown>;

      return bloco({
        icone: textoDe(o.icone, ""),
        titulo: textoDe(o.titulo, ""),
        texto: textoDe(o.texto, ""),
        itens: Array.isArray(o.itens)
          ? o.itens.filter((i): i is string => typeof i === "string")
          : [],
        destaque: textoDe(o.destaque, ""),
        links: Array.isArray(o.links)
          ? o.links
              .filter((l) => l && typeof l === "object")
              .map((l) => {
                const li = l as Record<string, unknown>;
                return {
                  texto: textoDe(li.texto, ""),
                  url: textoDe(li.url, ""),
                };
              })
              .filter((l) => l.texto || l.url)
          : [],
      });
    });
}

function normalizarBotoes(
  valor: unknown,
  padrao: BotaoConteudo[],
  compatibilidade?: Record<string, unknown>
): BotaoConteudo[] {
  if (Array.isArray(valor)) {
    return valor
      .filter((b) => b && typeof b === "object")
      .map((b) => {
        const o = b as Record<string, unknown>;
        return {
          texto: textoDe(o.texto, ""),
          url: textoDe(o.url, ""),
          estilo: o.estilo === "outline" ? "outline" : "btn",
        } as BotaoConteudo;
      })
      .filter((b) => b.texto);
  }

  // formato antigo da página Vitória: um único botão em botaoTexto
  const antigo = compatibilidade?.botaoTexto;
  if (typeof antigo === "string" && antigo.trim()) {
    return [{ texto: antigo, url: "/roteiros", estilo: "btn" }];
  }

  return padrao;
}

/** Garante que o que veio do banco tem o formato esperado (senão usa o padrão). */
export function normalizarPagina(
  valor: unknown,
  padrao: PaginaConteudo
): PaginaConteudo {
  if (!valor || typeof valor !== "object") return padrao;

  const v = valor as Record<string, unknown>;

  return {
    titulo: textoDe(v.titulo, padrao.titulo) || padrao.titulo,
    subtitulo: textoDe(v.subtitulo, padrao.subtitulo),
    destaque: textoDe(v.destaque, padrao.destaque),
    blocos: normalizarBlocos(v.blocos, padrao.blocos),
    rodapeTexto: textoDe(v.rodapeTexto, textoDe(v.mapaTexto, padrao.rodapeTexto)),
    rodapeLinkTexto: textoDe(v.rodapeLinkTexto, padrao.rodapeLinkTexto),
    rodapeUrl: textoDe(v.rodapeUrl, textoDe(v.mapaUrl, padrao.rodapeUrl)),
    botoes: normalizarBotoes(v.botoes, padrao.botoes, v),
    classe: padrao.classe,
  };
}
