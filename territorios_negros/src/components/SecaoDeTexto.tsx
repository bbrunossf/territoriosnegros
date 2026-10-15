// src/components/SecaoDeTexto.tsx
//
// Seção que abre e recolhe pelo próprio título — a MESMA exibição dos tópicos de
// Marcos e Conexões (pedido da autoria, 02/10/2026). O título é o alvo do toque,
// o conteúdo entra embaixo e um tópico fechado não ocupa a tela.
//
// Nasceu dentro da página da personalidade (Biografia, cada bloco, Territórios
// relacionados e Links) e passou a valer também na página do território, em
// Personalidades relacionadas — daí a extração para um componente só.
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { paragrafosDe } from "../utils/texto";
import { trazerParaVista } from "../utils/rolagem";
import Inline from "./Inline";

export default function SecaoDeTexto({
  icone,
  titulo,
  marca,
  texto = "",
  children,
  aberto,
  aoAlternar,
}: {
  icone?: string;
  titulo: string;
  marca?: string;
  texto?: string;
  children?: ReactNode;
  aberto: boolean;
  aoAlternar: () => void;
}) {
  const caixa = useRef<HTMLElement | null>(null);

  // Ao ABRIR, a seção vem para o alto da tela (abaixo da barra). Sem isso, quando
  // um tópico grande recolhe e outro abre logo abaixo, a página encolhe de uma vez
  // e a rolagem fica onde estava — o visitante passa a ver o que vem DEPOIS do
  // tópico aberto (relato da autoria, 14/10/2026: via as fotografias da galeria).
  useEffect(() => {
    if (aberto) trazerParaVista(caixa.current);
  }, [aberto]);

  // sem texto e sem conteúdo próprio, a seção não existe (nada de caixa vazia)
  if (texto.trim() === "" && !children) return null;

  return (
    <section className="marco" ref={caixa}>
      <button
        type="button"
        className="marco-titulo marco-titulo-clicavel"
        aria-expanded={aberto}
        onClick={aoAlternar}
      >
        <span className="marco-seta" aria-hidden="true">
          {aberto ? "▾" : "▸"}
        </span>

        {icone && (
          <span className="marco-icone" aria-hidden="true">
            {icone}
          </span>
        )}

        <span className="marco-titulo-texto">{titulo}</span>

        {marca && <span className="personalidade-marca">{marca}</span>}
      </button>

      {aberto && (
        <div className="marco-corpo">
          {children ??
            paragrafosDe(texto).map((p, i) => (
              <p key={i} className="texto-paragrafo">
                <Inline texto={p} />
              </p>
            ))}
        </div>
      )}
    </section>
  );
}
