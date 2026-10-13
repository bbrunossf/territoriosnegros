import Inline from "./Inline";

type Props = {
  items: string[];
};

/**
 * A lista de itens de uma seção (travessão em cada um).
 *
 * Linha em branco digitada no painel não sai como item vazio: sai como um
 * respiro entre os grupos — é assim que a autoria separa blocos de itens.
 */
export default function Numbered({ items }: Props) {
  return (
    <>
      {items.map((item, i) => {
        if (item.trim() === "") {
          return <div key={`respiro-${i}`} className="numbered-respiro" aria-hidden="true" />;
        }

        return (
          <p key={`${item}-${i}`} className="numbered-item">
            <span className="numbered-dash">—</span>

            {/* o item sai como foi digitado (quebra de linha dentro do item,
                **negrito** e *itálico*) */}
            <span>
              <Inline texto={item} />
            </span>
          </p>
        );
      })}
    </>
  );
}
