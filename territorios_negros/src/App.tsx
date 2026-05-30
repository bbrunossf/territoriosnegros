//Prototipo App Territorios Negros Corrigido

// import  dados from "./data/dados.json";
// import { useMemo, useState, useEffect } from "react";
// import { fetchTerritorios } from "./data/territorios";
// import type { TerritoriosMap } from "./data/types";

// import "./App.css";
// import Header from "./components/Header";
// import Home from "./components/Home";


// import BottomNav from "./components/BottomNav";
// import Intro from "./components/Intro";
// import Fim from "./components/Fim";

// import Conceito from "./components/Conceito";
// import Sobre from "./components/Sobre";
// import Roteiros from "./components/Roteiros";
// import Percurso from "./components/Percurso";
// import Territorios from "./components/Territorios";
// import Territorio from "./components/Territorio";


import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { useTerritorios } from "./context/TerritoriosContext";

// const {
//   roteiros,
//   ordemTerritoriosVisual,
// } = dados;


export default function App() {
  const location = useLocation();
  const { carregando } = useTerritorios();
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
