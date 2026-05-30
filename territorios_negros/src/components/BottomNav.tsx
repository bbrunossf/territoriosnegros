import { Link } from "react-router-dom";

// type Props = {
//   setTela: (tela: string) => void;
// };

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
         <Link to="/" className="bottom-nav-btn">⌂<br />Início</Link>
         <Link to="/intro" className="bottom-nav-btn">⟲<br />Antes</Link>
         <Link to="/conceito" className="bottom-nav-btn">◎<br />Conceito</Link>
         <Link to="/roteiros" className="bottom-nav-btn">▱<br />Rotas</Link>
         <Link to="/territorios" className="bottom-nav-btn">●<br />Territ.</Link>
         <Link to="/sobre" className="bottom-nav-btn">ⓘ<br />Sobre</Link>
       </nav>
     );
   }
