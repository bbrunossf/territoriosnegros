// src/data/tours.ts
//
// A agenda de tours do app (15/10/2026, pedido da autoria: "a edição do próximo
// tour está integrada à página inicial e não me permite cadastrar mais de um").
//
// Antes existia UM tour, em app_config.proximo_tour. Agora existe uma LISTA, em
// app_config.tours = { lista: Tour[] }. Nada de coluna nova no banco: a chave é
// criada no primeiro "Salvar" do painel.
//
// O tour antigo continua valendo: se a lista não existir, `proximo_tour` vira o
// primeiro item — quem já estava no ar não perde nada.

import { normalizarProximoTour } from "./api";
import type { ProximoTour } from "./types";

export interface Tour extends ProximoTour {
  id: string;
}

export const CHAVE_TOURS = "tours";
export const CHAVE_INSCRICOES = "inscricoes";

/** Regras de exibição dos botões de inscrição (app_config.inscricoes) */
export interface Inscricoes {
  /** mostra o botão dentro do cartão do tour, na tela inicial */
  cartao: boolean;
  /** mostra o botão "Abrir a ficha de inscrição" na página do evento */
  ficha: boolean;
  /** inscrições encerradas: troca o convite pelo aviso, sem apagar nada */
  encerradas: boolean;
  /** texto do aviso de inscrições encerradas */
  aviso: string;
}

export const INSCRICOES_PADRAO: Inscricoes = {
  cartao: true,
  ficha: true,
  encerradas: false,
  aviso: "Inscrições encerradas",
};

/** Data de hoje no fuso de Vitória (aaaa-mm-dd). */
export function hojeEmVitoria(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function normalizarInscricoes(valor: unknown): Inscricoes {
  if (!valor || typeof valor !== "object") return INSCRICOES_PADRAO;

  const v = valor as Record<string, unknown>;

  return {
    cartao: v.cartao !== false,
    ficha: v.ficha !== false,
    encerradas: v.encerradas === true,
    aviso:
      typeof v.aviso === "string" && v.aviso.trim()
        ? v.aviso
        : INSCRICOES_PADRAO.aviso,
  };
}

/**
 * Lista de tours salva no painel.
 * `legado` é o antigo `proximo_tour`, usado quando a lista ainda não existe.
 */
export function lerTours(valor: unknown, legado?: unknown): Tour[] {
  const lista: Tour[] = [];

  const bruto =
    valor && typeof valor === "object" && Array.isArray((valor as { lista?: unknown }).lista)
      ? ((valor as { lista: unknown[] }).lista)
      : null;

  if (bruto) {
    bruto.forEach((item, i) => {
      const tour = normalizarProximoTour(item);

      if (!tour) return;

      const id =
        item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string"
          ? ((item as { id: string }).id || `tour-${i + 1}`)
          : `tour-${i + 1}`;

      lista.push({ ...tour, id });
    });
  }

  if (lista.length === 0) {
    const antigo = normalizarProximoTour(legado);

    if (antigo && (antigo.texto || antigo.data || antigo.local || antigo.ativo)) {
      lista.push({ ...antigo, id: "tour-1" });
    }
  }

  return lista;
}

/**
 * Tours que o app pode mostrar: ativos e ainda não vencidos (sem data = sempre),
 * do mais próximo para o mais distante. Data que já passou sai do ar sozinha —
 * o painel avisa isso.
 */
export function toursNoAr(tours: Tour[]): Tour[] {
  const hoje = hojeEmVitoria();

  return tours
    .filter((t) => t.ativo)
    .filter((t) => !t.data || t.data.slice(0, 10) >= hoje)
    .sort(
      (a, b) =>
        (a.data || "9999-12-31").localeCompare(b.data || "9999-12-31") ||
        (a.hora || "99:99").localeCompare(b.hora || "99:99") ||
        a.texto.localeCompare(b.texto, "pt-BR")
    );
}

/** O tour que a tela inicial e a página do evento mostram. */
export function proximoTourDe(tours: Tour[]): Tour | null {
  return toursNoAr(tours)[0] ?? null;
}

export function tourPorId(tours: Tour[], id?: string | null): Tour | null {
  if (!id) return null;

  return tours.find((t) => t.id === id) ?? null;
}

/** Um tour já passou da data? (o painel usa para avisar) */
export function tourVencido(tour: Tour): boolean {
  const hoje = hojeEmVitoria();

  return !!tour.data && tour.data.slice(0, 10) < hoje;
}
