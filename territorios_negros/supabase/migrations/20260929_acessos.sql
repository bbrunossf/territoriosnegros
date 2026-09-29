-- Contador de acessos do app (estatística de uso)
--
-- Uma linha por página vista no app. Nada de dado pessoal: não guarda IP, nome,
-- e-mail, cookie nem o texto do navegador — só a rota aberta, uma marca de
-- tempo, o tipo de aparelho (celular/tablet/computador, calculado no aparelho)
-- e um código aleatório de sessão que morre quando a aba é fechada.
--
-- Rodar UMA vez no Supabase: SQL Editor → colar → Run.

create table if not exists public.acessos (
  id           bigserial primary key,
  criado_em    timestamptz not null default now(),
  -- dia no fuso de Vitória - ES (o servidor grava em UTC; a contagem por dia
  -- precisa ser no horário local dos visitantes)
  dia          date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  rota         text not null,
  dispositivo  text,
  sessao       text
);

create index if not exists acessos_criado_em_idx on public.acessos (criado_em);
create index if not exists acessos_dia_idx       on public.acessos (dia);
create index if not exists acessos_rota_idx      on public.acessos (rota);

alter table public.acessos enable row level security;

-- visitante (sem login) só pode REGISTRAR o acesso; não pode ler nada
drop policy if exists "visitante registra acesso" on public.acessos;
create policy "visitante registra acesso" on public.acessos
  for insert to anon, authenticated
  with check (true);

-- só a autoria logada no painel lê e apaga os registros
drop policy if exists "admin le acessos" on public.acessos;
create policy "admin le acessos" on public.acessos
  for select to authenticated
  using (true);

drop policy if exists "admin apaga acessos" on public.acessos;
create policy "admin apaga acessos" on public.acessos
  for delete to authenticated
  using (true);

-- ── conferência depois de rodar (deve listar 3 policies e a tabela vazia) ──
-- select policyname, cmd from pg_policies where tablename = 'acessos';
-- select count(*) from public.acessos;
