-- ============================================================================
-- Vídeos de apoio dos territórios
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode rodar de novo sem
-- problema: só cria o que ainda não existe e não mexe em dado nenhum).
--
-- Mesma ideia das fotos de apoio:
--   • videos           -> lista de vídeos do território (jsonb). Cada item tem
--                         url, legenda e credito; nada é apagado por rodar isto.
--   • videos_liberados -> true = os visitantes já podem ver os vídeos.
--                         false (padrão) = tudo bloqueado até a autoria liberar
--                         no painel, no botão "Liberar".
--
-- Não precisa de policy nova de RLS: as permissões são da tabela territorios e
-- já valem para estas colunas também.
-- ============================================================================

alter table territorios
  add column if not exists videos jsonb not null default '[]'::jsonb,
  add column if not exists videos_liberados boolean not null default false;

-- conferência: quantos vídeos cada território tem e se estão liberados
-- select id, nome, jsonb_array_length(videos) as videos, videos_liberados
-- from territorios
-- order by nome;
