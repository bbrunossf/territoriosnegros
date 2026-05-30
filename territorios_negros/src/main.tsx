import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import App from './App.tsx'
import ProtectedRoute from "./components/ProtectedRoute";
import { TerritoriosProvider } from "./context/TerritoriosContext";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./routes/login";
import Admin from "./routes/admin";

import Home from "./components/Home";
import Intro from "./components/Intro";
import Conceito from "./components/Conceito";
import Sobre from "./components/Sobre";
import Roteiros from "./components/Roteiros";
import Percurso from "./components/Percurso";
import Territorios from "./components/Territorios";
import Territorio from "./components/Territorio";
import Fim from "./components/Fim";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TerritoriosProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="intro" element={<Intro />} />
              <Route path="conceito" element={<Conceito />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="roteiros" element={<Roteiros />} />
              <Route path="percurso/:rotaId" element={<Percurso />} />
              <Route path="percurso/:rotaId/:indice" element={<Territorio />} />
              <Route path="territorios" element={<Territorios />} />
              <Route path="territorio/:id" element={<Territorio />} />
              <Route path="fim" element={<Fim />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /> </ProtectedRoute>}/>
          </Routes>
      </TerritoriosProvider>
      </BrowserRouter>
  </StrictMode>,
)
