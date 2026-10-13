// src/components/BotoesDaTela.tsx
//
// Desenha os botões de navegação de uma tela, num dos dois lugares (topo ou
// final), conforme o que a autoria escolheu na aba Botões do painel.
//
// Regras que este componente garante:
//   · botão desligado no painel não aparece em lugar nenhum;
//   · botão que levaria para a tela em que o visitante já está não aparece
//     (não faz sentido um convite para o lugar onde a pessoa está);
//   · os botões que a autoria criou em Páginas (para outros endereços) entram
//     depois, e nunca repetem o que já está na lista nem o "Enviar uma mensagem".
import "../styles/botoes-telas.css";

import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_BOTOES_INTRO,
  lerNomesDeBotoes,
} from "../data/botoesDoApp";
import type { BotaoConteudo } from "../data/paginas";
import {
  DESTINO_DA_TELA,
  atalhosDaTela,
  catalogoPorId,
  filtrarPropriaTela,
  nomeDoCatalogo,
  rotuloDeBotaoDaPagina,
} from "../data/botoesPorTela";
import { normalizarTexto } from "../data/personalidades";
import BotaoApoiadores from "./BotaoApoiadores";
import BotaoBaseTeorica from "./BotaoBaseTeorica";
import BotaoCidadeVitoria from "./BotaoCidadeVitoria";
import BotaoPersonalidades from "./BotaoPersonalidades";
import BotaoPresencaNegra from "./BotaoPresencaNegra";
import BotaoTerritorios from "./BotaoTerritorios";

/** Um botão do catálogo, já com o nome que a autoria gravou. */
function Botao({ id }: { id: string }) {
  const { config } = useTerritorios();
  const entrada = catalogoPorId(id);

  if (!entrada) return null;

  switch (id) {
    case "base-teorica":
      return <BotaoBaseTeorica />;

    case "cidade-de-vitoria":
      return <BotaoCidadeVitoria id="cidade-de-vitoria" />;

    case "presenca-negra":
      return <BotaoPresencaNegra id="presenca-negra" />;

    case "territorios":
      return <BotaoTerritorios />;

    case "apoiadores":
      return <BotaoApoiadores />;

    case "personalidades":
      return <BotaoPersonalidades />;

    case "roteiros":
      // não há componente próprio: é o mesmo botão do app, com o nome do catálogo
      return (
        <Link className="btn pagina-botao" to="/roteiros">
          {nomeDoCatalogo(config, entrada)}
        </Link>
      );

    case "inicio":
      return (
        <Link className="btn pagina-botao" to="/">
          {nomeDoCatalogo(config, entrada)}
        </Link>
      );

    default:
      return null;
  }
}

type Props = {
  /** a tela do app (ver TELAS_DO_APP) */
  tela: string;
  /** onde os botões entram: topo (logo abaixo do título) ou final da página */
  posicao?: "topo" | "final";
  /** botões criados pela autoria em Páginas, para outros endereços */
  extras?: BotaoConteudo[];
};

export default function BotoesDaTela({ tela, posicao = "final", extras = [] }: Props) {
  const { config } = useTerritorios();

  const ids = filtrarPropriaTela(atalhosDaTela(config, tela, posicao), DESTINO_DA_TELA[tela] ?? "");

  const destinos = ids.map((id) => catalogoPorId(id)?.destino ?? "");
  const nomes = lerNomesDeBotoes(config[CHAVE_BOTOES_INTRO]);

  const extrasFiltrados = (extras ?? []).filter((b) => {
    const destino = (b.url ?? "").trim();

    if (!destino) return false;
    if (destino === "/contato") return false; // o "Enviar uma mensagem" é do app
    if (destinos.includes(destino)) return false;

    return !normalizarTexto(destino).includes("/contato");
  });

  if (ids.length === 0 && extrasFiltrados.length === 0) return null;

  return (
    <div className="pagina-botoes">
      {ids.map((id) => (
        <Botao key={id} id={id} />
      ))}

      {extrasFiltrados.map((b, i) => (
        <Link
          key={`${b.url}-${i}`}
          className={b.estilo === "outline" ? "outline pagina-botao" : "btn pagina-botao"}
          to={b.url}
        >
          {rotuloDeBotaoDaPagina(config, b.url ?? "", b.texto?.trim() || nomes[b.url] || b.url)}
        </Link>
      ))}
    </div>
  );
}
