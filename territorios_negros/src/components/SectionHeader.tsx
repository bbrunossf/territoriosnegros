
import IconeDeCategoria from "./IconeDeCategoria";
import { iconeDaCategoria } from "../utils/iconeDaCategoria";

type Props = {
  title: string;
};

export default function SectionHeader({
  title,
}: Props) {
  // Títulos de categoria das listas ficam soltos sobre o papel de parede,
  // alinhados à esquerda (pedido da autoria, 14/10/2026) — o painel com borda é
  // só para as seções das páginas de texto. Ao lado do título vai o símbolo da
  // categoria, escolhido pelo nome dela.
  return (
    <h3 className="section-header">
      <span className="section-header-icone">
        <IconeDeCategoria id={iconeDaCategoria(title)} />
      </span>

      {title}
    </h3>
  );
}
