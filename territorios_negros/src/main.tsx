import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import App from './App.tsx'
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollParaTopo from "./components/ScrollParaTopo";
import { TerritoriosProvider } from "./context/TerritoriosContext";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./routes/login";
//import Admin from "./routes/admin";

import AdminLayout from "./components/AdminLayout";
import TerritoriosAdmin from "./components/TerritoriosAdmin";
import RoteirosAdmin from "./components/RoteirosAdmin";
import CategoriasAdmin from "./components/CategoriasAdmin";
import InicioAdmin from "./components/InicioAdmin";
import PaginasAdmin from "./components/PaginasAdmin";
import MensagensAdmin from "./components/MensagensAdmin";
import AcessosAdmin from "./components/AcessosAdmin";
import ManualAdmin from "./components/ManualAdmin";
import MidiasAdmin from "./components/MidiasAdmin";
import ApoiadoresAdmin from "./components/ApoiadoresAdmin";
import MenuMaisAdmin from "./components/MenuMaisAdmin";
import BotoesAdmin from "./components/BotoesAdmin";
import PresencaNegra from "./components/PresencaNegra";
import { Navigate } from "react-router-dom";


import Home from "./components/Home";
import Intro from "./components/Intro";
import Conceito from "./components/Conceito";
import Vitoria from "./components/Vitoria";
import Contato from "./components/Contato";
import Roteiros from "./components/Roteiros";
import Percurso from "./components/Percurso";
import Territorios from "./components/Territorios";
import Territorio from "./components/Territorio";
import ProximoEvento from "./components/ProximoEvento";
import Fim from "./components/Fim";
import Apoiadores from "./components/Apoiadores";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* cada troca de tela começa no topo (o "Próximo" do percurso incluído) */}
      <ScrollParaTopo />

      <TerritoriosProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="intro" element={<Intro />} />
              <Route path="conceito" element={<Conceito />} />
              {/* "Sobre" foi incorporada à Base teórica */}
              <Route path="sobre" element={<Navigate to="/conceito" replace />} />
              <Route path="vitoria" element={<Vitoria />} />
              <Route path="contato" element={<Contato />} />
              <Route path="roteiros" element={<Roteiros />} />
              <Route path="percurso/:rotaId" element={<Percurso />} />
              <Route path="percurso/:rotaId/:indice" element={<Territorio />} />
              <Route path="territorios" element={<Territorios />} />
              <Route path="territorio/:id" element={<Territorio />} />
              <Route path="evento" element={<ProximoEvento />} />
              <Route path="fim" element={<Fim />} />
              {/* quem apoia o projeto — aberta pelo botão da tela "Antes de caminhar" */}
              <Route path="apoiadores" element={<Apoiadores />} />
              <Route path="presenca-negra" element={<PresencaNegra />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/territorios" replace />} />
              <Route path="territorios" element={<TerritoriosAdmin />} />
              <Route path="roteiros" element={<RoteirosAdmin />} />
              <Route path="categorias" element={<CategoriasAdmin />} />
              <Route path="inicio" element={<InicioAdmin />} />
              <Route path="paginas" element={<PaginasAdmin />} />
              <Route path="apoiadores" element={<ApoiadoresAdmin />} />
              <Route path="menu-mais" element={<MenuMaisAdmin />} />
              <Route path="botoes" element={<BotoesAdmin />} />
              <Route path="mensagens" element={<MensagensAdmin />} />
              <Route path="acessos" element={<AcessosAdmin />} />
              <Route path="midias" element={<MidiasAdmin />} />
              <Route path="manual" element={<ManualAdmin />} />
            </Route>
          </Routes>
      </TerritoriosProvider>
      </BrowserRouter>
  </StrictMode>,
)
