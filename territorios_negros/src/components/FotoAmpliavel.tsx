import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  alt: string;
  legenda?: string;
  /** crédito da imagem (autoria, acervo, fonte) */
  credito?: string;
  className?: string;
};

/** altura reservada para a barra de controles dentro do overlay */
const ALTURA_BARRA = 78;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;

/**
 * Foto/mapa que abre ampliado ao clicar.
 *
 * O app roda numa coluna estreita (430px) por causa do celular; no computador
 * isso deixa mapas e imagens densas ilegíveis. Ao clicar, a imagem abre sobre a
 * tela inteira com Zoom + / − (de 10% a 400%), botão "caber na tela" para ver o
 * mapa inteiro de uma vez, e atalho para abrir o arquivo original em nova guia.
 */
export default function FotoAmpliavel({ url, alt, legenda, credito, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ajustado, setAjustado] = useState(false);
  const [imagemCarregada, setImagemCarregada] = useState(false);

  const areaRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  /** menor zoom em que a imagem inteira cabe na tela (nunca aumenta) */
  const zoomParaCaber = useCallback(() => {
    const img = imgRef.current;
    const area = areaRef.current;
    if (!img || !area) return 1;

    const largura = img.naturalWidth;
    const altura = img.naturalHeight;
    const larguraArea = area.clientWidth;
    if (!largura || !altura || !larguraArea) return 1;

    const alturaDisponivel = Math.max(120, window.innerHeight - ALTURA_BARRA);
    const porAltura = (alturaDisponivel * largura) / (larguraArea * altura);

    return Math.min(1, Math.max(ZOOM_MIN, Math.round(porAltura * 100) / 100));
  }, []);

  function fechar() {
    setAberto(false);
    setZoom(1);
    setAjustado(false);
    setImagemCarregada(false);
  }

  function abrir() {
    setZoom(1);
    setAjustado(false);
    setImagemCarregada(false);
    setAberto(true);
  }

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);

    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  // ao carregar, se a imagem não couber toda na tela, já abre mostrando inteira
  function aoCarregarImagem() {
    setImagemCarregada(true);

    if (ajustado) return;
    setAjustado(true);

    const z = zoomParaCaber();
    if (z < 1) setZoom(z);
  }

  /** recalcula o encaixe quando a janela gira/muda de tamanho */
  useEffect(() => {
    if (!aberto) return;

    const aoRedimensionar = () => {
      const z = zoomParaCaber();
      if (z < 1) setZoom(z);
    };

    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [aberto, zoomParaCaber]);

  return (
    <>
      <figure className={`territorio-foto ${className ?? ""}`.trim()}>
        <button
          type="button"
          className="foto-botao"
          onClick={abrir}
          title="Clique para ampliar"
        >
          <img src={url} alt={alt} />
          <span className="foto-dica">⌕ ampliar</span>
        </button>

        {(legenda || credito) && (
          <figcaption>
            {legenda}
            {credito && <span className="foto-credito">{credito}</span>}
          </figcaption>
        )}
      </figure>

      {aberto && (
        <div className="foto-zoom" onClick={fechar} role="presentation">
          <div className="foto-zoom-barra" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="outline"
              onClick={() =>
                setZoom((z) => Math.max(ZOOM_MIN, Math.round((z / 1.25) * 100) / 100))
              }
              title="Diminuir"
              aria-label="Diminuir zoom"
            >
              −
            </button>

            <span className="foto-zoom-nivel">{Math.round(zoom * 100)}%</span>

            <button
              type="button"
              className="outline"
              onClick={() =>
                setZoom((z) => Math.min(ZOOM_MAX, Math.round(z * 1.25 * 100) / 100))
              }
              title="Aumentar"
              aria-label="Aumentar zoom"
            >
              +
            </button>

            <button
              type="button"
              className="outline"
              onClick={() => setZoom(zoomParaCaber())}
              title="Ver a imagem inteira na tela"
            >
              caber na tela
            </button>

            <a className="outline" href={url} target="_blank" rel="noreferrer">
              abrir em nova guia
            </a>

            <button type="button" className="outline" onClick={fechar}>
              fechar ✕
            </button>

            {/* legenda e crédito sempre visíveis, junto dos controles */}
            {(legenda || credito) && (
              <p className="foto-zoom-legenda">
                {legenda}
                {legenda && credito && " · "}
                {credito}
              </p>
            )}
          </div>

          <div className="foto-zoom-area" ref={areaRef}>
            <img
              ref={imgRef}
              src={url}
              alt={alt}
              onLoad={aoCarregarImagem}
              onError={() => setImagemCarregada(true)}
              style={{ width: `${zoom * 100}%`, opacity: imagemCarregada ? 1 : 0 }}
              onClick={(e) => e.stopPropagation()}
            />

          </div>
        </div>
      )}
    </>
  );
}
