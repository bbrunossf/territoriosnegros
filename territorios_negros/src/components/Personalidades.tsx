// src/components/Personalidades.tsx
//
// A listagem pública das personalidades negras (pedido da autoria, 02/10/2026),
// aberta pelo botão "Personalidades" dentro da página Vitória Negra.
//
// Só aparece o que está PUBLICADO no painel. A lista suspensa traz todas as
// publicadas em ordem alfabética (e o toque no nome abre a página dela); o
// território vinculado NÃO aparece na listagem — quem quiser saber lê na
// biografia, na página da pessoa. Quando não há retrato, o cartão usa a inicial
// do nome numa moldura: o app não inventa rosto.
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/personalidades.css";

import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_PAGINA_PERSONALIDADES,
  CHAVE_PERSONALIDADES,
  lerPaginaPersonalidades,
  lerPersonalidades,
  personalidadesPublicadas,
  type Personalidade,
} from "../data/personalidades";
import PageTitle from "./PageTitle";
import BotoesDaTela from "./BotoesDaTela";
import { iniciaisDe } from "../utils/nomes";

export default function Personalidades() {
  const { config } = useTerritorios();
  const navegar = useNavigate();

  const publicadas = useMemo(
    () => personalidadesPublicadas(lerPersonalidades(config[CHAVE_PERSONALIDADES])),
    [config]
  );

  /**
   * A lista suspensa: todas as publicadas, em ordem alfabética pelo nome — quem
   * escolhe um nome vai direto para a página da pessoa. A grade abaixo continua
   * na ordem que a autoria definiu no painel.
   */
  const emOrdemAlfabetica = useMemo(
    () =>
      [...publicadas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })),
    [publicadas]
  );

  const abrir = (slug: string) => {
    if (slug) navegar(`/personalidade/${slug}`);
  };

  // o título e a linha de apresentação desta página são editáveis no painel
  // (aba Personalidades › Página Personalidades)
  const pagina = lerPaginaPersonalidades(config[CHAVE_PAGINA_PERSONALIDADES]);

  return (
    <div className="personalidades">
      <PageTitle title={pagina.titulo} subtitle={pagina.subtitulo || undefined} />

      {/* botões que a autoria escolheu para o topo (aba Botões, "Em cada tela") */}
      <BotoesDaTela tela="personalidades" posicao="topo" />

      {/* Em vez do campo de busca: a lista suspensa com TODAS as personalidades
          publicadas, em ordem alfabética. O território vinculado não aparece
          aqui — quem quiser saber abre a página da pessoa e lê a biografia.
          (pedido da autoria, 02/10/2026) */}
      {emOrdemAlfabetica.length > 0 && (
        <div className="personalidades-busca">
          <label className="personalidades-escolha">
            <span>Escolha pelo nome</span>

            <select
              value=""
              onChange={(e) => abrir(e.target.value)}
              aria-label="Abrir a página de uma personalidade pelo nome"
            >
              <option value="">Escolha uma personalidade…</option>

              {emOrdemAlfabetica.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {publicadas.length === 0 && (
        <p className="personalidades-conta">
          Ainda não há personalidades publicadas. O que estiver em rascunho no painel não aparece
          aqui.
        </p>
      )}

      {publicadas.length > 0 && (
        <p className="personalidades-conta">{publicadas.length} personalidade(s)</p>
      )}

      {/* a grade continua na ordem definida no painel */}
      <div className="personalidades-grade">
        {publicadas.map((p) => (
          <Cartao key={p.id} personalidade={p} />
        ))}
      </div>

      <BotoesDaTela tela="personalidades" posicao="final" />
    </div>
  );
}

/**
 * O cartão de cada personalidade na listagem.
 *
 * Layout pedido pela autoria (02/10/2026): o nome em cima, a foto emoldurada no
 * meio e, embaixo, UMA frase curta digitada no painel. O cartão não mostra
 * informação biográfica — isso é assunto da página da pessoa.
 */
export function Cartao({ personalidade }: { personalidade: Personalidade }) {
  const capa =
    personalidade.fotoCapa && personalidade.fotoCapa.visivel !== false
      ? personalidade.fotoCapa
      : null;

  return (
    <Link className="personalidade-cartao" to={`/personalidade/${personalidade.slug}`}>
      <h2 className="personalidade-cartao-nome">{personalidade.nome}</h2>

      <div className="personalidade-cartao-moldura">
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
      </div>

      {personalidade.frase.trim() && (
        <p className="personalidade-cartao-frase">{personalidade.frase}</p>
      )}

      <p className="personalidade-cartao-abrir" aria-hidden="true">
        abrir a página ›
      </p>
    </Link>
  );
}
