-- ============================================================================
-- Rotas: logo do evento + imagens de mapa do percurso
-- Rode UMA vez no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table roteiros
  add column if not exists logo  text,
  add column if not exists mapas jsonb not null default '[]'::jsonb;

-- mapas: mesma estrutura das fotos de apoio dos territórios
--   [{"url": "https://...", "legenda": "texto opcional"}, ...]

-- conferência
-- select id, nome, (logo is not null) as tem_logo, coalesce(jsonb_array_length(mapas),0) as qtd_mapas from roteiros order by ordem;
