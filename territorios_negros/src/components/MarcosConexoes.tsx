// MarcosConexoes.tsx — a seção "Marcos e Conexões" no app do visitante.
//
// Os títulos ficam SEMPRE visíveis (quando há conteúdo cadastrado), cada um na
// sua caixa destacada — a MESMA caixa com ou sem a expansão liberada; o que
// muda é só a possibilidade de abrir: com a permissão, o título é um alvo de
// toque com seta ▸/▾ (o controle de quem guia abre os detalhes durante o tour);
// sem a permissão, é só o título, sem botão, seta ou ícone de abrir.
//
// Vários tópicos podem ficar abertos ao mesmo tempo. Ao desligar a expansão, os
// corpos simplesmente deixam de ser desenhados (fecham na hora, sem apagar
// nada); ao religar, tudo começa fechado.

import { useState } from "react";
import "../styles/marcos.css";
import Topic from "./Topic";
import Inline from "./Inline";
import { useTerritorios } from "../context/useTerritorios";
import { useExpansao } from "../context/useExpansao";
import {
  TITULO_MARCOS,
  explicacoesPublicas,
  marcoExibivel,
  marcosDaPagina,
  marcosVisiveis,
  type Marco,
} from "../data/marcos";

/**
 * A preferência de expansão deste aparelho (ver context/useExpansao.ts).
 */

/** Uma linha de fonte: link quando tem endereço, texto quando não tem. */
function FonteDoMarco({ marco }: { marco: Marco }) {
  const rotulo = marco.fonte.trim() || marco.fonteUrl.trim();

  if (!rotulo) return null;

  const endereco = marco.fonteUrl.trim();

  return (
    <p className="marco-fonte">
      <span className="marco-fonte-rotulo">Fonte: </span>

      {endereco ? (
        <a href={endereco} target="_blank" rel="noreferrer">
          {rotulo}
        </a>
      ) : (
        rotulo
      )}
    </p>
  );
}

export default function MarcosConexoes({ chaveDaPagina }: { chaveDaPagina: string }) {
  const { config } = useTerritorios();
  const marcos = marcosDaPagina(config, chaveDaPagina);
  const [permitirAparelho] = useExpansao();
  const [abertos, setAbertos] = useState<string[]>([]);

  // As explicações abrem quando a autoria permitiu NESTE aparelho (o controle
  // dela, para o tour) ou quando o controle rápido do painel liberou as
  // explicações e fontes para todo mundo.
  const permitir = permitirAparelho || explicacoesPublicas(config);

  // "Exibir Marcos e Conexões" desligado no painel: não aparece em página nenhuma
  if (!marcosVisiveis(config)) return null;

  // sem tópico preenchido não existe seção — nem vazia, nem provisória.
  // Tópico desabilitado no painel (como foto oculta) também não aparece.
  const publicos = marcos.filter(marcoExibivel);

  if (publicos.length === 0) return null;

  const alternar = (id: string) =>
    setAbertos((lista) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]));

  return (
    <Topic icon="◇" title={TITULO_MARCOS}>
      <ul className="marcos-lista">
        {publicos.map((marco) => {
          const aberto = permitir && abertos.includes(marco.id);

          return (
            <li key={marco.id} className="marco">
              {permitir ? (
                <button
                  type="button"
                  className="marco-titulo marco-titulo-clicavel"
                  aria-expanded={aberto}
                  onClick={() => alternar(marco.id)}
                >
                  <span className="marco-seta" aria-hidden="true">
                    {aberto ? "▾" : "▸"}
                  </span>

                  <span className="marco-titulo-texto">{marco.titulo}</span>
                </button>
              ) : (
                <p className="marco-titulo">{marco.titulo}</p>
              )}

              {aberto && (
                <div className="marco-corpo">
                  {marco.explicacao.trim() !== "" && <Inline texto={marco.explicacao} />}

                  <FonteDoMarco marco={marco} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Topic>
  );
}
