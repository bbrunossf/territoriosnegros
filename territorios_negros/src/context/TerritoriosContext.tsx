// src/context/TerritoriosContext.tsx
// Carrega territórios, rotas, categorias e configurações do Supabase de uma vez
// e distribui para o app. O hook de acesso vive em useTerritorios.ts.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  fetchCategorias,
  fetchConfig,
  fetchRoteiros,
  fetchTerritorios,
  normalizarProximoTour,
} from "../data/api";
import type { Categoria, Roteiro, TerritoriosMap } from "../data/types";
import { ordenarTerritorios, roteirosVisiveis } from "../utils/catalogo";
import { DadosCtx } from "./dadosContext";

export function TerritoriosProvider({ children }: { children: ReactNode }) {
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});
  const [todosRoteiros, setTodosRoteiros] = useState<Roteiro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /** assinatura do último conteúdo aplicado — evita redesenhar o app à toa */
  const assinatura = useRef("");
  /** true enquanto uma recarga está em curso (não dispara outra em cima) */
  const recarregando = useRef(false);

  const recarregar = useCallback(async () => {
    if (recarregando.current) return;
    recarregando.current = true;

    try {
      const [t, r, c, cfg] = await Promise.all([
        fetchTerritorios(),
        fetchRoteiros(),
        fetchCategorias(),
        fetchConfig(),
      ]);

      // Nada mudou desde a última leitura (o caso de 9 em cada 10 atualizações
      // automáticas): não troca os objetos, para não redesenhar a tela nem
      // sacudir o que o visitante está fazendo.
      const nova = JSON.stringify([t, r, c, cfg]);

      if (nova === assinatura.current) {
        setErro(null);
        return;
      }

      assinatura.current = nova;

      setTerritorios(t);
      setTodosRoteiros(r);
      setCategorias(c);
      setConfig(cfg);
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar os dados.");
    } finally {
      recarregando.current = false;
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      await recarregar();
      if (ativo) setCarregando(false);
    })();

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  /**
   * Atualização automática (14/10/2026).
   *
   * Quando a autoria desligava uma foto no painel, o visitante que já estava
   * com o app aberto continuava vendo a imagem até recarregar a página — e,
   * ao religar, precisava recarregar de novo para ela voltar. Agora o app
   * reconsulta o banco a cada 20 s enquanto está na tela, e na hora em que a
   * aba volta a ficar visível (trocar de app no celular, voltar para a aba).
   *
   * No painel (/admin, /login) não roda: lá há edição em andamento e a
   * releitura apagaria o que está sendo digitado.
   */
  const ultimaAtualizacao = useRef(0);

  useEffect(() => {
    const noPainel = () =>
      window.location.pathname.startsWith("/admin") ||
      window.location.pathname.startsWith("/login");

    const atualizar = (comFolga = false) => {
      if (document.visibilityState !== "visible" || noPainel()) return;

      // o "focus" dispara a cada clique na janela: não vale consultar de novo
      // se acabamos de consultar
      const espera = comFolga ? 8000 : 0;
      if (Date.now() - ultimaAtualizacao.current < espera) return;

      ultimaAtualizacao.current = Date.now();
      void recarregar();
    };

    const aoVoltar = () => atualizar(true);
    const intervalo = window.setInterval(() => atualizar(), 20000);

    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
    };
  }, [recarregar]);

  const proximoTourBruto = normalizarProximoTour(config.proximo_tour);
  const proximoTour = proximoTourBruto?.ativo ? proximoTourBruto : null;

  const inscricaoGeral = typeof config.inscricao_url === "string" ? config.inscricao_url : "";
  const inscricaoUrl = inscricaoGeral || proximoTourBruto?.inscricaoUrl || "";

  return (
    <DadosCtx.Provider
      value={{
        territorios,
        roteiros: roteirosVisiveis(todosRoteiros),
        todosRoteiros,
        categorias,
        config,
        proximoTour,
        inscricaoUrl,
        ordemTerritoriosVisual: ordenarTerritorios(territorios, categorias).map((t) => t.id),
        carregando,
        erro,
        recarregar,
      }}
    >
      {children}
    </DadosCtx.Provider>
  );
}
