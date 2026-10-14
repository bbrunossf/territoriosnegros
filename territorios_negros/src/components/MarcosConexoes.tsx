// MarcosConexoes.tsx — a seção "Marcos e Conexões" no app do visitante.
//
// Os títulos ficam visíveis (quando há tópico habilitado e com título), cada um
// na sua caixa destacada — a MESMA caixa com ou sem a expansão liberada; o que
// muda é só a possibilidade de abrir: com "Explicações e fontes" liberado no
// painel, o título é um alvo de toque com seta ▸/▾; sem a liberação, é só o
// título, sem botão, seta ou ícone de abrir.
//
// Vários tópicos podem ficar abertos ao mesmo tempo. A expansão é do app inteiro
// (gravada no banco), decidida no painel — não há controle na tela do visitante.

import { useState } from "react";
import "../styles/marcos.css";
import Topic from "./Topic";
import Inline from "./Inline";
import { useTerritorios } from "../context/useTerritorios";
import {
  TITULO_MARCOS,
  explicacoesPublicas,
  marcoExibivel,
  marcosDaPagina,
  marcosVisiveis,
  type Marco,
} from "../data/marcos";

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
  const [abertos, setAbertos] = useState<string[]>([]);

  // As explicações e as fontes abrem quando a autoria libera no painel
  // ("Explicações e fontes — Exibidas para todos"). Tópico habilitado aparece
  // com o título; desabilitado não aparece.
  const permitir = explicacoesPublicas(config);

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
