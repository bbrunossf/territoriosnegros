-- ============================================================================
-- Mídias de apoio: visibilidade por item (fotos e vídeos)
-- Rode UMA vez no SQL Editor do Supabase — ANTES de publicar a versão nova do
-- app. Idempotente: rodar de novo não muda mais nada.
--
-- Por quê: até agora as fotos/vídeos de apoio tinham DOIS controles — o do
-- conjunto (fotos_liberadas / videos_liberados, o botão da lista de territórios)
-- e o de cada item (visivel). No painel isso parecia contraditório: "7 fotos
-- bloqueadas" na lista e cada foto "habilitada" dentro do território.
--
-- Agora existe UM controle só: o `visivel` de cada foto/vídeo. O botão
-- "habilitar/desabilitar todas" apenas marca todas de uma vez.
--
-- Esta migração copia para cada item o estado que o conjunto tinha, para o
-- visitante não ver nenhuma mudança de conteúdo depois da publicação:
--   • conjunto bloqueado  -> cada foto/vídeo do território vira visivel = false
--   • conjunto liberado   -> não mexe em nada (item sem marca continua visível)
-- ============================================================================

-- Fotos: territórios com o conjunto bloqueado
update territorios
set fotos = (
  select jsonb_agg(
    case
      when jsonb_typeof(item) = 'object'
        then item || '{"visivel": false}'::jsonb
      else item
    end
    order by pos
  )
  from jsonb_array_elements(fotos) with ordinality as t(item, pos)
)
where jsonb_typeof(fotos) = 'array'
  and jsonb_array_length(fotos) > 0
  and coalesce(fotos_liberadas, false) = false;

-- Vídeos: mesma regra
update territorios
set videos = (
  select jsonb_agg(
    case
      when jsonb_typeof(item) = 'object'
        then item || '{"visivel": false}'::jsonb
      else item
    end
    order by pos
  )
  from jsonb_array_elements(videos) with ordinality as t(item, pos)
)
where jsonb_typeof(videos) = 'array'
  and jsonb_array_length(videos) > 0
  and coalesce(videos_liberados, false) = false;

-- ============================================================================
-- CONFERÊNCIA (rode estes selects e confira o resultado comigo)
--
-- 1) Nada deve aparecer habilitado em território que estava bloqueado:
-- select t.id, t.nome,
--        jsonb_array_length(t.fotos) as fotos,
--        (select count(*) from jsonb_array_elements(t.fotos) f
--          where coalesce((f->>'visivel')::boolean, true)) as fotos_visiveis,
--        jsonb_array_length(t.videos) as videos,
--        (select count(*) from jsonb_array_elements(t.videos) v
--          where coalesce((v->>'visivel')::boolean, true)) as videos_visiveis
-- from territorios t
-- where jsonb_array_length(t.fotos) > 0 or jsonb_array_length(t.videos) > 0
-- order by t.nome;
--
-- 2) O vídeo que já está no ar (Quebra dos Grilhões) tem de continuar visível:
-- select id, nome, videos_liberados,
--        (select count(*) from jsonb_array_elements(videos) v
--          where coalesce((v->>'visivel')::boolean, true)) as videos_visiveis
-- from territorios
-- where jsonb_array_length(videos) > 0;
-- ============================================================================
