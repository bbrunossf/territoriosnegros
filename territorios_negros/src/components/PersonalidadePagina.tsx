// src/components/PersonalidadePagina.tsx
//
// A página própria de uma personalidade (pedido da autoria, 02/10/2026):
// endereço permanente /personalidade/<slug>, com foto de capa, apresentação em
// destaque, biografia em blocos, linha do tempo, galeria, vídeos, territórios
// relacionados, fontes e link do material completo.
//
// Só as seções PREENCHIDAS aparecem. No celular, os textos longos abrem em
// "Ler tudo" — o app também serve de apoio às visitas guiadas.
//
// A mesma tela serve ao painel: com `dados` na mão, ela mostra rascunho.
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../styles/personalidades.css";

import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_PERSONALIDADES,
  capaVisivel,
  galeriaVisivel,
  lerPersonalidades,
  linhaDeVida,
  marcaDaNatureza,
  personalidadesPublicadas,
  porSlug,
  relacaoCom,
  type Personalidade,
} from "../data/personalidades";
import { paragrafosDe } from "../utils/texto";
import FotoAmpliavel from "./FotoAmpliavel";
import Inline from "./Inline";
import PlayerVideo from "./PlayerVideo";
import Topic from "./Topic";
import MarcosConexoes from "./MarcosConexoes";
import { chaveDaPersonalidade } from "../data/marcos";

/** Texto que, no celular, começa resumido e abre no "Ler tudo". */
function Trecho({ texto, limite = 520 }: { texto: string; limite?: number }) {
  const [aberto, setAberto] = useState(false);
  const paragrafos = paragrafosDe(texto);

  if (texto.trim() === "") return null;

  const longo = texto.length > limite;
  const mostrados = !longo || aberto ? paragrafos : paragrafos.slice(0, 1);

  return (
    <div className="personalidade-dobra">
      {mostrados.map((p, i) => (
        <p key={i} className="texto-paragrafo">
          <Inline texto={p} />
        </p>
      ))}

      {longo && (
        <button type="button" className="outline" onClick={() => setAberto((v) => !v)}>
          {aberto ? "Recolher" : "Ler tudo"}
        </button>
      )}
    </div>
  );
}

export default function PersonalidadePagina({ dados }: { dados?: Personalidade }) {
  const { slug } = useParams();
  const { config, territorios } = useTerritorios();

  const publicadas = personalidadesPublicadas(lerPersonalidades(config[CHAVE_PERSONALIDADES]));
  const personalidade = dados ?? (slug ? porSlug(publicadas, slug) : undefined);

  if (!personalidade) {
    return (
      <div className="personalidade">
        <p className="personalidades-conta">
          Não encontramos essa personalidade. Ela pode estar em rascunho no painel — o que é
          rascunho não aparece para o visitante.
        </p>

        <p>
          <Link className="outline" to="/personalidades">
            ver todas as personalidades
          </Link>
        </p>
      </div>
    );
  }

  const capa = capaVisivel(personalidade);
  const galeria = galeriaVisivel(personalidade);
  const vida = linhaDeVida(personalidade);
  const locais = [
    personalidade.localNascimento.trim() && `nasceu em ${personalidade.localNascimento.trim()}`,
    personalidade.localFalecimento.trim() && `faleceu em ${personalidade.localFalecimento.trim()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const territoriosLigados = personalidade.territorios.filter((v) => !!territorios[v.territorioId]);

  return (
    <div className="personalidade">
      <div className="personalidade-hero">
        {capa ? (
          <img
            className="personalidade-hero-foto"
            src={capa.url}
            alt={capa.alt || capa.legenda || personalidade.nome}
          />
        ) : (
          <div className="personalidade-hero-semfoto" aria-hidden="true">
            {personalidade.nome.trim().slice(0, 1).toUpperCase()}
          </div>
        )}

        <div>
          <h1>{personalidade.nome}</h1>

          {personalidade.outrosNomes.trim() && (
            <p className="personalidade-vida">também conhecida como {personalidade.outrosNomes}</p>
          )}

          {vida && <p className="personalidade-vida">{vida}</p>}
        </div>
      </div>

      {(capa?.legenda || capa?.credito || capa?.fonte) && (
        <p className="personalidade-credito">
          {[capa?.legenda, capa?.credito, capa?.fonte].filter(Boolean).join(" · ")}
        </p>
      )}

      {personalidade.apresentacao.trim() && (
        <p className="personalidade-apresentacao">
          <Inline texto={personalidade.apresentacao} />
        </p>
      )}

      {locais && <p className="personalidade-credito">{locais}</p>}

      {personalidade.biografia.trim() && (
        <Topic icon="✦" title="Biografia">
          <Trecho texto={personalidade.biografia} />
        </Topic>
      )}

      {personalidade.blocos.length > 0 && (
        <div className="personalidade-blocos">
          {personalidade.blocos.map((bloco) => (
            <section key={bloco.id} className="personalidade-bloco">
              {bloco.titulo.trim() && (
                <h3>
                  {bloco.titulo}
                  {marcaDaNatureza(bloco.natureza) && (
                    <span className="personalidade-marca">{marcaDaNatureza(bloco.natureza)}</span>
                  )}
                </h3>
              )}

              <Trecho texto={bloco.texto} limite={380} />
            </section>
          ))}
        </div>
      )}

      {personalidade.linhaDoTempo.length > 0 && (
        <Topic icon="◉" title="Linha do tempo">
          <div className="personalidade-linha">
            {personalidade.linhaDoTempo.map((marco) => (
              <article key={marco.id} className="personalidade-marco">
                <span className="personalidade-marco-data">{marco.data}</span>

                <div>
                  {marco.titulo.trim() && <h3>{marco.titulo}</h3>}

                  {marco.descricao.trim() && (
                    <p className="personalidade-cartao-texto">
                      <Inline texto={marco.descricao} />
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Topic>
      )}

      {galeria.length > 0 && (
        <Topic icon="▣" title="Galeria de fotos">
          <div className="personalidade-galeria">
            {galeria.map((foto, i) => (
              <figure key={`${foto.url}-${i}`} style={{ margin: 0 }}>
                <FotoAmpliavel
                  url={foto.url}
                  alt={foto.alt || foto.legenda || personalidade.nome}
                  legenda={foto.legenda}
                  credito={[foto.credito, foto.fonte].filter(Boolean).join(" · ")}
                />
              </figure>
            ))}
          </div>
        </Topic>
      )}

      {personalidade.videos.length > 0 && (
        <Topic icon="▱" title="Vídeos">
          <div className="personalidade-blocos">
            {personalidade.videos.map((video) => (
              <section key={video.id} className="personalidade-bloco">
                {video.titulo?.trim() && <h3>{video.titulo}</h3>}

                {/* PlayerVideo já entrega link para abrir quando a plataforma não
                    permite incorporar */}
                <PlayerVideo url={video.url} titulo={video.titulo || personalidade.nome} />

                {video.descricao?.trim() && (
                  <p className="personalidade-cartao-texto">
                    <Inline texto={video.descricao} />
                  </p>
                )}

                {video.credito?.trim() && (
                  <p className="personalidade-credito">crédito: {video.credito}</p>
                )}
              </section>
            ))}
          </div>
        </Topic>
      )}

      {territoriosLigados.length > 0 && (
        <Topic icon="●" title="Territórios relacionados">
          <div className="territorio-personalidades">
            {territoriosLigados.map((vinculo) => {
              const territorio = territorios[vinculo.territorioId];

              return (
                <article key={vinculo.territorioId} className="personalidade-bloco">
                  <h3>{territorio.nome}</h3>

                  {relacaoCom(personalidade, vinculo.territorioId).trim() && (
                    <p className="personalidade-cartao-texto">
                      <Inline texto={relacaoCom(personalidade, vinculo.territorioId)} />
                    </p>
                  )}

                  <p>
                    <Link className="outline" to={`/territorio/${vinculo.territorioId}`}>
                      abrir o território
                    </Link>
                  </p>
                </article>
              );
            })}
          </div>
        </Topic>
      )}

      {/* Marcos e Conexões entra depois do último bloco de conteúdo e antes de
          "Fontes e pesquisa" (pedido da autoria, 02/10/2026). */}
      <MarcosConexoes chaveDaPagina={chaveDaPersonalidade(personalidade.slug)} />

      {personalidade.fontes.length > 0 && (
        <Topic icon="✎" title="Fontes e pesquisa">
          {personalidade.fontes.map((fonte) => (
            <p key={fonte.id} className="personalidade-fonte">
              <b>{fonte.titulo}</b>

              {[fonte.autor, fonte.data].filter(Boolean).map((parte) => ` · ${parte}`).join("")}

              {(fonte.url ?? "").trim() && (
                <>
                  {" · "}
                  <a href={fonte.url} target="_blank" rel="noreferrer">
                    abrir ↗
                  </a>
                </>
              )}

              {fonte.observacoes?.trim() && <> — {fonte.observacoes}</>}
            </p>
          ))}
        </Topic>
      )}

      {personalidade.materialCompleto.trim() && (
        <Topic icon="▤" title="Material completo">
          <p>
            <a className="btn pagina-botao" href={personalidade.materialCompleto} target="_blank" rel="noreferrer">
              abrir o material completo ↗
            </a>
          </p>
        </Topic>
      )}

      <p style={{ marginTop: 22 }}>
        <Link className="outline" to="/personalidades">
          ver todas as personalidades
        </Link>
      </p>
    </div>
  );
}
