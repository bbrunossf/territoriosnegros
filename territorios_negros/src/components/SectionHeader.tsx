
import IconeDeCategoria from "./IconeDeCategoria";
import { iconeDaCategoria } from "../utils/iconeDaCategoria";

type Props = {
  title: string;
  /**
   * Imagem enviada no painel para esta categoria (14/10/2026). Quando existe,
   * ela substitui o símbolo que vinha do nome — é o símbolo da autoria.
   */
  simbolo?: string | null;
};

export default function SectionHeader({
  title,
  simbolo,
}: Props) {
  // Títulos de categoria das listas ficam soltos sobre o papel de parede,
  // alinhados à esquerda (pedido da autoria, 14/10/2026) — o painel com borda é
  // só para as seções das páginas de texto. Ao lado do título vai o símbolo da
  // categoria: a imagem enviada no painel, ou o símbolo escolhido pelo nome.
  return (
    <h3 className="section-header">
      <span className="section-header-icone">
        {simbolo ? (
          <img src={simbolo} alt="" className="section-header-simbolo" loading="lazy" />
        ) : (
          <IconeDeCategoria id={iconeDaCategoria(title)} />
        )}
      </span>

      {title}
    </h3>
  );
}
