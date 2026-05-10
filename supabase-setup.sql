-- Execute este SQL no SQL Editor do Supabase para criar a tabela

create table shipments (
  id bigint generated always as identity primary key,
  tracking_code text not null,
  recipient_name text not null,
  recipient_document text default '',
  recipient_email text default '',
  recipient_address text default '',
  street_name text default '',
  street_number text default '',
  city text not null,
  state text not null,
  product_name text default '',
  product_value text default '',
  purchase_date text default '',
  status text default 'pendente',
  events jsonb default '[]'::jsonb,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- Habilitar RLS (Row Level Security) mas permitir acesso anônimo para leitura pública
alter table shipments enable row level security;

-- Política para leitura pública (rastreio)
create policy "Leitura pública de shipments"
  on shipments for select
  using (true);

-- Política para inserção (admin)
create policy "Inserção de shipments"
  on shipments for insert
  with check (true);

-- Política para atualização (admin)
create policy "Atualização de shipments"
  on shipments for update
  using (true);

-- Política para exclusão (admin)
create policy "Exclusão de shipments"
  on shipments for delete
  using (true);

-- Índice para busca por tracking_code
create index idx_shipments_tracking_code on shipments (tracking_code);

-- Índice para busca por documento
create index idx_shipments_recipient_document on shipments (recipient_document);
