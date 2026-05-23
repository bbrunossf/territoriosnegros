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

          <span>{item}</span>
        </p>
      ))}
    </>
  );
}
