-- Bulk-seed the bike Make/Model/Year catalog so the seller listing dropdown
-- and homepage search cover the vast majority of real bikes on the road in
-- South Africa, the US and the UK, without every seller having to submit a
-- YMM request for common models.
--
-- Compiled from general motorcycle-industry knowledge (there is no free,
-- comprehensive, machine-readable global YMM API to pull from) — it is
-- broad but not literally exhaustive. Scope: models sold roughly 2000 to
-- present, across global brands plus region-specific ones relevant to at
-- least one of the three target markets (e.g. Indian/Victory/Zero/Buell/
-- Ural for the US, Lexmoto/Lambretta/Mash/Norton for the UK, TVS/Bajaj/
-- Hero/CFMoto for South Africa). Year ranges are approximate nameplate
-- production windows, not exact generation boundaries — admins can split
-- or adjust any row from the Bike Catalog page, and sellers can always
-- submit a YMM request for anything still missing.
--
-- Safe to re-run: bike_makes upserts on slug, bike_models skips duplicates
-- on (make_id, name, year_from, year_to).

-- ---------------------------------------------------------------------------
-- New makes not already seeded by 0011 (South Africa / US / UK relevant)
-- ---------------------------------------------------------------------------
insert into public.bike_makes (name, slug, logo, sort_order) values
  ('Indian', 'indian', 'IND', 17),
  ('Victory', 'victory', 'VIC', 18),
  ('Zero Motorcycles', 'zero', 'ZRO', 19),
  ('Can-Am', 'can-am', 'C-A', 20),
  ('Norton', 'norton', 'NOR', 21),
  ('MV Agusta', 'mv-agusta', 'MVA', 22),
  ('Benelli', 'benelli', 'BEN', 23),
  ('CFMoto', 'cfmoto', 'CFM', 24),
  ('TVS', 'tvs', 'TVS', 25),
  ('Bajaj', 'bajaj', 'BAJ', 26),
  ('Hero', 'hero', 'HERO', 27),
  ('Kymco', 'kymco', 'KYM', 28),
  ('SYM', 'sym', 'SYM', 29),
  ('GasGas', 'gasgas', 'GG', 30),
  ('Sherco', 'sherco', 'SHR', 31),
  ('Lexmoto', 'lexmoto', 'LEX', 32),
  ('Lambretta', 'lambretta', 'LAM', 33),
  ('Mash', 'mash', 'MASH', 34),
  ('Buell', 'buell', 'BUE', 35),
  ('Ural', 'ural', 'URAL', 36)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Models, joined to bike_makes by slug
-- ---------------------------------------------------------------------------
insert into public.bike_models (make_id, name, year_from, year_to)
select bm.id, v.name, v.year_from, v.year_to
from (values
  -- Honda
  ('honda', 'CBR600RR', 2003, 2024),
  ('honda', 'CBR1000RR Fireblade', 2004, 2025),
  ('honda', 'CB500F', 2013, 2025),
  ('honda', 'CB650R', 2019, 2025),
  ('honda', 'CBR250R', 2011, 2017),
  ('honda', 'CRF250L', 2013, 2025),
  ('honda', 'CRF450R', 2002, 2025),
  ('honda', 'Africa Twin CRF1100L', 2016, 2025),
  ('honda', 'Gold Wing', 2000, 2025),
  ('honda', 'Shadow VT750/VT1100', 2000, 2020),
  ('honda', 'Rebel 500', 2017, 2025),
  ('honda', 'PCX125', 2010, 2025),
  ('honda', 'Varadero XL1000V', 2000, 2013),
  ('honda', 'Transalp XL700V', 2008, 2013),
  ('honda', 'Hornet CB600F', 2000, 2013),

  -- Yamaha
  ('yamaha', 'YZF-R1', 2000, 2025),
  ('yamaha', 'YZF-R6', 2000, 2020),
  ('yamaha', 'YZF-R3', 2015, 2025),
  ('yamaha', 'MT-07', 2014, 2025),
  ('yamaha', 'MT-09', 2013, 2025),
  ('yamaha', 'MT-15', 2017, 2025),
  ('yamaha', 'Tenere 700', 2019, 2025),
  ('yamaha', 'Super Tenere XT1200Z', 2010, 2025),
  ('yamaha', 'FZ6', 2004, 2010),
  ('yamaha', 'FZ8', 2010, 2015),
  ('yamaha', 'WR250F', 2001, 2025),
  ('yamaha', 'YZ450F', 2003, 2025),
  ('yamaha', 'V-Star 650', 2000, 2017),
  ('yamaha', 'XSR700', 2016, 2025),
  ('yamaha', 'NMAX 155', 2015, 2025),

  -- Suzuki
  ('suzuki', 'GSX-R600', 2000, 2020),
  ('suzuki', 'GSX-R750', 2000, 2025),
  ('suzuki', 'GSX-R1000', 2000, 2025),
  ('suzuki', 'Hayabusa GSX1300R', 1999, 2025),
  ('suzuki', 'SV650', 2000, 2025),
  ('suzuki', 'V-Strom 650', 2004, 2025),
  ('suzuki', 'V-Strom 1000/1050', 2002, 2025),
  ('suzuki', 'Bandit 650/1250', 2000, 2016),
  ('suzuki', 'DR-Z400', 2000, 2025),
  ('suzuki', 'Boulevard M109R', 2006, 2020),
  ('suzuki', 'GSX250R', 2017, 2024),

  -- Kawasaki
  ('kawasaki', 'Ninja 250R/300/400', 2000, 2025),
  ('kawasaki', 'Ninja 650 (ER-6f)', 2006, 2025),
  ('kawasaki', 'Ninja ZX-6R', 2000, 2025),
  ('kawasaki', 'Ninja ZX-10R', 2004, 2025),
  ('kawasaki', 'Z650', 2017, 2025),
  ('kawasaki', 'Z900', 2017, 2025),
  ('kawasaki', 'Versys 650', 2007, 2025),
  ('kawasaki', 'Versys 1000', 2012, 2025),
  ('kawasaki', 'KLR650', 2000, 2025),
  ('kawasaki', 'Vulcan S', 2015, 2025),
  ('kawasaki', 'KX250F', 2004, 2025),

  -- BMW
  ('bmw', 'R1200GS / R1250GS', 2004, 2025),
  ('bmw', 'F800GS', 2008, 2018),
  ('bmw', 'F850GS', 2018, 2025),
  ('bmw', 'S1000RR', 2009, 2025),
  ('bmw', 'S1000R', 2014, 2025),
  ('bmw', 'F900R', 2020, 2025),
  ('bmw', 'R nineT', 2014, 2025),
  ('bmw', 'G310R', 2016, 2025),
  ('bmw', 'K1600GT/GTL', 2011, 2025),
  ('bmw', 'F650GS', 2000, 2012),

  -- KTM
  ('ktm', 'Duke 125/200/250/390', 2011, 2025),
  ('ktm', 'Duke 690', 2008, 2025),
  ('ktm', 'Duke 790/890', 2018, 2025),
  ('ktm', '1290 Super Duke R', 2014, 2025),
  ('ktm', 'RC390', 2014, 2025),
  ('ktm', '690 Enduro', 2008, 2025),
  ('ktm', '450 EXC-F', 2003, 2025),
  ('ktm', '250/300 EXC', 2000, 2025),
  ('ktm', '1290 Super Adventure', 2015, 2025),
  ('ktm', '390 Adventure', 2020, 2025),

  -- Triumph
  ('triumph', 'Bonneville T100/T120', 2000, 2025),
  ('triumph', 'Street Triple', 2007, 2025),
  ('triumph', 'Speed Triple', 2000, 2025),
  ('triumph', 'Tiger 800', 2010, 2018),
  ('triumph', 'Tiger 900', 2019, 2025),
  ('triumph', 'Tiger 1200', 2012, 2025),
  ('triumph', 'Daytona 675', 2006, 2017),
  ('triumph', 'Rocket 3', 2004, 2025),
  ('triumph', 'Scrambler 900/1200', 2006, 2025),
  ('triumph', 'Trident 660', 2021, 2025),

  -- Ducati
  ('ducati', 'Monster 696/797/821', 2000, 2025),
  ('ducati', 'Panigale (899/959/1199/1299/V4)', 2012, 2025),
  ('ducati', 'Multistrada (1200/1260/V4)', 2003, 2025),
  ('ducati', 'Scrambler', 2015, 2025),
  ('ducati', 'Diavel', 2011, 2025),
  ('ducati', 'SuperSport 939', 2017, 2025),
  ('ducati', 'Streetfighter V4', 2020, 2025),
  ('ducati', '748/916/996/998', 2000, 2004),
  ('ducati', 'Hypermotard', 2007, 2025),

  -- Harley-Davidson
  ('harley-davidson', 'Sportster 883/1200', 2000, 2022),
  ('harley-davidson', 'Nightster', 2022, 2025),
  ('harley-davidson', 'Street 500/750', 2015, 2020),
  ('harley-davidson', 'Softail (Fat Boy/Heritage/Street Bob)', 2000, 2025),
  ('harley-davidson', 'Road King', 2000, 2025),
  ('harley-davidson', 'Street Glide', 2000, 2025),
  ('harley-davidson', 'Road Glide', 2000, 2025),
  ('harley-davidson', 'Electra Glide Ultra Classic', 2000, 2025),
  ('harley-davidson', 'Iron 883', 2009, 2022),
  ('harley-davidson', 'Pan America 1250', 2021, 2025),
  ('harley-davidson', 'LiveWire', 2019, 2025),

  -- Royal Enfield
  ('royal-enfield', 'Classic 350/500', 2009, 2025),
  ('royal-enfield', 'Bullet 350/500', 2000, 2025),
  ('royal-enfield', 'Continental GT 650', 2018, 2025),
  ('royal-enfield', 'Interceptor 650', 2018, 2025),
  ('royal-enfield', 'Himalayan', 2016, 2025),
  ('royal-enfield', 'Meteor 350', 2020, 2025),
  ('royal-enfield', 'Hunter 350', 2022, 2025),

  -- Aprilia
  ('aprilia', 'RS125/RS250', 2000, 2013),
  ('aprilia', 'RS660', 2020, 2025),
  ('aprilia', 'RSV4', 2009, 2025),
  ('aprilia', 'Tuono V4', 2011, 2025),
  ('aprilia', 'Tuono 660', 2021, 2025),
  ('aprilia', 'Shiver 750/900', 2007, 2025),
  ('aprilia', 'Dorsoduro', 2008, 2017),

  -- Moto Guzzi
  ('moto-guzzi', 'V7', 2008, 2025),
  ('moto-guzzi', 'V85 TT', 2019, 2025),
  ('moto-guzzi', 'California 1400', 2013, 2020),
  ('moto-guzzi', 'Griso', 2005, 2016),
  ('moto-guzzi', 'V9 Roamer/Bobber', 2016, 2025),

  -- Husqvarna
  ('husqvarna', 'Svartpilen 125/200/401', 2018, 2025),
  ('husqvarna', 'Vitpilen 401/701', 2018, 2025),
  ('husqvarna', 'FE 350/501', 2014, 2025),
  ('husqvarna', 'TE 300', 2014, 2025),
  ('husqvarna', 'Norden 901', 2022, 2025),

  -- Piaggio
  ('piaggio', 'Beverly 300/400', 2004, 2025),
  ('piaggio', 'MP3 300/500', 2006, 2025),
  ('piaggio', 'Liberty 125/150', 2000, 2025),

  -- Vespa
  ('vespa', 'Primavera 150', 2013, 2025),
  ('vespa', 'GTS 300', 2008, 2025),
  ('vespa', 'Sprint 150', 2014, 2025),
  ('vespa', 'LX 125/150', 2005, 2013),

  -- Beta
  ('beta', 'RR 250/300/350/390/430/480', 2000, 2025),
  ('beta', 'Xtrainer 300', 2015, 2025),
  ('beta', 'Alp 200/4.0', 2020, 2025),

  -- Indian (US)
  ('indian', 'Scout', 2015, 2025),
  ('indian', 'Scout Bobber', 2018, 2025),
  ('indian', 'Chief Classic/Chieftain', 2014, 2025),
  ('indian', 'Springfield', 2016, 2025),
  ('indian', 'FTR 1200', 2019, 2025),
  ('indian', 'Roadmaster', 2015, 2025),

  -- Victory (US, discontinued 2017 — used market)
  ('victory', 'Vegas', 2003, 2017),
  ('victory', 'Hammer', 2005, 2017),
  ('victory', 'Cross Country', 2010, 2017),
  ('victory', 'Octane', 2016, 2017),

  -- Zero Motorcycles (US electric)
  ('zero', 'Zero S', 2013, 2025),
  ('zero', 'Zero SR', 2014, 2025),
  ('zero', 'Zero DSR', 2018, 2025),
  ('zero', 'Zero FXE', 2021, 2025),

  -- Can-Am (US/Canada three-wheelers)
  ('can-am', 'Spyder RT', 2010, 2025),
  ('can-am', 'Spyder F3', 2015, 2025),
  ('can-am', 'Ryker', 2019, 2025),

  -- Norton (UK)
  ('norton', 'Commando 961', 2010, 2020),
  ('norton', 'Dominator', 2020, 2025),
  ('norton', 'V4SS', 2021, 2025),

  -- MV Agusta
  ('mv-agusta', 'Brutale 800/1000', 2005, 2025),
  ('mv-agusta', 'F3 675/800', 2012, 2025),
  ('mv-agusta', 'F4', 2000, 2018),
  ('mv-agusta', 'Dragster 800', 2014, 2025),

  -- Benelli
  ('benelli', 'TRK 502', 2017, 2025),
  ('benelli', 'Leoncino 500', 2017, 2025),
  ('benelli', '302R/302S', 2017, 2025),
  ('benelli', 'TNT 300/600', 2005, 2020),

  -- CFMoto
  ('cfmoto', '300NK/300SR', 2018, 2025),
  ('cfmoto', '650NK/650MT', 2013, 2025),
  ('cfmoto', '800MT', 2022, 2025),
  ('cfmoto', '450SR', 2023, 2025),

  -- TVS (SA/India)
  ('tvs', 'Apache RTR 160/200', 2007, 2025),
  ('tvs', 'Apache RR310', 2017, 2025),
  ('tvs', 'Ronin', 2023, 2025),

  -- Bajaj (SA/India)
  ('bajaj', 'Pulsar 135/150/180/200', 2001, 2025),
  ('bajaj', 'Dominar 400', 2017, 2025),
  ('bajaj', 'Avenger 220', 2005, 2020),

  -- Hero (SA/India)
  ('hero', 'Splendor', 2000, 2025),
  ('hero', 'Hunk', 2007, 2020),
  ('hero', 'Xpulse 200', 2019, 2025),

  -- Kymco (scooters)
  ('kymco', 'Agility 125/150', 2005, 2025),
  ('kymco', 'Xciting 400', 2013, 2025),
  ('kymco', 'Downtown 350', 2015, 2025),

  -- SYM (scooters)
  ('sym', 'Fiddle 125', 2010, 2025),
  ('sym', 'Jet 14 125', 2015, 2025),
  ('sym', 'Maxsym 400', 2016, 2025),

  -- GasGas
  ('gasgas', 'EC 250/300', 2000, 2025),
  ('gasgas', 'MC 450F', 2021, 2025),
  ('gasgas', 'ES 700', 2023, 2025),

  -- Sherco
  ('sherco', 'SE 300/450', 2010, 2025),
  ('sherco', 'Factory 300', 2015, 2025),

  -- Lexmoto (UK budget/learner)
  ('lexmoto', 'Assault 125', 2015, 2025),
  ('lexmoto', 'Michigan 125', 2018, 2025),
  ('lexmoto', 'LXR 125/200', 2016, 2025),

  -- Lambretta (UK scooter revival)
  ('lambretta', 'V125/V200', 2017, 2025),
  ('lambretta', 'G350', 2020, 2025),

  -- Mash (UK/EU retro)
  ('mash', 'Seventy Five 125/250/400/650', 2013, 2025),
  ('mash', 'X-Ride 650', 2018, 2025),

  -- Buell (US, discontinued 2009 — cult used market)
  ('buell', 'Blast', 2000, 2009),
  ('buell', 'XB9R Firebolt', 2002, 2010),
  ('buell', 'XB12S Lightning', 2004, 2010),
  ('buell', 'Ulysses XB12X', 2006, 2010),

  -- Ural (Russia/US import sidecars)
  ('ural', 'Gear Up', 2000, 2025),
  ('ural', 'Patrol', 2014, 2025),
  ('ural', 'CT', 2014, 2025)

) as v(make_slug, name, year_from, year_to)
join public.bike_makes bm on bm.slug = v.make_slug
on conflict (make_id, name, year_from, year_to) do nothing;
