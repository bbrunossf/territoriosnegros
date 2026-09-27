// conteudoPadrao.ts
//
// Conteúdo das páginas de texto do app. Hoje é usado pela página da cidade
// (Vitória); o mesmo modelo serve para as outras abas depois.
//
// No painel, este conteúdo é gravado em app_config sob a chave "pagina_vitoria".
// Se a chave não existir (ou vier incompleta), o app mostra o texto padrão
// abaixo — que é o texto original da página.

export interface BlocoConteudo {
  /** símbolo do bloco (ex: ◉ ✦ ✓) */
  icone: string;
  titulo: string;
  /** parágrafos separados por linha em branco */
  texto: string;
  /** lista com travessão (um item por linha no painel) */
  itens: string[];
}

export interface PaginaConteudo {
  titulo: string;
  subtitulo: string;
  /** bloco destacado de abertura */
  destaque: string;
  blocos: BlocoConteudo[];
  mapaTexto: string;
  mapaUrl: string;
  botaoTexto: string;
}

const LINK_MAPA_CENTRO = "https://www.openstreetmap.org/#map=16/-20.3207/-40.3369";

export const VITORIA_PADRAO: PaginaConteudo = {
  titulo: "A cidade de Vitória",
  subtitulo: "Espírito Santo - ES",
  destaque:
    "Vitória é a capital do Espírito Santo e uma **cidade-ilha**: seu núcleo histórico " +
    "ocupa uma ilha na Baía de Vitória, cercada por manguezais, morros e pelo continente. " +
    "Foi fundada em **8 de setembro de 1551** e hoje reúne cerca de **322 mil habitantes** " +
    "(Censo 2022), num território de aproximadamente 93 km².",
  blocos: [
    {
      icone: "◉",
      titulo: "O centro histórico: Cidade Alta e Cidade Baixa",
      texto:
        "O centro se organiza em dois planos. A **Cidade Alta** concentra igrejas, conventos, " +
        "o Palácio e as ruas de administração colonial. A **Cidade Baixa** nasceu ligada ao " +
        "porto, ao comércio e ao trabalho: mercados, trapiches, praças e escadarias que ainda " +
        "hoje ligam os dois níveis.",
      itens: [],
    },
    {
      icone: "✦",
      titulo: "Uma cidade construída com presença negra",
      texto:
        "A história de Vitória foi feita também pelo trabalho, pela fé e pela sociabilidade da " +
        "população negra: irmandades religiosas, igrejas de homens pretos e pardos, o " +
        "pelourinho, os mercados, as ruas de moradia popular, as escolas de samba, as bandas " +
        "de congo e os quintais.\n\n" +
        "Boa parte dessa presença foi apagada, renomeada ou naturalizada na narrativa oficial. " +
        "Reencontrá-la no espaço é o que este guia propõe.",
      itens: [],
    },
    {
      icone: "✓",
      titulo: "Como observar a cidade durante o percurso",
      texto: "",
      itens: [
        "Repare nos dois níveis do centro: o que fica em cima e o que fica embaixo",
        "Observe as escadarias, ladeiras e becos: são caminhos de circulação negra",
        "Procure os nomes das ruas e pergunte o que eles homenageiam",
        "Note onde há placa, museu e monumento -- e onde há ausência de narrativa",
        "Use os manguezais e o mar como referência do que a cidade aterrou e transformou",
      ],
    },
  ],
  mapaTexto: "Mapa do centro histórico:",
  mapaUrl: LINK_MAPA_CENTRO,
  botaoTexto: "Ir para os roteiros",
};

function textoDe(valor: unknown, padrao: string): string {
  return typeof valor === "string" ? valor : padrao;
}

/** Garante que o que veio do banco tem o formato esperado (senão usa o padrão). */
export function normalizarPagina(
  valor: unknown,
  padrao: PaginaConteudo
): PaginaConteudo {
  if (!valor || typeof valor !== "object") return padrao;

  const v = valor as Record<string, unknown>;

  const blocos: BlocoConteudo[] = Array.isArray(v.blocos)
    ? v.blocos
        .filter((b) => b && typeof b === "object")
        .map((b) => {
          const o = b as Record<string, unknown>;
          return {
            icone: textoDe(o.icone, ""),
            titulo: textoDe(o.titulo, ""),
            texto: textoDe(o.texto, ""),
            itens: Array.isArray(o.itens)
              ? o.itens.filter((i): i is string => typeof i === "string")
              : [],
          };
        })
    : padrao.blocos;

  return {
    titulo: textoDe(v.titulo, padrao.titulo) || padrao.titulo,
    subtitulo: textoDe(v.subtitulo, padrao.subtitulo),
    destaque: textoDe(v.destaque, padrao.destaque),
    blocos,
    mapaTexto: textoDe(v.mapaTexto, padrao.mapaTexto),
    mapaUrl: textoDe(v.mapaUrl, padrao.mapaUrl),
    botaoTexto: textoDe(v.botaoTexto, padrao.botaoTexto),
  };
}
