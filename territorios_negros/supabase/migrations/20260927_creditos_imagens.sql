-- ============================================================================
-- Crédito da foto principal dos territórios
-- Rode UMA vez no SQL Editor do Supabase. Idempotente.
-- (o crédito das fotos de apoio e dos mapas das rotas não precisa de coluna
--  nova: já vive dentro do jsonb de cada foto/mapa)
-- ============================================================================

alter table territorios
  add column if not exists imagem_credito text;

-- conferência
-- select id, nome, imagem_credito from territorios where imagem_credito is not null;
