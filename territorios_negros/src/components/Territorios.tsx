//Territorios.tsx
import { useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/useTerritorios";
import {
  agruparPorCategoria,
  pontosVisiveis,
  rotaDaOrdemDaLista,
  territoriosNoAr,
  type GrupoTerritorios,
} from "../utils/catalogo";
import { simboloDaCategoria } from "../utils/simbolosCategoria";

import PageTitle from "../components/PageTitle";
import SectionHeader from "../components/SectionHeader";
import BotoesDaTela from "../components/BotoesDaTela";
import BotaoContato from "../components/BotaoContato";
import { LISTA_TERRITORIOS_PADRAO, normalizarTituloDeLista } from "../data/titulosDeLista";

export default function Territorios() {
  const navigate = useNavigate();
  const { territorios, categorias, carregando, config, roteiros } = useTerritorios();

  // título e subtítulo desta página vêm do painel (aba Territórios)
  const titulo = normalizarTituloDeLista(config.lista_territorios, LISTA_TERRITORIOS_PADRAO);

  // Os grupos agora vêm do banco (tabela "categorias"), não mais fixos no código:
  // território novo entra na lista assim que recebe uma categoria no painel.
  // Com rota ativa, a lista é UMA só, exatamente na ordem da rota escolhida no
  // painel — sem cabeçalhos de categoria (15/10/2026, ajuste da autoria: os
  // territórios voltavam agrupados por categoria e a ordem da visita se perdia).
  // Sem rota ativa, aí sim: todos os habilitados agrupados pelas categorias.
  const rotaDaPagina = rotaDaOrdemDaLista(roteiros, config.rota_principal as string | undefined);

  const grupos: GrupoTerritorios[] = rotaDaPagina
    ? (() => {
        const pontos = pontosVisiveis(rotaDaPagina.pontos, territorios);

        return pontos.length > 0
          ? [{ id: "rota", titulo: "", simbolo: null, territorios: pontos }]
          : [];
      })()
    : agruparPorCategoria(territoriosNoAr(territorios, []), categorias);

  return (
    <>
      <PageTitle title={titulo.titulo} subtitle={titulo.subtitulo} />

      {/* Pedido da autoria (02/10/2026): o botão da cidade fica AQUI, logo abaixo
          do subtítulo — é o passo anterior natural antes de descer para os
          territórios. Antes ele ficava na tela "Antes de caminhar".
          Cor: usa o estilo cheio do app (".btn", o mesmo das chamadas principais),
          porque o "outline" translúcido se confundia com o fundo da página e não
          induzia ao clique. Depois dele vêm a Presença Negra na Cidade e os
          Apoiadores (ordem pedida em 02/10/2026). */}
      <BotoesDaTela tela="territorios" posicao="topo" />

      <div className="territorios-lista">
        {(() => {
          // contador contínuo: a alternância de fundo não reinicia em cada grupo
          let indice = 0;

          return grupos.map((g) => (
            <section key={g.id}>
              {/* sem título quando a lista é a própria rota: nada de cabeçalho de
                  categoria entre os territórios, só a sequência da visita */}
              {g.titulo !== "" && (
                <SectionHeader title={g.titulo} simbolo={simboloDaCategoria(config, g.id)} />
              )}

              {g.territorios.map((t) => {
                const alternado = indice++ % 2 === 1;

                return (
                  <button
                    key={t.id}
                    className={`territorios-item${alternado ? " territorios-item--alternado" : ""}`}
                    onClick={() => navigate(`/territorio/${t.id}`)}
                  >
                    {t.imagem ? (
                      /* moldura com fundo creme (passe-partout) e a foto INTEIRA
                         dentro — as verticais não são mais cortadas */
                      <span className="territorios-thumb">
                        <img src={t.imagem} alt="" className="territorios-thumb-foto" />
                      </span>
                    ) : (
                      <span className="territorios-thumb territorios-thumb-vazia">●</span>
                    )}

                    <span>
                      <b className="territorios-nome">{t.nome}</b>
                      <br />
                      <small className="territorios-palavra">{t.palavra}</small>
                    </span>

                    <b className="territorios-arrow">›</b>
                  </button>
                );
              })}
            </section>
          ));
        })()}
      </div>

      {!carregando && grupos.length === 0 && (
        <p className="aviso-vazio">
          Nenhum território disponível no momento.
        </p>
      )}

      {/* botões escolhidos para o final dos Territórios (aba Botões, "Em cada tela") */}
      <BotoesDaTela tela="territorios" posicao="final" />

      <BotaoContato tela="territorios" />
    </>
  );
}
