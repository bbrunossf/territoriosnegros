
import LINKS from "../data/links.json";

import Info from "../components/Info";
import Topic from "../components/Topic";
import PageTitle from "../components/PageTitle";

type Props = {
  setTela: (tela: string) => void;
};

export default function Conceito({
  setTela,
}: Props) {
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

      <button
        className="btn conceito-btn"
        onClick={() => setTela("roteiros")}
      >
        Ir para os roteiros
      </button>
    </>
  );
}
