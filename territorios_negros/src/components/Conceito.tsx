import { Link } from "react-router-dom";
import LINKS from "../data/links.json";

import Info from "../components/Info";
import Topic from "../components/Topic";
import PageTitle from "../components/PageTitle";



export default function Conceito() {
  return (
    <>
      <PageTitle
        title="Base teórica"
        subtitle="Territórios Negros - Vitória - ES"
      />

      <Info>
        Esta seção apresenta os fundamentos
        conceituais que orientam o uso
        educativo do app.
      </Info>

      <Topic
        icon="◉"
        title="O que é território negro"
      >
        <p>
          O conceito de{" "}
          <b>território negro</b> apresentado
          neste aplicativo é uma construção
          autoral, desenvolvida por{" "}
          <b>Aingrid Fabiane de Souza</b>, a
          partir da articulação de diferentes
          bases teóricas sobre território,
          territorialidade, memória e presença
          negra no espaço urbano.
        </p>

        <p>
          Ele se fundamenta nas perspectivas
          de território e territorialidade
          elaboradas por{" "}
          <b>Claude Raffestin</b>,{" "}
          <b>Milton Santos</b>,{" "}
          <b>Rogério Haesbaert</b> e{" "}
          <b>Kaira Pedrosa Bicalho</b>.
        </p>

        <Info>
          <b>Território negro</b> é
          compreendido como espaço ocupado,
          produzido e sustentado pela
          população negra, ainda que seus
          limites não sejam fixos ou
          oficialmente reconhecidos.
        </Info>
      </Topic>

      <Topic
        icon="⌁"
        title="Camadas, apagamentos e permanências"
      >
        <p>
          A cidade de Vitória - ES é lida aqui
          como espaço de camadas temporais. Um
          mesmo lugar pode ter sido ladeira,
          pelourinho, escadaria, praça,
          mercado, parque, rota de trabalho,
          ponto de sociabilidade ou lugar de
          culto.
        </p>

        <p>
          O app parte da ideia de que a
          presença negra nem sempre aparece na
          narrativa oficial da cidade. Muitas
          vezes ela permanece apagada,
          deslocada, renomeada ou naturalizada.
        </p>
      </Topic>

      <Topic
        icon="◎"
        title="Por que ler a cidade a partir dos territórios negros"
      >
        <p>
          Porque a cidade não é neutra.
          Vitória - ES foi construída com a
          presença, o trabalho, a circulação,
          a religiosidade, a cultura e a
          resistência da população negra.
        </p>
      </Topic>

      {/* ── conteúdo que antes ficava na aba "Sobre" ── */}
      <Topic
        icon="ⓘ"
        title="Sobre o app"
      >
        <p>
          Este aplicativo é um guia educacional
          de leitura territorial, criado para
          apoiar caminhadas, aulas de campo e
          experiências formativas sobre os
          territórios negros no Centro de
          Vitória - ES.
        </p>

        <p>
          <b>Autoria:</b> Aingrid Fabiane de Souza,
          licenciada em Geografia (UFES).
          <br />
          <b>Base teórica:</b> TCC “Territórios
          Negros na cidade de Vitória - ES (2024)”.
        </p>
      </Topic>

      <Topic
        icon="♪"
        title="Produções associadas ao projeto"
      >
        <ul className="sobre-list">
          <li>
            <a
              href={LINKS.musica1}
              target="_blank"
              rel="noreferrer"
              className="sobre-link"
            >
              Vitória, Não Apague Nossa Cor
            </a>
          </li>

          <li>
            <a
              href={LINKS.musica2}
              target="_blank"
              rel="noreferrer"
              className="sobre-link"
            >
              Mulher Raiz Ancestral
            </a>
          </li>

          <li>
            <a
              href={LINKS.documentario}
              target="_blank"
              rel="noreferrer"
              className="sobre-link"
            >
              Documentário – Coisas de Negres
            </a>
          </li>
        </ul>
      </Topic>

      <Info>
        <b>TCC completo:</b>
        <br />

        <a
          href={LINKS.tcc}
          target="_blank"
          rel="noreferrer"
          className="conceito-link"
        >
          Acessar no Repositório da UFES
        </a>
      </Info>

      <Link to="/roteiros" className="btn conceito-btn">
        Ir para os roteiros
      </Link>

      <Link to="/contato" className="outline conceito-btn">
        Enviar uma mensagem
      </Link>
    </>
  );
}
