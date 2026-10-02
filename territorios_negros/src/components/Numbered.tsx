import Inline from "./Inline";

type Props = {
  items: string[];
};

export default function Numbered({
  items,
}: Props) {
  return (
    <>
      {items.map((item, i) => (
        <p
          key={`${item}-${i}`}
          className="numbered-item"
        >
          <span className="numbered-dash">
            —
          </span>

          {/* o item sai como foi digitado (quebra de linha dentro do item,
              **negrito** e *itálico*) */}
          <span><Inline texto={item} /></span>
        </p>
      ))}
    </>
  );
}
