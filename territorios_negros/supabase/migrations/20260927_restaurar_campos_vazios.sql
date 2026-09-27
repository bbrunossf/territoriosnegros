-- Restauração de campos que ficaram vazios na importação do dados.json para
-- a tabela territorios do Supabase (verificado em 27/09/2026).
--
-- ATENÇÃO: a coluna observar é jsonb (não text[]), por isso as funções jsonb_*.
-- Cada UPDATE age apenas onde o campo está vazio/ausente: nunca sobrescreve
-- edição feita no painel. Rode no SQL Editor do Supabase, uma vez.

-- Guarda usada em todos:
--   coalesce(jsonb_array_length(case when jsonb_typeof(campo) = 'array' then campo end), 0) = 0

-- Museu Capixaba do Negro - MUCANE
update territorios set observar = '["A estrutura original do edifício e seus usos anteriores", "A passagem de espaço privado para território negro institucional", "As marcas da ocupação cultural e comunitária"]'::jsonb
 where id = 'mucane' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Praça Costa Pereira
update territorios set observar = '["A função atual da praça no cotidiano urbano", "A ausência de referências à presença negra", "Quem ocupa o espaço e como ele é utilizado"]'::jsonb
 where id = 'praca' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Estátua de Dona Domingas
update territorios set observar = '["A posição da estátua em relação ao Palácio Anchieta", "A presença ou ausência de identificação pública", "O corpo negro feminino no espaço institucional"]'::jsonb
 where id = 'dona' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Chafariz da Capichaba
update territorios set observar = '["O chafariz como antiga infraestrutura urbana", "A relação entre água, trabalho e presença negra", "A diferença entre função original e uso atual"]'::jsonb
 where id = 'chafariz' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Rua 13 de Maio
update territorios set observar = '["A ausência de marcas físicas do passado escravista", "O contraste entre o nome da rua e sua configuração atual", "A relação entre memória oficial e memória apagada"]'::jsonb
 where id = 'rua13' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Vila Rubim – Mercado da Vila Rubim
update territorios set observar = '["Área de aterro", "Presença de produtos religiosos afro-brasileiros", "Comerciantes negros, pretos e pardos"]'::jsonb
 where id = 'vilarubim' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Parque Moscoso
update territorios set observar = '["A paisagem organizada que encobre usos anteriores", "A coexistência entre espaço civilizado e permanências invisibilizadas", "O contraste entre estética atual e história inscrita no chão"]'::jsonb
 where id = 'moscoso' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Quebra dos Grilhões - Monumento aos 100 anos da abolição da escravatura
update territorios set observar = '["Se o espaço convida à parada ou não", "A relação entre monumento e fluxo urbano", "O silêncio em torno da memória"]'::jsonb
 where id = 'grilhoes' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Rua Maria Saraiva
update territorios set observar = '["A ausência de vestígios materiais da trajetória de Maria Saraiva", "A toponímia como forma de preservação da memória", "A continuidade de práticas culturais negras no espaço"]'::jsonb
 where id = 'mariasaraiva' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Bar da Zilda
update territorios set observar = '["As rodas de samba como ocupação do espaço", "A relação entre cultura, alimentação e sociabilidade", "Os diferentes públicos e formas de apropriação do lugar"]'::jsonb
 where id = 'zilda' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Banda de Congo Vira Mundo (Quintal Bantu)
update territorios set observar = '["Os cortejos como ocupação do espaço", "A conexão com a Rainha Ginga e o Rei Congo", "A retomada de práticas historicamente silenciadas"]'::jsonb
 where id = 'congo' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Escola de Samba Unidos da Piedade
update territorios set observar = '["As conexões entre morro, samba e cidade", "O centro como espaço dos primeiros desfiles", "A organização cultural como forma de resistência"]'::jsonb
 where id = 'piedade' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Sambão do Povo (Complexo Walmor Miranda)
update territorios set observar = '["O vazio fora do período de carnaval", "A estrutura pensada para controlar o fluxo", "A diferença entre festa e cotidiano"]'::jsonb
 where id = 'sambao' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Igreja de São Gonçalo dos Homens Pardos
update territorios set observar = '["A relação da igreja com a segregação urbana", "A narrativa atual ligada aos casamentos duradouros", "As camadas de memória que permanecem pouco visíveis"]'::jsonb
 where id = 'saogoncalo' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Igreja do Rosário dos Homens Pretos
update territorios set observar = '["A localização elevada e afastada do núcleo colonial", "A igreja como estrutura construída por mãos negras", "A escadaria como parte da experiência de acesso ao território"]'::jsonb
 where id = 'rosario' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- Pelourinho (Escadaria Maria Ortiz)
update territorios set observar = '["A diferença entre o nome antigo e o nome atual", "O que a escadaria mostra e o que silencia", "A relação entre homenagem, violência e memória urbana"]'::jsonb
 where id = 'pelourinho' and coalesce(jsonb_array_length(case when jsonb_typeof(observar) = 'array' then observar end), 0) = 0;

-- camadas temporais do MUCANE
update territorios set idade_camadas = '[{"ano": 1912, "label": "do edifício"}]'::jsonb
 where id = 'mucane' and coalesce(jsonb_array_length(case when jsonb_typeof(idade_camadas) = 'array' then idade_camadas end), 0) = 0;

-- Conferência depois de rodar (não deve sobrar nenhum 0):
-- select id, coalesce(jsonb_array_length(observar), 0) as itens from territorios order by id;

-- Obs.: a imagem da Banda de Congo e o vídeo do Sambão do Povo NÃO entram: no
-- dados.json são marcadores de texto ("congo-vira-mundo", "SAMBAO_VIDEO"),
-- não URLs reais. Precisam ser enviados pelo painel.
