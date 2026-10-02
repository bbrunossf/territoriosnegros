// src/components/ManualSecoes.tsx
//
// O manual só de leitura: recebe as seções prontas e desenha o índice e o texto.
// Fica separado da página (`ManualAdmin.tsx`) de propósito: aqui não entram
// banco, contexto nem formulário — é só o que o visitante do painel lê.
import Inline from "./Inline";
import { ehExemplo, idDaSecao, partesDoExemplo, type SecaoManual } from "../data/manualAdmin";
import { paragrafosDe } from "../utils/texto";

/** uma linha de item: com " → " vira a caixinha comando → resultado */
function ItemDoManual({ item }: { item: string }) {
  if (!ehExemplo(item)) {
    return (
      <li>
        <Inline texto={item} />
      </li>
    );
  }

  const { comando, resultado } = partesDoExemplo(item);

  return (
    <li className="manual-item-exemplo">
      <code className="manual-comando">{comando}</code>
      <span className="manual-seta">→</span>
      <span className="manual-resultado">
        <Inline texto={resultado} />
      </span>
    </li>
  );
}

export default function ManualSecoes({ secoes }: { secoes: SecaoManual[] }) {
  return (
    <>
      <nav className="manual-indice">
        {secoes.map((secao, i) => (
          <a key={secao.id} href={`#${idDaSecao(i)}`}>
            {i + 1}. {secao.titulo || "Sem título"}
          </a>
        ))}
      </nav>

      {secoes.map((secao, i) => (
        <section className="manual-secao" id={idDaSecao(i)} key={secao.id}>
          <h2>
            {i + 1}. {secao.titulo || "Sem título"}
          </h2>

          {paragrafosDe(secao.texto).map((paragrafo, j) => (
            <p key={j}>
              <Inline texto={paragrafo} />
            </p>
          ))}

          {secao.itens.length > 0 && (
            <ul>
              {secao.itens.map((item, k) => (
                <ItemDoManual item={item} key={k} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
