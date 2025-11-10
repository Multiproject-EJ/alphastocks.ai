-- Schema
create schema if not exists punchcard;

-- Universe table
create table if not exists punchcard.punchcard_stocks (
  id text primary key,
  name text not null,
  ticker text not null,
  quality int not null check (quality between 0 and 100),
  value int not null check (value between 0 and 100),
  momentum int not null check (momentum between 0 and 100),
  risk int not null check (risk between 0 and 100),
  mcap text,
  cagr text,
  gm text,
  debt text,
  created_at timestamp with time zone default now()
);

-- Boards
create table if not exists punchcard.punchcard_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null, -- for future auth
  title text not null default 'Board',
  created_at timestamp with time zone default now()
);

-- Tiles
create table if not exists punchcard.punchcard_tiles (
  board_id uuid references punchcard.punchcard_boards(id) on delete cascade,
  side text not null check (side in ('up','right','down','left')),
  position int not null,
  stock_id text references punchcard.punchcard_stocks(id) on delete restrict,
  created_at timestamp with time zone default now(),
  primary key (board_id, side, position)
);

-- RLS
alter table punchcard.punchcard_stocks enable row level security;
alter table punchcard.punchcard_boards enable row level security;
alter table punchcard.punchcard_tiles enable row level security;

-- Policies
create policy "stocks are readable by all"
on punchcard.punchcard_stocks
for select to anon, authenticated
using (true);

create policy "boards are readable"
on punchcard.punchcard_boards
for select to anon, authenticated
using (true);

create policy "boards are insertable"
on punchcard.punchcard_boards
for insert to anon, authenticated
with check (true);

create policy "tiles are readable"
on punchcard.punchcard_tiles
for select to anon, authenticated
using (true);

create policy "tiles are upsertable"
on punchcard.punchcard_tiles
for insert to anon, authenticated
with check (true);

create policy "tiles are deletable"
on punchcard.punchcard_tiles
for delete to anon, authenticated
using (true);

-- Seed 20 demo stocks
insert into punchcard.punchcard_stocks (id,name,ticker,quality,value,momentum,risk,mcap,cagr,gm,debt) values
('AAPL','Apple Inc.','AAPL',84,42,71,28,'$3.7T','9.4%','45%','0.9x'),
('MSFT','Microsoft','MSFT',88,35,68,25,'$3.4T','12.1%','69%','1.2x'),
('NVDA','NVIDIA','NVDA',86,22,92,41,'$2.7T','35.8%','74%','0.5x'),
('AMZN','Amazon','AMZN',74,47,72,36,'$1.9T','11.2%','47%','1.7x'),
('GOOGL','Alphabet','GOOGL',79,51,60,27,'$2.1T','10.3%','56%','0.2x'),
('META','Meta','META',72,66,77,33,'$1.2T','13.9%','82%','0.3x'),
('TSLA','Tesla','TSLA',61,38,58,52,'$0.8T','28.4%','18%','1.5x'),
('BKR','Baker Hughes','BKR',55,72,49,42,'$30B','8.2%','22%','2.1x'),
('ASML','ASML','ASML',90,28,64,29,'$410B','15.6%','51%','0.8x'),
('SHOP','Shopify','SHOP',68,31,63,47,'$100B','21.3%','51%','0.4x'),
('ADBE','Adobe','ADBE',80,44,55,30,'$250B','11.8%','88%','0.7x'),
('V','Visa','V',83,48,57,22,'$520B','10.1%','97%','0.6x'),
('MA','Mastercard','MA',82,46,59,24,'$480B','10.6%','78%','0.7x'),
('NFLX','Netflix','NFLX',66,39,73,40,'$260B','14.2%','43%','1.1x'),
('INTC','Intel','INTC',58,70,41,45,'$180B','2.1%','40%','1.6x'),
('ORCL','Oracle','ORCL',71,55,54,29,'$350B','8.7%','79%','2.5x'),
('SAP','SAP','SAP',77,52,50,27,'$220B','7.9%','70%','0.9x'),
('JNJ','Johnson & Johnson','JNJ',75,68,40,18,'$380B','4.2%','68%','0.5x'),
('XOM','Exxon Mobil','XOM',62,74,46,34,'$500B','6.0%','35%','0.8x'),
('KO','Coca-Cola','KO',70,65,37,20,'$270B','5.5%','60%','2.0x')
on conflict (id) do nothing;
