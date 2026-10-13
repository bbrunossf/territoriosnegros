// src/components/Personalidades.tsx
//
// A listagem pública das personalidades negras (pedido da autoria, 02/10/2026),
// aberta pelo botão "Personalidades" dentro da página Vitória Negra.
//
// Só aparece o que está PUBLICADO no painel. Tem busca por nome e filtro por
// território vinculado — e, quando não há retrato, o cartão usa a inicial do
// nome numa moldura: o app não inventa rosto.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/personalidades.css";

import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_PERSONALIDADES,
  buscarPorNome,
  lerPersonalidades,
  personalidadesPublicadas,
  resumoDe,
  territoriosComPersonalidades,
  type Personalidade,
} from "../data/personalidades";
import PageTitle from "./PageTitle";
import BotoesDaTela from "./BotoesDaTela";
import { iniciaisDe } from "../utils/nomes";

export default function Personalidades() {
  const { config, territorios } = useTerritorios();

  const [busca, setBusca] = useState("");
  const [territorio, setTerritorio] = useState("");

  const publicadas = useMemo(
    () => personalidadesPublicadas(lerPersonalidades(config[CHAVE_PERSONALIDADES])),
    [config]
  );

  const comTerritorio = useMemo(
    () =>
      territoriosComPersonalidades(publicadas).map((id) => ({
        id,
        nome: territorios[id]?.nome ?? id,
      })),
    [publicadas, territorios]
  );

  const encontradas = useMemo(() => {
    const porNome = buscarPorNome(publicadas, busca);

    if (!territorio) return porNome;

    return porNome.filter((p) => p.territorios.some((v) => v.territorioId === territorio));
  }, [publicadas, busca, territorio]);

  const filtrando = busca.trim() !== "" || territorio !== "";

  return (
    <div className="personalidades">
      <PageTitle
        title="Personalidades"
        subtitle="Trajetórias de pessoas negras importantes para a história de Vitória e do Espírito Santo."
      />

      {/* botões que a autoria escolheu para o topo (aba Botões, "Em cada tela") */}
      <BotoesDaTela tela="personalidades" posicao="topo" />

      {publicadas.length > 0 && (
        <div className="personalidades-busca">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo nome"
            aria-label="Buscar personalidade pelo nome"
          />

          {comTerritorio.length > 0 && (
            <select
              value={territorio}
              onChange={(e) => setTerritorio(e.target.value)}
              aria-label="Filtrar por território"
            >
              <option value="">Todos os territórios</option>
              {comTerritorio.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {publicadas.length === 0 && (
        <p className="personalidades-conta">
          Ainda não há personalidades publicadas. O que estiver em rascunho no painel não aparece
          aqui.
        </p>
      )}

      {publicadas.length > 0 && (
        <p className="personalidades-conta">
          {filtrando
            ? `${encontradas.length} de ${publicadas.length} personalidade(s)`
            : `${publicadas.length} personalidade(s)`}
        </p>
      )}

      <div className="personalidades-grade">
        {encontradas.map((p) => (
          <Cartao key={p.id} personalidade={p} />
        ))}
      </div>

      {publicadas.length > 0 && encontradas.length === 0 && (
        <p className="personalidades-conta">
          Nenhuma personalidade encontrada com esse filtro. Tente outro nome ou outro território.
        </p>
      )}

      <BotoesDaTela tela="personalidades" posicao="final" />
    </div>
  );
}

/** O cartão de cada personalidade na listagem. */
export function Cartao({ personalidade }: { personalidade: Personalidade }) {
  const capa = personalidade.fotoCapa && personalidade.fotoCapa.visivel !== false
    ? personalidade.fotoCapa
    : null;

  const vida = [
    personalidade.nascimento.trim() && `nascimento: ${personalidade.nascimento.trim()}`,
    personalidade.falecimento.trim() && `falecimento: ${personalidade.falecimento.trim()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="personalidade-cartao">
      <div className="personalidade-cartao-topo">
        {capa ? (
          <img
            className="personalidade-cartao-foto"
            src={capa.url}
            alt={capa.alt || capa.legenda || personalidade.nome}
            loading="lazy"
          />
        ) : (
          <div className="personalidade-cartao-semfoto" aria-hidden="true">
            {iniciaisDe(personalidade.nome)}
          </div>
        )}

        <div>
          <h2 className="personalidade-cartao-nome">{personalidade.nome}</h2>

          {personalidade.outrosNomes.trim() && (
            <p className="personalidade-cartao-outros">também conhecida como {personalidade.outrosNomes}</p>
          )}

          {vida && <p className="personalidade-cartao-vida">{vida}</p>}
        </div>
      </div>

      {resumoDe(personalidade) && (
        <p className="personalidade-cartao-texto">{resumoDe(personalidade)}</p>
      )}

      <div className="personalidade-cartao-acoes">
        <Link className="btn pagina-botao" to={`/personalidade/${personalidade.slug}`}>
          Conheça sua história
        </Link>
      </div>
    </article>
  );
}
