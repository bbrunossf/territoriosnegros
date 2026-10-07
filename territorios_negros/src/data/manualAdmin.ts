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
    texto:
      "As abas do menu estão nesta ordem (de cima para baixo): primeiro o que você usa durante o guia, depois o conteúdo e, no fim, as ferramentas de consulta.",
    itens: [
      "**Fotos e vídeos** — a lista curta para ligar e desligar mídia **durante o guia**, no celular: fotos e vídeos por página e por território, e os mapas das rotas, com um botão por mídia (ver a seção própria mais adiante).",
      "**Rotas** — roteiros e percurso: identificação da rota, textos, **slogan**, acessibilidade, mapas e logo. Os botões da tabela gravam na hora.",
      "**Territórios** — a ficha completa: identificação, cartões de “Informações rápidas” (Camadas, Contexto, Ano, Idade, Criação, Função, Transformações, Status, Observação), textos (Descrição, Para observar, Para refletir, Palavra-chave), ordem das informações, camadas de tempo, fotos e vídeos de apoio.",
      "**Página inicial** — aviso do próximo tour, título/data/local/informações e link da ficha, capa, selo e botões.",
      "**Páginas** — as telas de texto do app (conceito, intro e outras): blocos, destaques, imagens e links. Bloco que tem **só links** (como “Produções associadas ao projeto”, na Base teórica) sai como **cartões** com o nome do site ao lado — assim o visitante vê que são coisas para abrir, e não texto do app. Basta o bloco ter texto, itens, destaque ou imagem para voltar a ser lista comum. A página **A cidade de Vitória** tem, logo abaixo do subtítulo, dois botões fixos — **Ir para base teórica** e **Ir para os territórios** — que são atalhos de navegação, não texto editável. A página **Presença Negra na Cidade** é editada na aba **Presença Negra** (ver adiante). Na tela **Antes de caminhar** a ordem dos botões é fixa do app: **Ir para base teórica**, **A cidade de Vitória - ES**, **Presença Negra na Cidade**, **Ir para Roteiros**, **Ir para Territórios**, **Apoiadores** — e, separado por um respiro maior, o **Enviar uma mensagem**. Todos com a mesma distância entre si; botão que você criar no painel para outro endereço entra no fim do grupo.",
      "**Apoiadores** — a página **Apoiadores** do app: título, texto de abertura e a lista de quem apoia o projeto (logo, nome, contribuição e link).",
      "**Presença Negra** — a página **Presença Negra na Cidade**, aberta em /presenca-negra: nasceu do bloco “Uma cidade construída com presença negra”, que saiu de A Cidade de Vitória para ganhar aprofundamento próprio — é onde entram as biografias das personalidades negras de Vitória. Edita-se como as outras páginas: blocos de texto, destaques, listas, imagens e links; vídeo entra como link do YouTube.",
      "**Menu Mais** — a lista que abre no item **Mais** da barra de navegação do app: quais páginas aparecem ali, com que nome, em que ordem — e quais ficam desligadas.",
      "**Botões** — os **nomes** dos seis botões da tela **Antes de caminhar** (Base teórica, A cidade de Vitória, Presença Negra, Roteiros, Territórios, Apoiadores). A ordem e para onde cada um leva são do app; aqui você só renomeia. Em branco, o nome volta ao padrão — ver a seção própria mais adiante.",
      "**Categorias** — as categorias que classificam os territórios.",
      "**Mensagens** — o que os visitantes enviam pelo formulário de contato.",
      "**Manual** — esta página. Edite quando quiser: botão **Editar o manual**.",
      "**Ver o app** — abre o app como o visitante vê, para conferir.",
      "**Acessos** — as estatísticas de uso do app (ver a seção própria mais adiante).",
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
    id: "midias-guia",
    titulo: "Fotos e vídeos: ligar e desligar no meio do guia",
    texto:
      "A aba **Fotos e vídeos** existe para o celular, durante a visita guiada: em vez de abrir a ficha do território (que é longa e obriga a rolar muito), você tem uma lista curta com **tudo o que tem foto ou vídeo**, separada em **Páginas**, **Territórios** e **Rotas**, e um botão por mídia. **Cada toque grava na hora** — não tem botão de salvar.\n\nCada grupo aparece fechado com o nome e o resumo (ex.: “10 fotos (3 ocultas) · 1 vídeo”); toque no nome para abrir e ver as mídias. O botão mostra o estado atual: **Habilitado** (aparece para o visitante) ou **Desabilitado** (guardado, fora do app). Toque nele para trocar.\n\nAcima de cada lista de fotos (ou de vídeos) há **habilitar todas / desabilitar todas**, que marca item por item — assim você desliga tudo de uma vez e liga só o que vai usar naquele ponto, sem estragar os ajustes individuais.\n\nEm **Territórios** aparecem **todos**, inclusive os que ainda não têm mídia: o grupo deles diz “sem foto nem vídeo de apoio” e, ao abrir, indica a aba Territórios para enviar. A caixa **mostrar só os que já têm mídia** deixa a lista curta quando você só quer conferir o que existe. Em **Páginas** aparecem as que têm imagem; as outras ficam indicadas numa linha embaixo. Território ou rota desativados no painel aparecem com etiqueta — a mídia deles não aparece no app de qualquer forma; para entrar, ative na aba correspondente.\n\n**Antes de começar o guia:** abra esta aba, confira o que está habilitado e desligue o que não faz parte do roteiro do dia.",
    itens: [
      "**Páginas** — hoje, a página **Vitória** é a única com fotos; as outras páginas não têm imagem nem vídeo (o app não tem vídeo nas páginas, só nos territórios).",
      "**Territórios** — fotos e vídeos de apoio de cada um, na mesma ordem da aba Territórios.",
      "**Rotas** — as imagens de **mapa** de cada rota (as que aparecem na página da rota, abaixo do mapa interativo). A **logo da rota** não entra aqui: ela é uma imagem única, sem liga/desliga — para tirá-la do ar use o botão **Remover logo**, na aba Rotas.",
      "O link **abrir**, ao lado de cada mídia, mostra o arquivo original em outra aba, para você conferir do que se trata.",
      "**habilitar tudo / desabilitar tudo** (no alto desta aba) — alcança de uma vez as fotos das páginas, as fotos e os vídeos de apoio de **todos os territórios** e os **mapas de todas as rotas**. Marca item por item, como os botões de cada grupo: depois você ajusta um só, sem estragar os outros. Nada é apagado — desligar só tira da vista do visitante. É o botão para preparar o guia: desligue tudo e ligue só o que entra no roteiro do dia.",
      "**atualizar lista** recarrega o que está gravado — útil se você mexeu em outro aparelho.",
    ],
  },
  {
    id: "apoiadores",
    titulo: "Apoiadores: quem apoia o projeto",
    texto:
      "A aba **Apoiadores** monta a página **Apoiadores** do app (endereço /apoiadores). O botão de acesso aparece em **três telas**, sempre no estilo das chamadas principais: em **Antes de caminhar** (abaixo do botão que leva ao contato), em **Territórios** (acima do botão “A cidade de Vitória - ES”) e em **Rotas** (abaixo do subtítulo da página). Além disso, a **barra de navegação** do app ganhou o item **Mais**, que abre a lista das páginas sem item próprio: Apoiadores, A cidade de Vitória - ES, Base teórica e Enviar uma mensagem — e, quando há um **evento agendado** (aba Página inicial), o **Próximo evento** entra no topo dessa lista (essa lista é editável na aba **Menu Mais**). O botão aparece **sempre**, mesmo sem ninguém cadastrado — enquanto a lista estiver vazia, a página avisa que ainda não há apoiadores e convida instituições a escrever para a autoria.\n\nCada apoiador vira um cartão na página, com a **logo**, o **nome**, uma frase sobre a **contribuição** e, quando houver, o **link** oficial (site ou Instagram) — que aparece como um botão. A ordem da lista aqui no painel é a ordem na página: use **subir** e **descer**.\n\nO título e o texto de abertura também são seus. Se apagar os dois, a página volta ao texto padrão (o mesmo que já está publicado).",
    itens: [
      "**Adicionar apoiador** cria um cartão novo, em branco, no fim da lista.",
      "**Nome** — da instituição, empresa, coletivo ou pessoa que apoia.",
      "**Participação** — o que foi combinado: **Realização**, **Parceria**, **Apoio**, **Patrocínio** ou **Acolhimento** (quem recebe o grupo — a igreja ou o espaço que abre as portas). Aparece como **etiqueta no alto do cartão**, que é o que diferencia um patrocínio de um acolhimento. Sem escolha, o cartão sai sem etiqueta.",
      "**Logo ou imagem** — envie o arquivo pelo painel (combinado com quem apoia) ou cole um endereço pronto. A prévia aparece ao lado.",
      "**Contribuição** — uma frase curta: apoio à divulgação, acolhimento da visita, material educativo, transporte etc.",
      "**Link** — site ou Instagram oficial, opcional. Pode colar sem o “https://” que o app completa.",
      "**Aparecendo no app** — desmarcado, o cadastro fica guardado e o visitante não vê. É item por item, como nas fotos de apoio: dá para preparar tudo e ligar na hora de publicar.",
      "**remover** apaga o apoiador da lista. Nada vai ao ar sem **Salvar alterações**; **Descartar mudanças** volta ao que está publicado.",
    ],
  },
  {
    id: "menu-mais",
    titulo: "Menu Mais: o acesso rápido na barra do app",
    texto:
      "No pé de cada tela do app há a barra: Início, Antes, Conceito, Rotas, Territórios e **Mais**. O **Mais** abre uma lista com as páginas que não têm item próprio na barra — é o atalho que evita o visitante ter de procurar o caminho dentro de outra tela.\n\nA aba **Menu Mais** é dona dessa lista: você escolhe **quais páginas aparecem**, com que **nome**, em que **ordem**, e pode **desligar** uma sem perdê-la. Como está publicado hoje, a lista tem cinco itens: Próximo evento, Apoiadores, A cidade de Vitória - ES, Base teórica e Enviar uma mensagem.\n\nNada vai ao ar sem **Salvar alterações**.",
    itens: [
      "**Página** — a escolha é entre páginas que existem no app. É de propósito: endereço escrito à mão poderia levar o visitante a uma tela em branco.",
      "**Nome no menu** — o texto que o visitante lê. Em branco, fica o nome da página. Ao trocar a página, o nome acompanha enquanto ele ainda for o padrão; se você já escreveu um nome próprio, ele é mantido.",
      "**Aparecendo no menu** — desmarcado, o item fica guardado aqui e sai da lista do app. É item por item, como nas fotos de apoio e nos apoiadores.",
      "**subir** e **descer** mudam a ordem — a ordem aqui é a ordem que o visitante vê ao abrir a lista.",
      "**remover** tira o item da lista. A página continua existindo no app; ela só deixa de ser oferecida nesse atalho.",
      "**Acrescentar página** — o seletor mostra apenas as páginas que ainda não estão na lista.",
      "**Próximo evento** tem uma regra do app: só aparece no menu quando há um **evento agendado** (aba **Página inicial**). Sem evento, o item fica guardado e não é preciso mexer — assim o visitante nunca cai numa tela sem conteúdo.",
      "A lista **não deveria ficar vazia**: se nenhuma página estiver ligada, o painel avisa e o visitante abre o **Mais** para encontrar o nada.",
    ],
  },
  {
    id: "botoes",
    titulo: "Botões: renomear os botões de navegação",
    texto:
      "A aba **Botões** cuida dos seis botões da tela **Antes de caminhar** — a porta de entrada do app. Nela você muda o **nome** de cada botão. A **ordem** e **para onde** cada um leva são do app, de propósito: assim a navegação não depende do que estiver gravado no banco, e um ajuste seu não deixa o visitante numa tela errada.\n\nDeixar um nome em branco faz o botão voltar ao nome padrão. Nada vai ao ar sem **Salvar alterações**.",
    itens: [
      "A ordem é: **Base teórica**, **A cidade de Vitória**, **Presença Negra**, **Roteiros**, **Territórios**, **Apoiadores** — e o **Enviar uma mensagem** fecha a tela, separado por um respiro maior.",
      "Todos os botões ficam com a **mesma distância** entre si. Se quiser mais respiro entre eles, é um número no app.",
      "Se você criar na aba **Páginas** um botão para um endereço que não está entre esses seis, ele continua aparecendo, no fim do grupo — nada do que você escreve é escondido.",
      "Os nomes valem só nesta tela: nos outros lugares do app os botões seguem o nome padrão.",
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
