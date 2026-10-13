// src/components/PersonalidadesDoTerritorio.tsx
//
// O outro lado do vínculo (pedido da autoria, 02/10/2026): na página de cada
// território, quem está ligado a ele. Mesmo dado, um só cadastro — se a autoria
// tira o vínculo no painel, some daqui e da página da pessoa.
//
// Sem ninguém ligado, não desenha nada (nada de seção vazia).
import "../styles/personalidades.css";

import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_PERSONALIDADES,
  lerPersonalidades,
  personalidadesDoTerritorio,
  personalidadesPublicadas,
  relacaoCom,
  resumoDe,
} from "../data/personalidades";
import { iniciaisDe } from "../utils/nomes";
import Topic from "./Topic";

export default function PersonalidadesDoTerritorio({ territorioId }: { territorioId: string }) {
  const { config } = useTerritorios();

  const ligadas = personalidadesDoTerritorio(
    personalidadesPublicadas(lerPersonalidades(config[CHAVE_PERSONALIDADES])),
    territorioId
  );

  if (ligadas.length === 0) return null;

  return (
    <Topic icon="✦" title="Personalidades relacionadas">
      <div className="territorio-personalidades">
      {ligadas.map((pessoa) => {
        const capa = pessoa.fotoCapa && pessoa.fotoCapa.visivel !== false ? pessoa.fotoCapa : null;
        const relacao = relacaoCom(pessoa, territorioId).trim();

        return (
          <article key={pessoa.id} className="personalidade-bloco">
            <div className="territorio-personalidade">
              {capa ? (
                <img src={capa.url} alt={capa.alt || capa.legenda || pessoa.nome} loading="lazy" />
              ) : (
                <div className="sem-foto" aria-hidden="true">
                  {iniciaisDe(pessoa.nome)}
                </div>
              )}

              <div>
                <h3 style={{ margin: 0 }}>{pessoa.nome}</h3>

                {relacao && <p>{relacao}</p>}
              </div>
            </div>

            {resumoDe(pessoa, 180) && (
              <p className="personalidade-cartao-texto">{resumoDe(pessoa, 180)}</p>
            )}

            <p>
              <Link className="btn pagina-botao" to={`/personalidade/${pessoa.slug}`}>
                Conheça sua história
              </Link>
            </p>
          </article>
        );
      })}
    </div>
    </Topic>
  );
}
