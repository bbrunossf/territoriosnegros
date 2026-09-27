// Header.tsx — sem prop setTela
import { Link } from "react-router-dom";

export default function Header() {
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
