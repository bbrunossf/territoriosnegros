import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { useTerritorios } from "./context/useTerritorios";

export default function App() {
  const location = useLocation();
  const { carregando, erro } = useTerritorios();
  const isHome = location.pathname === "/";

  if (carregando) {
    return (
      <div className="app">
        <div className="phone">
          <main className="content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p>Carregando territórios...</p>
          </main>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="app">
        <div className="phone">
          <main className="content">
            <p>Não foi possível carregar os dados do app.</p>
            <p style={{ marginTop: 10, fontSize: 15 }}>{erro}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
      <div className="app">
        <div className="phone">
          {!isHome && <Header />}
          <main className={isHome ? "main-home" : "content"}>
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    );
}
