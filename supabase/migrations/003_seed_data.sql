-- ============================================================
-- 003_seed_data.sql — FIFA World Cup 2026 Teams & Players
-- ============================================================

-- -------------------------------------------------------
-- 48 FIFA World Cup 2026 Teams
-- -------------------------------------------------------
INSERT INTO public.teams (id, name, short_code, flag_url, group_name, confederation) VALUES
  -- GROUP A
  ('11111111-0001-0000-0000-000000000001', 'United States', 'USA', 'https://flagcdn.com/w80/us.png', 'A', 'CONCACAF'),
  ('11111111-0001-0000-0000-000000000002', 'Panama', 'PAN', 'https://flagcdn.com/w80/pa.png', 'A', 'CONCACAF'),
  ('11111111-0001-0000-0000-000000000003', 'Bolivia', 'BOL', 'https://flagcdn.com/w80/bo.png', 'A', 'CONMEBOL'),
  ('11111111-0001-0000-0000-000000000004', 'New Zealand', 'NZL', 'https://flagcdn.com/w80/nz.png', 'A', 'OFC'),
  -- GROUP B
  ('11111111-0002-0000-0000-000000000001', 'Argentina', 'ARG', 'https://flagcdn.com/w80/ar.png', 'B', 'CONMEBOL'),
  ('11111111-0002-0000-0000-000000000002', 'Chile', 'CHI', 'https://flagcdn.com/w80/cl.png', 'B', 'CONMEBOL'),
  ('11111111-0002-0000-0000-000000000003', 'Peru', 'PER', 'https://flagcdn.com/w80/pe.png', 'B', 'CONMEBOL'),
  ('11111111-0002-0000-0000-000000000004', 'Australia', 'AUS', 'https://flagcdn.com/w80/au.png', 'B', 'AFC'),
  -- GROUP C
  ('11111111-0003-0000-0000-000000000001', 'Mexico', 'MEX', 'https://flagcdn.com/w80/mx.png', 'C', 'CONCACAF'),
  ('11111111-0003-0000-0000-000000000002', 'Jamaica', 'JAM', 'https://flagcdn.com/w80/jm.png', 'C', 'CONCACAF'),
  ('11111111-0003-0000-0000-000000000003', 'Venezuela', 'VEN', 'https://flagcdn.com/w80/ve.png', 'C', 'CONMEBOL'),
  ('11111111-0003-0000-0000-000000000004', 'Iraq', 'IRQ', 'https://flagcdn.com/w80/iq.png', 'C', 'AFC'),
  -- GROUP D
  ('11111111-0004-0000-0000-000000000001', 'France', 'FRA', 'https://flagcdn.com/w80/fr.png', 'D', 'UEFA'),
  ('11111111-0004-0000-0000-000000000002', 'Morocco', 'MAR', 'https://flagcdn.com/w80/ma.png', 'D', 'CAF'),
  ('11111111-0004-0000-0000-000000000003', 'Algeria', 'ALG', 'https://flagcdn.com/w80/dz.png', 'D', 'CAF'),
  ('11111111-0004-0000-0000-000000000004', 'Slovakia', 'SVK', 'https://flagcdn.com/w80/sk.png', 'D', 'UEFA'),
  -- GROUP E
  ('11111111-0005-0000-0000-000000000001', 'Spain', 'ESP', 'https://flagcdn.com/w80/es.png', 'E', 'UEFA'),
  ('11111111-0005-0000-0000-000000000002', 'Brazil', 'BRA', 'https://flagcdn.com/w80/br.png', 'E', 'CONMEBOL'),
  ('11111111-0005-0000-0000-000000000003', 'Japan', 'JPN', 'https://flagcdn.com/w80/jp.png', 'E', 'AFC'),
  ('11111111-0005-0000-0000-000000000004', 'Switzerland', 'SUI', 'https://flagcdn.com/w80/ch.png', 'E', 'UEFA'),
  -- GROUP F
  ('11111111-0006-0000-0000-000000000001', 'Germany', 'GER', 'https://flagcdn.com/w80/de.png', 'F', 'UEFA'),
  ('11111111-0006-0000-0000-000000000002', 'Portugal', 'POR', 'https://flagcdn.com/w80/pt.png', 'F', 'UEFA'),
  ('11111111-0006-0000-0000-000000000003', 'Uruguay', 'URU', 'https://flagcdn.com/w80/uy.png', 'F', 'CONMEBOL'),
  ('11111111-0006-0000-0000-000000000004', 'Cameroon', 'CMR', 'https://flagcdn.com/w80/cm.png', 'F', 'CAF'),
  -- GROUP G
  ('11111111-0007-0000-0000-000000000001', 'England', 'ENG', 'https://flagcdn.com/w80/gb-eng.png', 'G', 'UEFA'),
  ('11111111-0007-0000-0000-000000000002', 'Netherlands', 'NED', 'https://flagcdn.com/w80/nl.png', 'G', 'UEFA'),
  ('11111111-0007-0000-0000-000000000003', 'Colombia', 'COL', 'https://flagcdn.com/w80/co.png', 'G', 'CONMEBOL'),
  ('11111111-0007-0000-0000-000000000004', 'Senegal', 'SEN', 'https://flagcdn.com/w80/sn.png', 'G', 'CAF'),
  -- GROUP H
  ('11111111-0008-0000-0000-000000000001', 'Belgium', 'BEL', 'https://flagcdn.com/w80/be.png', 'H', 'UEFA'),
  ('11111111-0008-0000-0000-000000000002', 'Croatia', 'CRO', 'https://flagcdn.com/w80/hr.png', 'H', 'UEFA'),
  ('11111111-0008-0000-0000-000000000003', 'Saudi Arabia', 'KSA', 'https://flagcdn.com/w80/sa.png', 'H', 'AFC'),
  ('11111111-0008-0000-0000-000000000004', 'South Africa', 'RSA', 'https://flagcdn.com/w80/za.png', 'H', 'CAF'),
  -- GROUP I
  ('11111111-0009-0000-0000-000000000001', 'Italy', 'ITA', 'https://flagcdn.com/w80/it.png', 'I', 'UEFA'),
  ('11111111-0009-0000-0000-000000000002', 'Ecuador', 'ECU', 'https://flagcdn.com/w80/ec.png', 'I', 'CONMEBOL'),
  ('11111111-0009-0000-0000-000000000003', 'Congo DR', 'COD', 'https://flagcdn.com/w80/cd.png', 'I', 'CAF'),
  ('11111111-0009-0000-0000-000000000004', 'South Korea', 'KOR', 'https://flagcdn.com/w80/kr.png', 'I', 'AFC'),
  -- GROUP J
  ('11111111-000a-0000-0000-000000000001', 'Canada', 'CAN', 'https://flagcdn.com/w80/ca.png', 'J', 'CONCACAF'),
  ('11111111-000a-0000-0000-000000000002', 'Turkey', 'TUR', 'https://flagcdn.com/w80/tr.png', 'J', 'UEFA'),
  ('11111111-000a-0000-0000-000000000003', 'Paraguay', 'PAR', 'https://flagcdn.com/w80/py.png', 'J', 'CONMEBOL'),
  ('11111111-000a-0000-0000-000000000004', 'Nigeria', 'NGA', 'https://flagcdn.com/w80/ng.png', 'J', 'CAF'),
  -- GROUP K
  ('11111111-000b-0000-0000-000000000001', 'Portugal', 'POR', 'https://flagcdn.com/w80/pt.png', 'K', 'UEFA'),
  ('11111111-000b-0000-0000-000000000002', 'Ivory Coast', 'CIV', 'https://flagcdn.com/w80/ci.png', 'K', 'CAF'),
  ('11111111-000b-0000-0000-000000000003', 'Iran', 'IRN', 'https://flagcdn.com/w80/ir.png', 'K', 'AFC'),
  ('11111111-000b-0000-0000-000000000004', 'Honduras', 'HON', 'https://flagcdn.com/w80/hn.png', 'K', 'CONCACAF'),
  -- GROUP L
  ('11111111-000c-0000-0000-000000000001', 'Netherlands', 'NED', 'https://flagcdn.com/w80/nl.png', 'L', 'UEFA'),
  ('11111111-000c-0000-0000-000000000002', 'Ghana', 'GHA', 'https://flagcdn.com/w80/gh.png', 'L', 'CAF'),
  ('11111111-000c-0000-0000-000000000003', 'Qatar', 'QAT', 'https://flagcdn.com/w80/qa.png', 'L', 'AFC'),
  ('11111111-000c-0000-0000-000000000004', 'Costa Rica', 'CRC', 'https://flagcdn.com/w80/cr.png', 'L', 'CONCACAF')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- Star Players for Tournament Predictions
-- -------------------------------------------------------
INSERT INTO public.players (name, team_id, position, birth_date) VALUES
  -- Argentina
  ('Lionel Messi',        '11111111-0002-0000-0000-000000000001', 'FWD', '1987-06-24'),
  ('Julián Álvarez',      '11111111-0002-0000-0000-000000000001', 'FWD', '2000-01-31'),
  ('Rodrigo De Paul',     '11111111-0002-0000-0000-000000000001', 'MID', '1994-05-24'),
  ('Emiliano Martínez',   '11111111-0002-0000-0000-000000000001', 'GK',  '1992-09-02'),
  -- Brazil
  ('Vinicius Jr.',        '11111111-0005-0000-0000-000000000002', 'FWD', '2000-07-12'),
  ('Rodrygo',             '11111111-0005-0000-0000-000000000002', 'FWD', '2001-01-09'),
  ('Alisson Becker',      '11111111-0005-0000-0000-000000000002', 'GK',  '1992-10-02'),
  ('Casemiro',            '11111111-0005-0000-0000-000000000002', 'MID', '1992-02-23'),
  -- France
  ('Kylian Mbappé',       '11111111-0004-0000-0000-000000000001', 'FWD', '1998-12-20'),
  ('Antoine Griezmann',   '11111111-0004-0000-0000-000000000001', 'FWD', '1991-03-21'),
  ('Mike Maignan',        '11111111-0004-0000-0000-000000000001', 'GK',  '1995-07-03'),
  ('Eduardo Camavinga',   '11111111-0004-0000-0000-000000000001', 'MID', '2002-11-10'),
  -- England
  ('Harry Kane',          '11111111-0007-0000-0000-000000000001', 'FWD', '1993-07-28'),
  ('Jude Bellingham',     '11111111-0007-0000-0000-000000000001', 'MID', '2003-06-29'),
  ('Phil Foden',          '11111111-0007-0000-0000-000000000001', 'MID', '2000-05-28'),
  ('Jordan Pickford',     '11111111-0007-0000-0000-000000000001', 'GK',  '1994-03-07'),
  -- Spain
  ('Pedri',               '11111111-0005-0000-0000-000000000001', 'MID', '2002-11-25'),
  ('Lamine Yamal',        '11111111-0005-0000-0000-000000000001', 'FWD', '2007-07-13'),
  ('Nico Williams',       '11111111-0005-0000-0000-000000000001', 'FWD', '2002-07-12'),
  ('Unai Simón',          '11111111-0005-0000-0000-000000000001', 'GK',  '1997-06-11'),
  -- Germany
  ('Florian Wirtz',       '11111111-0006-0000-0000-000000000001', 'MID', '2003-05-03'),
  ('Jamal Musiala',       '11111111-0006-0000-0000-000000000001', 'MID', '2003-02-26'),
  ('Manuel Neuer',        '11111111-0006-0000-0000-000000000001', 'GK',  '1986-03-27'),
  ('Kai Havertz',         '11111111-0006-0000-0000-000000000001', 'FWD', '1999-06-11'),
  -- Portugal
  ('Cristiano Ronaldo',   '11111111-0006-0000-0000-000000000002', 'FWD', '1985-02-05'),
  ('Rafael Leão',         '11111111-0006-0000-0000-000000000002', 'FWD', '1999-06-10'),
  ('Bruno Fernandes',     '11111111-0006-0000-0000-000000000002', 'MID', '1994-09-08'),
  -- Netherlands
  ('Virgil van Dijk',     '11111111-0007-0000-0000-000000000002', 'DEF', '1991-07-08'),
  ('Cody Gakpo',          '11111111-0007-0000-0000-000000000002', 'FWD', '1999-05-07'),
  -- Morocco
  ('Achraf Hakimi',       '11111111-0004-0000-0000-000000000002', 'DEF', '1998-11-04'),
  ('Hakim Ziyech',        '11111111-0004-0000-0000-000000000002', 'MID', '1993-03-19'),
  -- USA
  ('Christian Pulisic',   '11111111-0001-0000-0000-000000000001', 'FWD', '1998-09-18'),
  ('Tyler Adams',         '11111111-0001-0000-0000-000000000001', 'MID', '1999-02-14'),
  -- Mexico
  ('Hirving Lozano',      '11111111-0003-0000-0000-000000000001', 'FWD', '1995-07-30'),
  ('Santiago Giménez',    '11111111-0003-0000-0000-000000000001', 'FWD', '2001-04-18'),
  -- Canada
  ('Alphonso Davies',     '11111111-000a-0000-0000-000000000001', 'DEF', '2000-11-02'),
  ('Jonathan David',      '11111111-000a-0000-0000-000000000001', 'FWD', '2000-01-14'),
  -- Japan
  ('Takefusa Kubo',       '11111111-0005-0000-0000-000000000003', 'FWD', '2001-06-04'),
  ('Daichi Kamada',       '11111111-0005-0000-0000-000000000003', 'MID', '1996-08-05'),
  -- Belgium
  ('Kevin De Bruyne',     '11111111-0008-0000-0000-000000000001', 'MID', '1991-06-28'),
  ('Romelu Lukaku',       '11111111-0008-0000-0000-000000000001', 'FWD', '1993-05-13'),
  -- Italy
  ('Federico Chiesa',     '11111111-0009-0000-0000-000000000001', 'FWD', '1997-10-25'),
  ('Nicolò Barella',      '11111111-0009-0000-0000-000000000001', 'MID', '1997-02-07'),
  ('Gianluigi Donnarumma','11111111-0009-0000-0000-000000000001', 'GK',  '1999-02-25'),
  -- Colombia
  ('James Rodríguez',     '11111111-0007-0000-0000-000000000003', 'MID', '1991-07-12'),
  ('Luis Díaz',           '11111111-0007-0000-0000-000000000003', 'FWD', '1997-01-13'),
  -- Senegal
  ('Sadio Mané',          '11111111-0007-0000-0000-000000000004', 'FWD', '1992-04-10'),
  -- Croatia
  ('Luka Modrić',         '11111111-0008-0000-0000-000000000002', 'MID', '1985-09-09'),
  -- Nigeria
  ('Victor Osimhen',      '11111111-000a-0000-0000-000000000004', 'FWD', '1998-12-29'),
  ('Kelechi Iheanacho',   '11111111-000a-0000-0000-000000000004', 'FWD', '1996-10-03')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------
-- Sample Group Stage Matches (First 8 — Group A & B)
-- -------------------------------------------------------
INSERT INTO public.matches (home_team_id, away_team_id, kickoff_time, stage, match_day, venue) VALUES
  ('11111111-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000002',
   '2026-06-11 17:00:00+00', 'group', 1, 'MetLife Stadium, New Jersey'),
  ('11111111-0001-0000-0000-000000000003', '11111111-0001-0000-0000-000000000004',
   '2026-06-11 20:00:00+00', 'group', 1, 'SoFi Stadium, Los Angeles'),
  ('11111111-0002-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002',
   '2026-06-12 17:00:00+00', 'group', 1, 'AT&T Stadium, Dallas'),
  ('11111111-0002-0000-0000-000000000003', '11111111-0002-0000-0000-000000000004',
   '2026-06-12 20:00:00+00', 'group', 1, 'Hard Rock Stadium, Miami'),
  ('11111111-0004-0000-0000-000000000001', '11111111-0004-0000-0000-000000000002',
   '2026-06-13 17:00:00+00', 'group', 1, 'Levi''s Stadium, San Francisco'),
  ('11111111-0005-0000-0000-000000000001', '11111111-0005-0000-0000-000000000002',
   '2026-06-14 17:00:00+00', 'group', 1, 'MetLife Stadium, New Jersey'),
  ('11111111-0006-0000-0000-000000000001', '11111111-0006-0000-0000-000000000002',
   '2026-06-15 17:00:00+00', 'group', 1, 'AT&T Stadium, Dallas'),
  ('11111111-0007-0000-0000-000000000001', '11111111-0007-0000-0000-000000000002',
   '2026-06-16 17:00:00+00', 'group', 1, 'Rose Bowl, Los Angeles')
ON CONFLICT DO NOTHING;
