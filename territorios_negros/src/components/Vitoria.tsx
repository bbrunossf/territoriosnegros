// Vitoria.tsx — contexto básico da cidade, pedido pela autoria
import { Link } from "react-router-dom";

import Info from "../components/Info";
import Topic from "../components/Topic";
import Numbered from "../components/Numbered";
import PageTitle from "../components/PageTitle";

const LINK_MAPA_CENTRO =
  "https://www.openstreetmap.org/#map=16/-20.3207/-40.3369";

export default function Vitoria() {
  return (
    <>
      <PageTitle
        title="A cidade de Vitória"
        subtitle="Espírito Santo - ES"
      />

      <Info>
        Vitória é a capital do Espírito Santo
        e uma <b>cidade-ilha</b>: seu núcleo
        histórico ocupa uma ilha na Baía de
        Vitória, cercada por manguezais, morros
        e pelo continente. Foi fundada em{" "}
        <b>8 de setembro de 1551</b> e hoje
        reúne cerca de <b>322 mil habitantes</b>{" "}
        (Censo 2022), num território de
        aproximadamente 93 km².
      </Info>

      <Topic
        icon="◉"
        title="O centro histórico: Cidade Alta e Cidade Baixa"
      >
        <p>
          O centro se organiza em dois planos. A{" "}
          <b>Cidade Alta</b> concentra igrejas,
          conventos, o Palácio e as ruas de
          administração colonial. A{" "}
          <b>Cidade Baixa</b> nasceu ligada ao
          porto, ao comércio e ao trabalho:
          mercados, trapiches, praças e
          escadarias que ainda hoje ligam os dois
          níveis.
        </p>
      </Topic>

      <Topic
        icon="✦"
        title="Uma cidade construída com presença negra"
      >
        <p>
          A história de Vitória foi feita também
          pelo trabalho, pela fé e pela
          sociabilidade da população negra:
          irmandades religiosas, igrejas de
          homens pretos e pardos, o pelourinho, os
          mercados, as ruas de moradia popular,
          as escolas de samba, as bandas de congo
          e os quintais.
        </p>

        <p>
          Boa parte dessa presença foi apagada,
          renomeada ou naturalizada na narrativa
          oficial. Reencontrá-la no espaço é o que
          este guia propõe.
        </p>
      </Topic>

      <Topic
        icon="✓"
        title="Como observar a cidade durante o percurso"
      >
        <Numbered
          items={[
            "Repare nos dois níveis do centro: o que fica em cima e o que fica embaixo",
            "Observe as escadarias, ladeiras e becos: são caminhos de circulação negra",
            "Procure os nomes das ruas e pergunte o que eles homenageiam",
            "Note onde há placa, museu e monumento -- e onde há ausência de narrativa",
            "Use os manguezais e o mar como referência do que a cidade aterrou e transformou",
          ]}
        />
      </Topic>

      <Info>
        <b>Mapa do centro histórico:</b>
        <br />

        <a
          href={LINK_MAPA_CENTRO}
          target="_blank"
          rel="noreferrer"
          className="conceito-link"
        >
          Abrir no mapa
        </a>
      </Info>

      <Link to="/roteiros" className="btn conceito-btn">
        Ir para os roteiros
      </Link>
    </>
  );
}
