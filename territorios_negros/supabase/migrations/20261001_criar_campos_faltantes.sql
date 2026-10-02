-- Cria os campos que faltam nas fichas dos territórios (verificado em 01/10/2026).
--
-- Contexto: a revisão da ficha (painel → Territórios → "Revisão das fichas")
-- mostrou que alguns territórios têm a coluna VAZIA (null) enquanto outros têm a
-- mesma coluna preenchida — o app trata null e vazio do mesmo jeito, mas o banco
-- fica desigual. Aqui os campos passam a existir em todas as fichas.
--
-- ATENÇÃO: cada UPDATE age APENAS onde o campo está ausente (null). Nada que a
-- autoria já registrou é sobrescrito. Rode no SQL Editor do Supabase, uma vez.
--
-- Sobre o "ano": é coluna numérica, não existe valor "vazio" para ela — os dois
-- territórios sem ano (congo, rua13) continuam assim até a autoria decidir o ano.
-- A revisão da ficha no painel marca esses dois como pendência.

-- 1. Camadas de tempo (cartão "Camada temporal"): null → lista vazia
update territorios
   set idade_camadas = '[]'::jsonb
 where idade_camadas is null
    or jsonb_typeof(idade_camadas) <> 'array';

-- 2. Observação
update territorios set observacao = '' where observacao is null;

-- 3. Fotos de apoio
update territorios set fotos = '[]'::jsonb where fotos is null;

-- 4. Vídeos de apoio
update territorios set videos = '[]'::jsonb where videos is null;

-- 5. Para observar durante a visita (jsonb)
update territorios set observar = '[]'::jsonb where observar is null;

-- 6. Crédito da foto principal
update territorios set imagem_credito = '' where imagem_credito is null;

-- Conferência depois de rodar: não deve sobrar nenhum "null" nestas colunas.
-- select id,
--        jsonb_typeof(idade_camadas) as camadas_tempo,
--        coalesce(observacao, '(null)') as observacao,
--        jsonb_typeof(fotos)  as fotos,
--        jsonb_typeof(videos) as videos,
--        coalesce(imagem_credito, '(null)') as credito
--   from territorios
--  order by id;
