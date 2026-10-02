// src/data/manualAdmin.ts
//
// Conteúdo do manual do painel (aba "Manual").
//
// O manual original mora aqui, no código, e a autoria pode reescrevê-lo pelo
// painel: o que ela salvar vai para `app_config` ("manual_admin") e passa a
// valer no lugar do original. Sem configuração, ou com configuração inválida,
// o manual original continua aparecendo — a aba nunca fica vazia.
//
// Cada seção tem: título, texto (parágrafos, com a mesma marcação do app) e
// itens (lista). Na lista, a linha que tiver " → " vira a caixinha de exemplo:
// o lado esquerdo sai literal (para ler o comando) e o direito formatado.

export interface SecaoManual {
  /** id estável (vira a âncora do índice) */
  id: string;
  titulo: string;
  texto: string;
  itens: string[];
}

export interface ManualConfig {
  secoes?: unknown;
}

const SEPARADOR_EXEMPLO = " → ";

export function ehExemplo(item: string): boolean {
  return item.includes(SEPARADOR_EXEMPLO);
}

export function partesDoExemplo(item: string): { comando: string; resultado: string } {
  const [comando, ...resto] = item.split(SEPARADOR_EXEMPLO);
  return { comando: comando.trim(), resultado: resto.join(SEPARADOR_EXEMPLO).trim() };
}

/** âncora de cada seção na página (não depende do texto do título) */
export function idDaSecao(indice: number): string {
  return `manual-secao-${indice + 1}`;
}

export const MANUAL_PADRAO: SecaoManual[] = [
  {
    id: "como-funciona",
    titulo: "Como o painel funciona",
    texto:
      "O painel grava direto no banco de dados do app, e o app lê desse banco. Por isso o que você salva aparece no app assim que a página é recarregada: não depende de programador nem de esperar publicação.\n\nO que precisa de publicação é mudança de estrutura (tela nova, botão novo, ajuste de layout). Quando o Hermes avisar que publicou algo e você não vir a novidade, o motivo mais comum é aba velha: recarregue com **Ctrl+Shift+R**.",
    itens: [],
  },
  {
    id: "salvar-ou-gravar",
    titulo: "Salvar ou gravar na hora: as duas formas",
    texto:
      "O próprio painel diz qual está valendo — quando o botão diz **grava na hora**, não precisa salvar.\n\n**Espera o Salvar:** o que você digita nos campos só vale depois de clicar em **Salvar alterações** (ou no botão próprio do bloco, como **Salvar ordem**). Se sair da tela sem salvar, o painel avisa e a alteração se perde.\n\n**Grava na hora:** os botões de mostrar/esconder (mídias de apoio, camadas de tempo, mostrar/esconder rota na tabela) publicam no clique. O **Salvar alterações** seguinte não desfaz o que você escondeu no meio da edição.",
    itens: [],
  },
  {
    id: "abas",
    titulo: "O que cada aba controla",
    texto: "",
    itens: [
      "**Territórios** — a ficha completa: identificação, cartões de “Informações rápidas” (Camadas, Contexto, Ano, Idade, Criação, Função, Transformações, Status, Observação), textos (Descrição, Para observar, Para refletir, Palavra-chave), ordem das informações, camadas de tempo, fotos e vídeos de apoio.",
      "**Rotas** — roteiros e percurso: identificação da rota, textos, acessibilidade, mapas e logo. Os botões da tabela gravam na hora.",
      "**Categorias** — as categorias que classificam os territórios.",
      "**Página inicial** — aviso do próximo tour, título/data/local/informações e link da ficha, capa, selo e botões.",
      "**Páginas** — as telas de texto do app (conceito, intro e outras): blocos, destaques, imagens e links.",
      "**Acessos** — as estatísticas de uso do app (ver a seção própria mais adiante).",
      "**Mensagens** — o que os visitantes enviam pelo formulário de contato.",
      "**Manual** — esta página. Edite quando quiser: botão **Editar o manual**.",
      "**Ver o app** — abre o app como o visitante vê, para conferir.",
    ],
  },
  {
    id: "negrito-italico",
    titulo: "Formatação: negrito e itálico",
    texto:
      "Vale para os textos que você escreve: Descrição do território, cartões da ficha, itens de “Para observar durante a visita”, “Para refletir”, roteiros e blocos das páginas.\n\nOs dois não funcionam um dentro do outro: `**negrito com *itálico* dentro**` sai com asterisco na tela. Use os pares separados.",
    itens: [
      "**RESISTÊNCIA** → sai RESISTÊNCIA em negrito",
      "*MUCANE* → sai MUCANE em itálico",
      "A palavra é **RESISTÊNCIA** aqui → pontuação e palavras em volta continuam normais",
      "**Resistência** e *memória* → os dois na mesma linha, cada um no seu par",
    ],
  },
  {
    id: "linhas-paragrafos",
    titulo: "Formatação: linhas e parágrafos",
    texto:
      "A linha em branco aparece no app como **uma linha vazia de verdade** — é o recurso para destacar passagens e dar conforto de leitura.\n\nMais de uma linha em branco **não aumenta** o vão: o app junta. O que manda é “tem linha em branco ou não”.",
    itens: [
      "Enter uma vez → quebra de linha, continua no mesmo bloco",
      "Enter duas vezes (linha em branco) → começa um parágrafo novo",
    ],
  },
  {
    id: "nao-funciona",
    titulo: "Formatação: o que não funciona",
    texto:
      "Estes saem literais na tela (não viram título, lista, sublinhado nem link): `# Título`, `- item de lista`, `__sublinhado__` e `[nome](link)`.\n\nAsterisco solto no meio do texto fica como está: `2 * 3 = 6` sai normal, sem virar itálico.",
    itens: [],
  },
  {
    id: "onde-nao-vale",
    titulo: "Formatação: onde a marcação não vale",
    texto:
      "Nestes campos, escreva sem asteriscos — eles apareceriam na tela: **Palavra-chave** do território, **legendas e créditos** de foto e vídeo, **nome e local** no cabeçalho do território, **títulos fixos** das seções e o **texto do botão fixo de contato**.",
    itens: [],
  },
  {
    id: "alinhamento",
    titulo: "Alinhamento do texto",
    texto:
      "**Descrição do território:** o texto sai centralizado (padrão do app), mas você escolhe o alinhamento **parágrafo por parágrafo**, no bloco “Alinhamento dos parágrafos da descrição”, logo abaixo do campo. Cada parágrafo tem um seletor (padrão · à esquerda · centralizado · à direita · justificado) e há os atalhos **Todos à esquerda**, **Todos justificados** e **Todos no padrão do app**. Vale depois de salvar o território.\n\nSe preferir digitar, escreva a marca no começo do parágrafo: `[esq]`, `[centro]`, `[dir]` ou `[just]`. **O visitante nunca vê a marca** — o app a remove da tela. Apagar a marca devolve o parágrafo ao padrão.\n\n**Páginas:** o alinhamento é escolhido por seção, na lista de estilo do bloco (junto com texto grande, cor e afins).",
    itens: [],
  },
  {
    id: "ordem",
    titulo: "Ordem das informações na página do território",
    texto:
      "Com um território aberto para edição, o bloco **Ordem das informações na página** lista, numerada, a sequência que o visitante lê. Use **↑ ↓** para posicionar e clique em **Salvar ordem** — esse botão é independente do “Salvar alterações”, que é do conteúdo.\n\n**Padronizar todos de uma vez:** no fim do bloco há **Aplicar esta ordem a todos os territórios** — a ordem da lista vira a ordem **padrão**: os outros territórios passam a seguir esta sequência (inclusive quem tinha ordem própria) e território criado depois já nasce assim. Ao lado, **voltar todos à ordem original do app** desfaz a padronização.\n\nPara deixar **um** território com ordem diferente dos outros, arrume só nele e salve: a ordem própria dele ganha do padrão. Para ele voltar a seguir o padrão, use **Voltar à ordem padrão** e salve.",
    itens: [
      "A marca ao lado de cada item diz o que ele é: **cartão** (sai dentro da caixa “Informações rápidas”) ou **seção de texto** (sai com título próprio).",
      "A ordem vale **só para o território aberto**. Território que você não arrumar segue a ordem de sempre.",
      "Cartão **sem conteúdo não aparece** (não deixa buraco na leitura). Se a Descrição ficar entre cartões, o app fecha a caixa, mostra o texto e reabre a caixa depois.",
      "Largura: **Ano e Idade** são os únicos que dividem a linha, e só quando ficam um ao lado do outro. Todos os outros ocupam a linha inteira, no mesmo enquadramento.",
      "**Descartar mudanças** volta para a ordem publicada; **Voltar à ordem padrão** apaga a ordem deste território (ele volta à sequência original).",
    ],
  },
  {
    id: "esconder",
    titulo: "Mostrar e esconder o que o visitante vê",
    texto:
      "Serve para preparar o conteúdo e liberar no momento certo (na visita guiada, por exemplo). **Tudo aqui grava na hora** — clicou, já está valendo no app.\n\nAntes de uma visita guiada, abra o app e confira a tela: pode haver mídia escondida de uma sessão anterior.",
    itens: [
      "**Fotos e vídeos de apoio** — cada mídia tem o seu botão de mostrar/esconder e, acima da lista, **habilitar/desabilitar todas** (que marca item por item, para você ajustar um só depois sem estragar os outros).",
      "**Camadas de tempo** — mesma ideia: cada camada pode ser exibida ou não, com o contador “Situação X de N” e os botões de habilitar/desabilitar todas.",
      "**Rotas** — o botão de mostrar/esconder na tabela de rotas também grava na hora.",
    ],
  },
  {
    id: "revisao",
    titulo: "Revisão das fichas: o que falta preencher",
    texto:
      "No fim da aba **Territórios** há o bloco **Revisão das fichas**: ele confere os territórios e mostra o que está **vazio** (para você preencher) e o que parece **erro de digitação** — aspa ou asterisco sem par, marca de alinhamento fora do começo do parágrafo, texto com “undefined” e ano fora de faixa.\n\nÉ só o retrato do que está gravado: nada é alterado ali. Para corrigir, clique no ✏️ do território, ajuste e clique em **Salvar alterações**.\n\nA caixa **Mostrar só as fichas com pendência** esconde quem já está completa, e a lista abaixo do resumo mostra campo por campo em quais territórios falta o quê. Campos essenciais são os que a ficha deve ter sempre; os opcionais (Observação, Idade das camadas de tempo, fotos e vídeos de apoio) aparecem marcados como **vazio (opcional)** — só entram quando fazem sentido.",
    itens: [],
  },
  {
    id: "estatisticas",
    titulo: "Acessos: as estatísticas",
    texto:
      "A aba **Acessos** mostra quantas **páginas** foram vistas (cada tela aberta), quantas **visitas** (abas diferentes), o **uso por dia**, as **páginas mais vistas** e os **aparelhos** usados. É contagem anônima: não guarda quem acessou nem dado pessoal.\n\nOs registros são leves e podem ficar guardados indefinidamente. Se um dia quiser enxugar, o botão **apagar registros com mais de 1 ano** limpa o histórico antigo sem perder os números do período escolhido no topo da tela.",
    itens: [],
  },
  {
    id: "zerar",
    titulo: "Zerar as estatísticas: quando e por quê",
    texto:
      "Use o botão **zerar estatísticas** **antes de divulgar o app para o público**: enquanto você testa e confere as edições, os seus próprios acessos entram na conta e o número do dia do lançamento sairia misturado com eles. Ao zerar, todos os registros são apagados e a contagem recomeça do zero **a partir de agora** — o contador continua funcionando normalmente depois. **Não tem como desfazer.**\n\nDepois do lançamento, **não zere**: você perderia o histórico público. Se quiser guardar os números de um período antes de limpar, anote os valores que aparecem nos cartões.",
    itens: [],
  },
  {
    id: "mensagens",
    titulo: "Mensagens dos visitantes",
    texto:
      "Chegam pelo formulário de contato do app. O número de mensagens não lidas aparece no menu (ao lado de **Mensagens**) e no título da aba do navegador, atualizado sozinho a cada 30 segundos.\n\nCada mensagem tem o botão de **marcar como lida** (ou voltar a não lida) — é você quem controla esse status, para não perder o fio de quem já respondeu.",
    itens: [],
  },
  {
    id: "cuidados",
    titulo: "Cuidados que evitam retrabalho",
    texto: "",
    itens: [
      "**Algo parece desatualizado?** Recarregue com **Ctrl+Shift+R** antes de mexer de novo: aba velha é a causa mais comum de um botão “não funcionar”.",
      "**Antes de fechar a tela**, confira o aviso de alterações não salvas. Cada bloco com botão próprio avisa quando falta salvar.",
      "**Vídeo de apoio: até 50 MB.** Acima disso o app recusa o envio — nesse caso, use o link de um vídeo (YouTube) em vez de enviar o arquivo.",
      "**Apagar não tem volta:** apagar território, categoria ou rota, e zerar as estatísticas, são ações definitivas. O painel avisa antes de executar.",
      "**Edite uma coisa por vez** e confira no app. Mexendo em muita coisa junta, fica difícil saber qual ajuste causou o quê.",
      "**Não apague campos obrigatórios** esperando que o app preencha: o painel marca o que é obrigatório.",
    ],
  },
  {
    id: "quem-entra",
    titulo: "Quem entra no painel",
    texto:
      "O acesso ao painel é por **e-mail e senha** cadastrados no banco (Supabase). Não há tela no painel para criar ou remover pessoas — para dar acesso a alguém do projeto ou tirar o acesso de quem saiu, peça ao Hermes.\n\nSe um dia algo não funcionar como este manual descreve, anote **a tela**, **o que você fez** e **o que esperava**, e chame o Hermes com esse resumo. E se você descobrir um jeito melhor de trabalhar, escreva aqui: o manual é seu, cresce com o uso.",
    itens: [],
  },
];

/**
 * Sempre devolve um manual válido: sem configuração (ou com lixo no banco),
 * volta o manual original; seção sem título e sem conteúdo é descartada.
 */
export function normalizarManual(bruto: unknown): SecaoManual[] {
  const secoes = (bruto as ManualConfig | null)?.secoes;

  if (!Array.isArray(secoes)) return MANUAL_PADRAO.map((s) => ({ ...s, itens: [...s.itens] }));

  const lidas: SecaoManual[] = secoes
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : "",
      titulo: typeof item.titulo === "string" ? item.titulo.trim() : "",
      texto: typeof item.texto === "string" ? item.texto : "",
      itens: Array.isArray(item.itens)
        ? item.itens.filter((i): i is string => typeof i === "string").map((i) => i.trim()).filter(Boolean)
        : [],
    }))
    .filter((secao) => secao.titulo || secao.texto.trim() || secao.itens.length > 0);

  if (lidas.length === 0) return MANUAL_PADRAO.map((s) => ({ ...s, itens: [...s.itens] }));

  // garante id único em cada seção (a âncora do índice depende disso)
  const usados = new Set<string>();
  return lidas.map((secao, i) => {
    let id = secao.id || `secao-${i + 1}`;
    while (usados.has(id)) id = `${id}-2`;
    usados.add(id);
    return { ...secao, id };
  });
}

/** true quando o que está gravado é o manual original (ou não há nada gravado) */
export function ehManualPadrao(secoes: SecaoManual[]): boolean {
  if (secoes.length !== MANUAL_PADRAO.length) return false;
  return secoes.every((secao, i) => secao.titulo === MANUAL_PADRAO[i].titulo && secao.texto === MANUAL_PADRAO[i].texto);
}

/** move uma seção uma posição (-1 para cima, +1 para baixo) */
export function moverSecao(secoes: SecaoManual[], indice: number, delta: number): SecaoManual[] {
  const destino = indice + delta;
  if (indice < 0 || destino < 0 || destino >= secoes.length) return [...secoes];

  const novas = [...secoes];
  [novas[indice], novas[destino]] = [novas[destino], novas[indice]];
  return novas;
}

/** seção em branco para o botão "acrescentar seção" (id sempre novo) */
let sequenciaSecao = 0;

export function secaoNova(): SecaoManual {
  sequenciaSecao += 1;

  return {
    id: `secao-${Date.now().toString(36)}-${sequenciaSecao}`,
    titulo: "Seção nova",
    texto: "",
    itens: [],
  };
}
