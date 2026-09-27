-- Restauração de campos que ficaram vazios na importação do dados.json para
-- a tabela territorios do Supabase (verificado em 27/09/2026 pelo assistente).
--
-- Cada UPDATE só age onde o campo está vazio: nunca sobrescreve edição feita no painel.
-- Rode no SQL Editor do Supabase, uma vez.

-- Museu Capixaba do Negro - MUCANE
update territorios set observar = array['A estrutura original do edifício e seus usos anteriores', 'A passagem de espaço privado para território negro institucional', 'As marcas da ocupação cultural e comunitária']
 where id = 'mucane' and coalesce(array_length(observar, 1), 0) = 0;

-- Praça Costa Pereira
update territorios set observar = array['A função atual da praça no cotidiano urbano', 'A ausência de referências à presença negra', 'Quem ocupa o espaço e como ele é utilizado']
 where id = 'praca' and coalesce(array_length(observar, 1), 0) = 0;

-- Estátua de Dona Domingas
update territorios set observar = array['A posição da estátua em relação ao Palácio Anchieta', 'A presença ou ausência de identificação pública', 'O corpo negro feminino no espaço institucional']
 where id = 'dona' and coalesce(array_length(observar, 1), 0) = 0;

-- Chafariz da Capichaba
update territorios set observar = array['O chafariz como antiga infraestrutura urbana', 'A relação entre água, trabalho e presença negra', 'A diferença entre função original e uso atual']
 where id = 'chafariz' and coalesce(array_length(observar, 1), 0) = 0;

-- Rua 13 de Maio
update territorios set observar = array['A ausência de marcas físicas do passado escravista', 'O contraste entre o nome da rua e sua configuração atual', 'A relação entre memória oficial e memória apagada']
 where id = 'rua13' and coalesce(array_length(observar, 1), 0) = 0;

-- Vila Rubim – Mercado da Vila Rubim
update territorios set observar = array['Área de aterro', 'Presença de produtos religiosos afro-brasileiros', 'Comerciantes negros, pretos e pardos']
 where id = 'vilarubim' and coalesce(array_length(observar, 1), 0) = 0;

-- Parque Moscoso
update territorios set observar = array['A paisagem organizada que encobre usos anteriores', 'A coexistência entre espaço civilizado e permanências invisibilizadas', 'O contraste entre estética atual e história inscrita no chão']
 where id = 'moscoso' and coalesce(array_length(observar, 1), 0) = 0;

-- Quebra dos Grilhões - Monumento aos 100 anos da abolição da escravatura
update territorios set observar = array['Se o espaço convida à parada ou não', 'A relação entre monumento e fluxo urbano', 'O silêncio em torno da memória']
 where id = 'grilhoes' and coalesce(array_length(observar, 1), 0) = 0;

-- Rua Maria Saraiva
update territorios set observar = array['A ausência de vestígios materiais da trajetória de Maria Saraiva', 'A toponímia como forma de preservação da memória', 'A continuidade de práticas culturais negras no espaço']
 where id = 'mariasaraiva' and coalesce(array_length(observar, 1), 0) = 0;

-- Bar da Zilda
update territorios set observar = array['As rodas de samba como ocupação do espaço', 'A relação entre cultura, alimentação e sociabilidade', 'Os diferentes públicos e formas de apropriação do lugar']
 where id = 'zilda' and coalesce(array_length(observar, 1), 0) = 0;

-- Banda de Congo Vira Mundo (Quintal Bantu)
update territorios set observar = array['Os cortejos como ocupação do espaço', 'A conexão com a Rainha Ginga e o Rei Congo', 'A retomada de práticas historicamente silenciadas']
 where id = 'congo' and coalesce(array_length(observar, 1), 0) = 0;

-- Escola de Samba Unidos da Piedade
update territorios set observar = array['As conexões entre morro, samba e cidade', 'O centro como espaço dos primeiros desfiles', 'A organização cultural como forma de resistência']
 where id = 'piedade' and coalesce(array_length(observar, 1), 0) = 0;

-- Sambão do Povo (Complexo Walmor Miranda)
update territorios set observar = array['O vazio fora do período de carnaval', 'A estrutura pensada para controlar o fluxo', 'A diferença entre festa e cotidiano']
 where id = 'sambao' and coalesce(array_length(observar, 1), 0) = 0;

-- Igreja de São Gonçalo dos Homens Pardos
update territorios set observar = array['A relação da igreja com a segregação urbana', 'A narrativa atual ligada aos casamentos duradouros', 'As camadas de memória que permanecem pouco visíveis']
 where id = 'saogoncalo' and coalesce(array_length(observar, 1), 0) = 0;

-- Igreja do Rosário dos Homens Pretos
update territorios set observar = array['A localização elevada e afastada do núcleo colonial', 'A igreja como estrutura construída por mãos negras', 'A escadaria como parte da experiência de acesso ao território']
 where id = 'rosario' and coalesce(array_length(observar, 1), 0) = 0;

-- Pelourinho (Escadaria Maria Ortiz)
update territorios set observar = array['A diferença entre o nome antigo e o nome atual', 'O que a escadaria mostra e o que silencia', 'A relação entre homenagem, violência e memória urbana']
 where id = 'pelourinho' and coalesce(array_length(observar, 1), 0) = 0;

-- camadas temporais do MUCANE
update territorios set idade_camadas = jsonb_build_array(jsonb_build_object('ano', 1912, 'label', 'do edifício'))
 where id = 'mucane' and (idade_camadas is null or idade_camadas = '[]'::jsonb);

-- Conferência depois de rodar (não deve sobrar nenhum 0):
-- select id, coalesce(array_length(observar,1),0) as itens_observar from territorios order by id;

-- Obs.: NÃO incluí a imagem do Congo nem o vídeo do Sambão do Povo: no dados.json
-- eles são placeholders ("congo-vira-mundo" e "SAMBAO_VIDEO"), não URLs reais.
-- Precisam ser enviados pelo painel quando houver os arquivos.
