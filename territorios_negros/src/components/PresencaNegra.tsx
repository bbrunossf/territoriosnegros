// src/components/PresencaNegra.tsx
//
// Página "Presença Negra na Cidade" (pedido da autoria, 02/10/2026).
//
// Nasceu do desmembramento de "A cidade de Vitória": o bloco "Uma cidade
// construída com presença negra" ganhou página própria para aprofundar e, mais
// adiante, receber as biografias das personalidades negras de Vitória.
//
// É uma página de texto como as outras: tudo se edita no painel, aba Páginas
// (chave: pagina_presenca_negra) — blocos, destaques, listas, imagens e links.
import { useTerritorios } from "../context/useTerritorios";
import { PRESENCA_PADRAO, normalizarPagina } from "../data/paginas";
import PaginaConteudo from "./PaginaConteudo";

export default function PresencaNegra() {
  const { config } = useTerritorios();

  return (
    <PaginaConteudo
      pagina={normalizarPagina(config.pagina_presenca_negra, PRESENCA_PADRAO)}
      tela="presenca-negra"
    />
  );
}
