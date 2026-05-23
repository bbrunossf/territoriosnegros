//Prototipo App Territorios Negros Corrigido

import  dados from "./data/dados.json";
import { useMemo, useState } from "react";

import "./App.css";
import Header from "./components/Header";
import Home from "./components/Home";


import BottomNav from "./components/BottomNav";
import Intro from "./components/Intro";
import Fim from "./components/Fim";

import Conceito from "./components/Conceito";
import Sobre from "./components/Sobre";
import Roteiros from "./components/Roteiros";
import Percurso from "./components/Percurso";
import Territorios from "./components/Territorios";
import Territorio from "./components/Territorio";


// const CAPA_INICIAL = "/mnt/data/image(10).png";
// const SAMBAO_VIDEO = "/mnt/data/01 - SAMBÃO DO POVO.mp4";

// dados.ordemTerritoriosVisual
// dados.roteiros
// dados.pontos

const {
  roteiros,
  territorios,
  ordemTerritoriosVisual,
} = dados;


export default function App() {
  const [tela, setTela] = useState("home");
  const [rotaId, setRotaId] = useState("rota1");
  const [indice, setIndice] = useState(0);

  const roteiro = useMemo(() => {
    if (rotaId === "todos") return { nome: "Territórios", subtitulo: "Consulta individual", pontos: ordemTerritoriosVisual };
    return roteiros.find((r) => r.id === rotaId) || roteiros[0];
  }, [rotaId]);

  //const territorio = territorios[roteiro.pontos[indice]];
  const territorio =
    territorios[
      roteiro.pontos[indice] as keyof typeof territorios
    ];

  const irParaRota = (id: string) => {
    setRotaId(id);
    setIndice(0);
    setTela("percurso");
  };

  const abrirTerritorio = (id: string) => {
    setRotaId("todos");
    setIndice(ordemTerritoriosVisual.indexOf(id));
    setTela("territorio");
  };

  const proximo = () => {
    if (indice < roteiro.pontos.length - 1) setIndice(indice + 1);
    else setTela("fim");
  };

  const voltar = () => {
    if (indice > 0) setIndice(indice - 1);
    else setTela("percurso");
  };

  return (
    <div className="app">
      <div className="phone">
        {tela !== "home" && <Header setTela={setTela} />}

        <main className={tela === "home" ? "main-home" : "content"}>
          {tela === "home" && <Home setTela={setTela} />}
          {tela === "intro" && <Intro setTela={setTela} />}
          {tela === "conceito" && <Conceito setTela={setTela} />}
          {tela === "sobre" && <Sobre />}
          {tela === "roteiros" && <Roteiros irParaRota={irParaRota} />}
          {tela === "territorios" && (
            <Territorios abrirTerritorio={abrirTerritorio} />
          )}
          {tela === "percurso" && (
            <Percurso
              roteiro={roteiro}
              setIndice={setIndice}
              setTela={setTela}
            />
          )}
          {tela === "territorio" && (
            <Territorio
              territorio={territorio}
              indice={indice}
              total={roteiro.pontos.length}
              proximo={proximo}
              voltar={voltar}
            />
          )}
          {tela === "fim" && <Fim setTela={setTela} />}
        </main>

        <BottomNav setTela={setTela} />
      </div>
    </div>
  );
}
