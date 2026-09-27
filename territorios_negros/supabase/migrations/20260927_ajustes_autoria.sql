-- ============================================================================
-- Territórios Negros - Vitória/ES
-- Migração de ajustes pedidos pela autoria (documento de 27/09/2026)
-- Rodar UMA vez no SQL Editor do Supabase. Script idempotente (pode rodar de novo).
-- ============================================================================

-- --------------------------------------------------------------- 1. CATEGORIAS
-- As categorias estavam fixas no código (src/components/Territorios.tsx).
-- Agora viram tabela: a autoria cria, renomeia e reordena pelo painel.
create table if not exists categorias (
  id    text primary key,
  nome  text not null,
  ordem int  not null default 0
);

insert into categorias (id, nome, ordem) values
  ('arquiteturas-religiosidade',   'Arquiteturas e religiosidade', 1),
  ('institucionalizacao-memoria',  'Institucionalização da memória e cultura negra', 2),
  ('monumentos',                   'Monumentos e marcos de memória', 3),
  ('espacos-urbanos',              'Espaços urbanos, infraestrutura e permanência', 4),
  ('personalidades',               'Personalidades e trajetórias negras', 5),
  ('cultura-praticas',             'Cultura e práticas', 6)
on conflict (id) do nothing;

-- ------------------------------------------------------------- 2. TERRITÓRIOS
alter table territorios
  add column if not exists categoria       text,
  add column if not exists ativo           boolean not null default true,
  add column if not exists ordem           int     not null default 0,
  add column if not exists fotos           jsonb   not null default '[]'::jsonb,
  add column if not exists fotos_liberadas boolean not null default false;

-- classificação inicial dos 16 territórios já cadastrados (mesma divisão de antes)
update territorios set categoria = 'arquiteturas-religiosidade'  where id in ('rosario','saogoncalo');
update territorios set categoria = 'institucionalizacao-memoria' where id in ('mucane');
update territorios set categoria = 'monumentos'                  where id in ('grilhoes','dona','pelourinho');
update territorios set categoria = 'espacos-urbanos'             where id in ('praca','chafariz','vilarubim','moscoso','rua13');
update territorios set categoria = 'personalidades'              where id in ('mariasaraiva','zilda');
update territorios set categoria = 'cultura-praticas'            where id in ('sambao','congo','piedade');

-- ordem de exibição na aba Territórios (antes vinha do app_config, que está vazio)
update territorios t
   set ordem = s.rn
  from (select id, row_number() over (order by nome) as rn from territorios) s
 where t.id = s.id and t.ordem = 0;

-- --------------------------------------------------------------- 3. ROTEIROS
alter table roteiros
  add column if not exists ativo         boolean not null default true,
  add column if not exists ordem         int     not null default 0,
  add column if not exists mapa_url      text,
  add column if not exists inscricao_url text;

-- ----------------------------------------------------------------- 4. CONFIG
-- Textos/links editáveis (aviso de próximo tour, ficha de inscrição, páginas).
create table if not exists app_config (
  key   text primary key,
  value jsonb not null default '{}'::jsonb
);

alter table app_config
  add column if not exists atualizado_em timestamptz not null default now();

-- se a coluna "value" já existia como texto, converte para jsonb
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'app_config'
       and column_name  = 'value'
       and data_type   <> 'jsonb'
  ) then
    alter table app_config alter column value type jsonb using value::jsonb;
  end if;
end $$;

insert into app_config (key, value) values
  ('proximo_tour', '{"ativo": false, "texto": "", "data": "", "hora": "", "inscricao_url": ""}'::jsonb),
  ('inscricao_url', '""'::jsonb)
on conflict (key) do nothing;

-- -------------------------------------------------------------- 5. MENSAGENS
create table if not exists mensagens (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  email     text,
  whatsapp  text,
  mensagem  text not null,
  lida      boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------- 6. PERMISSÕES (RLS)
-- CAUSA DO BUG RELATADO: sem policy de UPDATE/INSERT, o Supabase devolve 200 e
-- grava ZERO linhas, sem erro -- o painel mostrava "salvo" e nada mudava.
alter table territorios enable row level security;
alter table roteiros    enable row level security;
alter table categorias  enable row level security;
alter table app_config  enable row level security;
alter table mensagens   enable row level security;

-- leitura pública (app aberto para visitantes)
drop policy if exists "leitura publica territorios" on territorios;
create policy "leitura publica territorios" on territorios for select using (true);

drop policy if exists "leitura publica roteiros" on roteiros;
create policy "leitura publica roteiros" on roteiros for select using (true);

drop policy if exists "leitura publica categorias" on categorias;
create policy "leitura publica categorias" on categorias for select using (true);

drop policy if exists "leitura publica app_config" on app_config;
create policy "leitura publica app_config" on app_config for select using (true);

-- escrita: apenas usuário logado (painel da autoria)
drop policy if exists "admin total territorios" on territorios;
create policy "admin total territorios" on territorios for all to authenticated using (true) with check (true);

drop policy if exists "admin total roteiros" on roteiros;
create policy "admin total roteiros" on roteiros for all to authenticated using (true) with check (true);

drop policy if exists "admin total categorias" on categorias;
create policy "admin total categorias" on categorias for all to authenticated using (true) with check (true);

drop policy if exists "admin total app_config" on app_config;
create policy "admin total app_config" on app_config for all to authenticated using (true) with check (true);

-- mensagens: visitante envia; somente a autoria lê
drop policy if exists "visitante envia mensagem" on mensagens;
create policy "visitante envia mensagem" on mensagens for insert to anon, authenticated with check (true);

drop policy if exists "admin le mensagens" on mensagens;
create policy "admin le mensagens" on mensagens for select to authenticated using (true);

drop policy if exists "admin edita mensagens" on mensagens;
create policy "admin edita mensagens" on mensagens for update to authenticated using (true) with check (true);

drop policy if exists "admin apaga mensagens" on mensagens;
create policy "admin apaga mensagens" on mensagens for delete to authenticated using (true);

-- storage do bucket "dados_site" (fotos dos territórios)
drop policy if exists "dados_site leitura" on storage.objects;
create policy "dados_site leitura" on storage.objects for select using (bucket_id = 'dados_site');

drop policy if exists "dados_site escrita" on storage.objects;
create policy "dados_site escrita" on storage.objects for all to authenticated using (bucket_id = 'dados_site') with check (bucket_id = 'dados_site');

-- grants explícitos (redundante com o default do Supabase, mas garante)
grant select on territorios, roteiros, categorias, app_config to anon, authenticated;
grant insert, update, delete on territorios, roteiros, categorias, app_config to authenticated;
grant insert on mensagens to anon, authenticated;
grant select, update, delete on mensagens to authenticated;

-- --------------------------------------------------------- 7. VERIFICAÇÃO
-- Depois de rodar, deve listar uma policy por tabela (nada de tabela sem policy):
-- select tablename, policyname, cmd from pg_policies
--  where schemaname = 'public' order by tablename;
