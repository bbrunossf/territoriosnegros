// src/components/ManualAdmin.tsx
//
// Manual do painel: fica dentro do próprio painel para ser consultado em
// qualquer edição futura (formatação de texto, ordem das informações, o que
// grava na hora, estatísticas, cuidados). Sem banco e sem formulário: é só
// leitura — o texto mora aqui no código, então não tem como ser apagado por
// engano pelo painel.
import "../styles.css";

import { Link } from "react-router-dom";

/** linha de exemplo: o que se digita no painel → o que o visitante vê */
function Exemplo({ comando, resultado }: { comando: string; resultado: string }) {
  return (
    <div className="manual-exemplo">
      <code className="manual-comando">{comando}</code>
      <span className="manual-seta">→</span>
      <span className="manual-resultado">{resultado}</span>
    </div>
  );
}

export default function ManualAdmin() {
  return (
    <div className="admin-tela manual">
      <h1>Manual do painel</h1>

      <p className="admin-ajuda">
        Este manual fica aqui dentro para você consultar sempre que tiver dúvida sobre como
        operar, editar ou administrar o app — formatação de texto, ordem das informações,
        mostrar/esconder, estatísticas e cuidados. Ele não substitui o app: depois de
        mexer em algo de exibição, abra o app (ou <b>Ctrl+Shift+R</b> na aba que já estava
        aberta) e confira o que o visitante vê.
      </p>

      <nav className="manual-indice">
        <a href="#como-funciona">1. Como o painel funciona</a>
        <a href="#abas">2. O que cada aba controla</a>
        <a href="#formatacao">3. Formatação de texto (os comandos)</a>
        <a href="#alinhamento">4. Alinhamento do texto</a>
        <a href="#ordem">5. Ordem das informações na página do território</a>
        <a href="#esconder">6. Mostrar e esconder o que o visitante vê</a>
        <a href="#estatisticas">7. Acessos: as estatísticas</a>
        <a href="#mensagens">8. Mensagens dos visitantes</a>
        <a href="#cuidados">9. Cuidados que evitam retrabalho</a>
        <a href="#quem-entra">10. Quem entra no painel</a>
      </nav>

      {/* ── 1 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="como-funciona">
        <h2>1. Como o painel funciona</h2>

        <p>
          O painel grava direto no banco de dados do app, e o app lê desse banco. Por isso
          o que você salva <b>aparece no app assim que a página é recarregada</b>: não
          depende de programador nem de esperar uma publicação.
        </p>

        <p>
          O que <b>precisa</b> de publicação é mudança de estrutura (tela nova, botão novo,
          ajuste de layout). Quando o Hermes avisar que publicou algo e você não vir a
          novidade, o motivo mais comum é <b>aba velha</b>: recarregue com{" "}
          <b>Ctrl+Shift+R</b>.
        </p>

        <p>Há duas formas de gravar, e o próprio painel diz qual está valendo:</p>

        <ul>
          <li>
            <b>Espera o Salvar</b> — o que você digita nos campos só vale depois de clicar
            em <b>“Salvar alterações”</b> (ou no botão próprio do bloco, como{" "}
            <b>“Salvar ordem”</b>). Se sair da tela sem salvar, o painel avisa e a alteração
            se perde.
          </li>

          <li>
            <b>Grava na hora</b> — os botões de mostrar/esconder (mídias de apoio, camadas de
            tempo, mostrar/esconder rota na tabela) publicam no clique, sem Salvar. E o
            “Salvar alterações” seguinte <b>não desfaz</b> o que você escondeu no meio da
            edição.
          </li>
        </ul>
      </section>

      {/* ── 2 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="abas">
        <h2>2. O que cada aba controla</h2>

        <ul>
          <li>
            <b>Territórios</b> — a ficha completa de cada território: identificação,
            cartões de “Informações rápidas” (Camadas, Contexto, Ano, Idade, Criação,
            Função, Transformações, Status, Observação), textos (Descrição, Para observar,
            Para refletir, Palavra-chave), <b>ordem das informações</b>, camadas de tempo,
            fotos e vídeos de apoio.
          </li>

          <li>
            <b>Rotas</b> — os roteiros e o percurso: identificação da rota, textos,
            acessibilidade, mapas e logo. Os botões da tabela gravam na hora.
          </li>

          <li>
            <b>Categorias</b> — as categorias usadas para classificar os territórios.
          </li>

          <li>
            <b>Página inicial</b> — aviso do próximo tour, título/data/local/informações e
            link da ficha, capa, selo e botões.
          </li>

          <li>
            <b>Páginas</b> — as telas de texto do app (conceito, intro e outras): blocos,
            destaques, imagens, links e imagens de todas as seções.
          </li>

          <li>
            <b>Acessos</b> — as estatísticas de uso do app (contador de páginas vistas).
          </li>

          <li>
            <b>Mensagens</b> — o que os visitantes enviam pelo formulário de contato.
          </li>

          <li>
            <b>Ver o app</b> — abre o app como o visitante vê, para conferir.
          </li>
        </ul>
      </section>

      {/* ── 3 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="formatacao">
        <h2>3. Formatação de texto (os comandos)</h2>

        <p>
          Vale para os textos que você escreve: Descrição do território, cartões da ficha,
          itens de “Para observar durante a visita”, “Para refletir”, roteiros e blocos das
          páginas.
        </p>

        <h3 className="admin-form-secao">Negrito e itálico</h3>

        <Exemplo comando="**RESISTÊNCIA**" resultado="RESISTÊNCIA em negrito" />
        <Exemplo comando="*MUCANE*" resultado="MUCANE em itálico" />
        <Exemplo
          comando="A palavra é **RESISTÊNCIA** aqui"
          resultado="funciona no meio da frase"
        />
        <Exemplo
          comando="**Resistência** e *memória*"
          resultado="os dois na mesma linha"
        />

        <p className="admin-ajuda">
          Os dois <b>não</b> funcionam um dentro do outro:{" "}
          <code>**negrito com *itálico* dentro**</code> sai com asterisco na tela. Use os
          pares separados.
        </p>

        <h3 className="admin-form-secao">Linhas e parágrafos</h3>

        <Exemplo comando="Enter uma vez" resultado="quebra de linha (mesmo bloco)" />
        <Exemplo comando="Enter duas vezes (linha em branco)" resultado="parágrafo novo" />

        <p className="admin-ajuda">
          A linha em branco aparece no app como <b>uma linha vazia de verdade</b> — é o
          recurso para destacar passagens e dar conforto de leitura. Mais de uma linha em
          branco <b>não aumenta</b> o vão: o app junta. O que manda é “tem linha em branco
          ou não”.
        </p>

        <h3 className="admin-form-secao">Não funciona (sai literal na tela)</h3>

        <ul>
          <li>
            <code># Título</code>, <code>- item de lista</code>,{" "}
            <code>__sublinhado__</code>, <code>[nome](link)</code>
          </li>

          <li>
            asterisco solto no meio do texto fica como está — <code>2 * 3 = 6</code> sai
            normal, sem virar itálico.
          </li>
        </ul>

        <h3 className="admin-form-secao">Onde a marcação NÃO vale (sai com asterisco)</h3>

        <p>
          <b>Palavra-chave</b> do território, <b>legendas e créditos</b> de foto/vídeo,{" "}
          <b>nome e local</b> no cabeçalho do território, <b>títulos fixos</b> das seções e o{" "}
          <b>texto do botão fixo de contato</b>. Nesses campos, escreva sem asteriscos.
        </p>
      </section>

      {/* ── 4 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="alinhamento">
        <h2>4. Alinhamento do texto</h2>

        <p>
          <b>Descrição do território</b> — o texto sai centralizado (padrão do app), mas
          você escolhe o alinhamento <b>parágrafo por parágrafo</b>. Logo abaixo do campo
          Descrição há o bloco <b>“Alinhamento dos parágrafos da descrição”</b>: cada
          parágrafo tem um seletor (padrão · à esquerda · centralizado · à direita ·
          justificado) e há os atalhos <b>Todos à esquerda</b>, <b>Todos justificados</b> e{" "}
          <b>Todos no padrão do app</b>. Vale depois de salvar o território.
        </p>

        <p>
          Se preferir digitar, dá para escrever a marca no começo do parágrafo:{" "}
          <code>[esq]</code>, <code>[centro]</code>, <code>[dir]</code> ou{" "}
          <code>[just]</code>. <b>O visitante nunca vê a marca</b> — o app a remove da tela.
          Apagar a marca devolve o parágrafo ao padrão.
        </p>

        <p>
          <b>Páginas</b> — o alinhamento é escolhido por seção, na lista de estilo do bloco
          (junto com texto grande, cor etc.).
        </p>
      </section>

      {/* ── 5 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="ordem">
        <h2>5. Ordem das informações na página do território</h2>

        <p>
          Com um território aberto para edição, o bloco{" "}
          <b>“Ordem das informações na página”</b> lista, numerada, a sequência que o
          visitante lê. Use <b>↑ ↓</b> para posicionar cada item e clique em{" "}
          <b>“Salvar ordem”</b> — esse botão é independente do “Salvar alterações” (que é do
          conteúdo).
        </p>

        <ul>
          <li>
            A marca ao lado de cada item diz o que ele é: <b>cartão</b> (sai dentro da caixa
            “Informações rápidas”) ou <b>seção de texto</b> (sai com título próprio).
          </li>

          <li>
            A ordem vale <b>só para o território aberto</b>. Se você não arrumar nada, o
            território segue a ordem de sempre.
          </li>

          <li>
            Cartão <b>sem conteúdo não aparece</b> (não deixa buraco na leitura). Se você
            colocar a Descrição entre cartões, o app fecha a caixa, mostra o texto e reabre a
            caixa depois.
          </li>

          <li>
            Largura: <b>Ano e Idade</b> são os únicos que dividem a linha, e só quando ficam
            um ao lado do outro. Todos os outros ocupam a linha inteira, no mesmo
            enquadramento.
          </li>

          <li>
            <b>Descartar mudanças</b> volta para a ordem publicada;{" "}
            <b>Voltar à ordem padrão</b> apaga a ordem deste território (ele volta à
            sequência original).
          </li>
        </ul>
      </section>

      {/* ── 6 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="esconder">
        <h2>6. Mostrar e esconder o que o visitante vê</h2>

        <p>
          Serve para você preparar o conteúdo e liberar no momento certo (na visita guiada,
          por exemplo). <b>Tudo aqui grava na hora</b> — clicou, já está valendo no app.
        </p>

        <ul>
          <li>
            <b>Fotos e vídeos de apoio</b> — cada mídia tem o seu botão de mostrar/esconder
            e, acima da lista, <b>habilitar/desabilitar todas</b> (que marca item por item,
            para você depois ajustar um só sem estragar os outros).
          </li>

          <li>
            <b>Camadas de tempo</b> — mesma ideia: cada camada pode ser exibida ou não, com
            um contador “Situação X de N” e os botões de habilitar/desabilitar todas.
          </li>

          <li>
            <b>Rotas</b> — o botão de mostrar/esconder na tabela de rotas também grava na
            hora.
          </li>
        </ul>

        <p className="admin-ajuda">
          Antes de uma visita guiada, abra o app e confira a tela: pode haver mídia escondida
          de uma sessão anterior.
        </p>
      </section>

      {/* ── 7 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="estatisticas">
        <h2>7. Acessos: as estatísticas</h2>

        <p>
          A aba <b>Acessos</b> mostra quantas <b>páginas</b> foram vistas (cada tela aberta),
          quantas <b>visitas</b> (abas diferentes), o <b>uso por dia</b>, as{" "}
          <b>páginas mais vistas</b> e os <b>aparelhos</b> usados. É contagem anônima: não
          guarda quem acessou nem dado pessoal.
        </p>

        <h3 className="admin-form-secao">Apagar registros antigos</h3>

        <p>
          Os registros são leves e podem ficar guardados indefinidamente. Se um dia quiser
          enxugar, o botão <b>“apagar registros com mais de 1 ano”</b> limpa o histórico
          antigo sem perder os números do período que você escolher no topo da tela.
        </p>

        <h3 className="admin-form-secao">Zerar as estatísticas</h3>

        <div className="admin-perigo">
          <p className="admin-ajuda">
            Use o botão <b>“zerar estatísticas”</b> <b>antes de divulgar o app para o
            público</b>: enquanto você testa e confere as edições, os seus próprios acessos
            entram na conta e o número do dia do lançamento sairia misturado com eles. Ao
            zerar, todos os registros são apagados e a contagem recomeça do zero{" "}
            <b>a partir de agora</b> — o contador continua funcionando normalmente depois.{" "}
            <b>Não tem como desfazer.</b>
          </p>

          <p className="admin-ajuda">
            Depois do lançamento, <b>não zere</b>: você perderia o histórico público. Se
            quiser guardar os números de um período antes de limpar, anote os valores que
            aparecem nos cartões.
          </p>
        </div>
      </section>

      {/* ── 8 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="mensagens">
        <h2>8. Mensagens dos visitantes</h2>

        <p>
          Chegam pelo formulário de contato do app. O número de mensagens não lidas aparece
          no menu (ao lado de <b>Mensagens</b>) e no título da aba do navegador, atualizado
          sozinho a cada 30 segundos.
        </p>

        <p>
          Cada mensagem tem o botão de <b>marcar como lida</b> (ou voltar a não lida) — é
          você quem controla esse status, para não perder o fio de quem já respondeu.
        </p>
      </section>

      {/* ── 9 ─────────────────────────────────────────────── */}
      <section className="manual-secao" id="cuidados">
        <h2>9. Cuidados que evitam retrabalho</h2>

        <ul>
          <li>
            <b>Algo parece desatualizado?</b> Recarregue com <b>Ctrl+Shift+R</b> antes de
            mexer de novo: aba velha é a causa mais comum de um botão “não funcionar”.
          </li>

          <li>
            <b>Antes de fechar a tela</b>, confira o aviso de alterações não salvas. Cada
            bloco com botão próprio avisa quando falta salvar.
          </li>

          <li>
            <b>Vídeo de apoio: até 50 MB.</b> Acima disso o app recusa o envio — nesse caso,
            use o link de um vídeo (YouTube) em vez de enviar o arquivo.
          </li>

          <li>
            <b>Apagar não tem volta:</b> apagar território, categoria ou rota, e zerar as
            estatísticas são ações definitivas. O painel avisa antes de executar.
          </li>

          <li>
            <b>Edite uma coisa por vez</b> e confira no app. Se mexer em muita coisa junta,
            fica difícil saber qual ajuste causou o quê.
          </li>

          <li>
            <b>Não apague campos obrigatórios</b> esperando que o app preencha: o painel
            marca o que é obrigatório.
          </li>
        </ul>
      </section>

      {/* ── 10 ────────────────────────────────────────────── */}
      <section className="manual-secao" id="quem-entra">
        <h2>10. Quem entra no painel</h2>

        <p>
          O acesso ao painel é por <b>e-mail e senha</b> cadastrados no banco (Supabase).
          Não há tela no painel para criar ou remover pessoas — para dar acesso a alguém do
          projeto ou tirar o acesso de quem saiu, peça ao Hermes.
        </p>

        <p className="admin-ajuda">
          Se um dia algo não funcionar como este manual descreve, anote <b>a tela</b>,{" "}
          <b>o que você fez</b> e <b>o que esperava</b>, e chame o Hermes com esse resumo. E
          se você descobrir um jeito melhor de trabalhar, peça para acrescentar aqui: o
          manual é nosso, cresce com o uso.
        </p>
      </section>

      <p className="admin-ajuda">
        Precisa editar alguma coisa agora?{" "}
        <Link to="/admin/territorios">ir para Territórios</Link> ·{" "}
        <Link to="/">ver o app</Link>
      </p>
    </div>
  );
}
