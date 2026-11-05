// src/components/Apoiadores.tsx
//
// Página "Apoiadores" do app (rota /apoiadores): quem apoia o projeto, com logo,
// nome, uma frase sobre a contribuição e o link oficial (quando houver).
//
// O conteúdo é editável no painel, na aba Apoiadores (chave app_config
// "apoiadores"). O visitante só vê os apoiadores ligados e com nome ou logo.
//
// Layout (14/10/2026): grade de MARCAS por seção — a logo é o que se reconhece
// primeiro. Tocar numa logo abre a ficha (nome, contribuição, foto e contatos)
// embaixo da grade, na largura toda; tocar de novo fecha.
import { useState } from "react";

import { useTerritorios } from "../context/useTerritorios";
import BotoesDaTela from "./BotoesDaTela";
import {
  CHAVE_APOIADORES,
  agruparPorTipo,
  apoiadoresVisiveis,
  lerApoiadores,
  linksDoApoiador,
  type Apoiador,
} from "../data/apoiadores";
import Inline from "./Inline";
import BotaoContato from "./BotaoContato";
import PageTitle from "./PageTitle";

export default function Apoiadores() {
  const { config } = useTerritorios();

  const pagina = lerApoiadores(config[CHAVE_APOIADORES]);
  const lista = apoiadoresVisiveis(pagina);
  // “Parceria”, “Fomento”, “Acolhimento”… são títulos de seção, não etiquetas
  // dentro do cartão: a marca (logo) é o que o visitante reconhece primeiro.
  const grupos = agruparPorTipo(pagina);

  /** id do apoiador cuja ficha está aberta (uma por vez) */
  const [aberto, setAberto] = useState<string | null>(null);

  /** a ficha que abre ao tocar na logo: nome, contribuição, foto e contatos */
  function fichaDe(apoiador: Apoiador) {
    const contatos = linksDoApoiador(apoiador);

    return (
      <div className="apoio-ficha" id={`apoio-ficha-${apoiador.id}`}>
        {apoiador.nome && <b className="apoio-ficha-nome">{apoiador.nome}</b>}

        {apoiador.contribuicao && (
          <p className="apoio-contribuicao">
            <Inline texto={apoiador.contribuicao} />
          </p>
        )}

        {apoiador.foto && (
          <img
            className="apoio-foto"
            src={apoiador.foto}
            alt={apoiador.nome ? `Foto de ${apoiador.nome}` : "Foto do apoiador"}
            loading="lazy"
          />
        )}

        {contatos.length > 0 && (
          <div className="apoio-contatos">
            {contatos.map((contato) => (
              <a
                key={contato.url}
                className="apoio-contato"
                href={contato.url}
                target="_blank"
                rel="noreferrer"
              >
                {contato.rotulo}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <PageTitle title={pagina.titulo} />

      {/* botões que a autoria escolheu para o topo (aba Botões, "Em cada tela") */}
      <BotoesDaTela tela="apoiadores" posicao="topo" />

      <div className="apoio-abertura">
        <Inline texto={pagina.texto} />
      </div>

      {lista.length === 0 ? (
        <p className="apoio-vazio">
          Ainda não há apoiadores publicados nesta página. Se você representa uma instituição,
          empresa ou coletivo — ou apoia de forma independente — e quer contribuir com esta
          experiência, escreva para a autoria.
        </p>
      ) : (
        grupos.map((grupo) => {
          const abertoNoGrupo = grupo.apoiadores.find((a) => a.id === aberto) ?? null;

          return (
            <section className="apoio-grupo" key={grupo.tipo || "sem-tipo"}>
              <h2 className="apoio-grupo-titulo">{grupo.nome}</h2>

              <div className="apoio-grade">
                {grupo.apoiadores.map((apoiador) => {
                  const contatos = linksDoApoiador(apoiador);
                  const temFicha =
                    !!apoiador.contribuicao || !!apoiador.foto || contatos.length > 0;
                  const estaAberto = aberto === apoiador.id;

                  return (
                    <button
                      type="button"
                      className={`apoio-marca${estaAberto ? " apoio-marca--aberta" : ""}`}
                      key={apoiador.id}
                      onClick={() => setAberto(estaAberto ? null : apoiador.id)}
                      aria-expanded={temFicha ? estaAberto : undefined}
                      aria-controls={temFicha ? `apoio-ficha-${apoiador.id}` : undefined}
                    >
                      {apoiador.logo ? (
                        <img
                          className="apoio-marca-logo"
                          src={apoiador.logo}
                          alt={apoiador.nome || "Logo do apoiador"}
                          loading="lazy"
                        />
                      ) : (
                        <span className="apoio-marca-nome">{apoiador.nome}</span>
                      )}

                      {/* só sinaliza que abre quando há ficha para mostrar */}
                      {temFicha && (
                        <span className="apoio-marca-mais" aria-hidden="true">
                          {estaAberto ? "×" : "+"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* a ficha abre embaixo da grade, na largura da seção */}
              {abertoNoGrupo && fichaDe(abertoNoGrupo)}
            </section>
          );
        })
      )}

      <BotoesDaTela tela="apoiadores" posicao="final" filete="antes-forte" />

      <BotaoContato tela="apoiadores" discreto />
    </>
  );
}
