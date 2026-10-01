// Header.tsx — sem prop setTela
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  /**
   * Publica a própria altura na variável CSS --header-altura.
   *
   * Serve para as barras que ficam presas logo abaixo dele (a fileira
   * Voltar/Próximo dos territórios): com o valor medido de verdade, elas
   * encostam no Header sem sobra nem sobreposição, mesmo com a fonte maior,
   * o zoom do navegador ou a tela girada.
   */
  useEffect(() => {
    const medirAltura = () => {
      const cabecalho = document.querySelector<HTMLElement>(".header");
      if (!cabecalho) return;

      document.documentElement.style.setProperty(
        "--header-altura",
        `${cabecalho.offsetHeight}px`
      );
    };

    medirAltura();
    window.addEventListener("resize", medirAltura);

    return () => {
      window.removeEventListener("resize", medirAltura);
      document.documentElement.style.removeProperty("--header-altura");
    };
  }, []);

  return (
    <header className="header">
      <Link to="/" className="header-home-btn">⌂</Link>

      <Link to="/" className="header-brand">
        <b>Territórios Negros</b>
        <span>Vitória - ES</span>
      </Link>
    </header>
  );
}
