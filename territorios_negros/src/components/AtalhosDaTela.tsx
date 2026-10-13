// src/components/AtalhosDaTela.tsx
//
// Desenha os atalhos fixos de uma tela NA ORDEM que a autoria gravou no painel
// (aba Botões, grupo "Atalhos dentro das telas") — cada tela diz quais atalhos
// ela tem, e a ordem vem de app_config.ordem_botoes.atalhos.
//
// Sem ordem gravada, vale a ordem padrão (a que já está publicada). Id que não
// estiver na ordem entra depois, na ordem padrão: nada desaparece.
import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_ORDEM_BOTOES, lerOrdemDoGrupo } from "../data/botoesDoApp";
import { ordenarIds } from "../utils/ordem";
import BotaoApoiadores from "./BotaoApoiadores";
import BotaoBaseTeorica from "./BotaoBaseTeorica";
import BotaoCidadeVitoria from "./BotaoCidadeVitoria";
import BotaoPresencaNegra from "./BotaoPresencaNegra";
import BotaoTerritorios from "./BotaoTerritorios";

/** Um atalho pelo seu id (os mesmos ids da aba Botões). */
function Atalho({ id }: { id: string }) {
  switch (id) {
    case "ir-para-base-teorica":
      return <BotaoBaseTeorica />;

    case "presenca-na-cidade-de-vitoria":
      return (
        <BotaoPresencaNegra
          id="presenca-na-cidade-de-vitoria"
          texto="Presença Negra na Cidade de Vitória"
        />
      );

    case "ir-para-os-territorios":
      return <BotaoTerritorios />;

    case "cidade-de-vitoria":
      return <BotaoCidadeVitoria />;

    case "presenca-negra":
      return <BotaoPresencaNegra />;

    case "cidade-no-topo-da-presenca":
      return <BotaoCidadeVitoria id="cidade-no-topo-da-presenca" texto="A cidade de Vitória" />;

    case "apoiadores":
      return <BotaoApoiadores />;

    default:
      return null;
  }
}

export default function AtalhosDaTela({ ids }: { ids: string[] }) {
  const { config } = useTerritorios();

  const ordem = ordenarIds(ids, lerOrdemDoGrupo(config[CHAVE_ORDEM_BOTOES], "atalhos"));

  return (
    <>
      {ordem.map((id) => (
        <Atalho key={id} id={id} />
      ))}
    </>
  );
}
