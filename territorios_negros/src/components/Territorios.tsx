//Territorios.tsx
import { Link, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/useTerritorios";
import { agruparPorCategoria } from "../utils/catalogo";

import PageTitle from "../components/PageTitle";
import SectionHeader from "../components/SectionHeader";
import BotaoContato from "../components/BotaoContato";

export default function Territorios() {
  const navigate = useNavigate();
  const { territorios, categorias, carregando } = useTerritorios();

  // Os grupos agora vêm do banco (tabela "categorias"), não mais fixos no código:
  // território novo entra na lista assim que recebe uma categoria no painel.
  const grupos = agruparPorCategoria(territorios, categorias);

  return (
    <>
      <PageTitle
        title="Territórios"
        subtitle="Consulta individual dos pontos do guia."
      />

      {/* Pedido da autoria (02/10/2026): o botão da cidade fica AQUI, logo abaixo
          do subtítulo — é o passo anterior natural antes de descer para os
          territórios. Antes ele ficava na tela "Antes de caminhar". */}
      <div className="pagina-botoes">
        <Link className="outline pagina-botao" to="/vitoria">
          A cidade de Vitória - ES
        </Link>
      </div>

      {grupos.map((g) => (
        <section key={g.id}>
          <SectionHeader title={g.titulo} />

          {g.territorios.map((t) => (
            <button
              key={t.id}
              className="territorios-item"
              onClick={() => navigate(`/territorio/${t.id}`)}
            >
              {t.imagem ? (
                <img src={t.imagem} alt="" className="territorios-thumb" />
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
          ))}
        </section>
      ))}

      {!carregando && grupos.length === 0 && (
        <p className="aviso-vazio">
          Nenhum território disponível no momento.
        </p>
      )}

      <BotaoContato tela="territorios" />
    </>
  );
}
