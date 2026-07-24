-- Seed reference + demo data. Run after the migrations.
-- Idempotent via ON CONFLICT on natural keys (slug/sku).

-- Brands ---------------------------------------------------------------------
insert into brands (name, slug, logo, part_count) values
  ('BMW','bmw','BMW',13480),('Yamaha','yamaha','YAM',8230),
  ('Honda','honda','HON',7560),('KTM','ktm','KTM',6430),
  ('Suzuki','suzuki','SUZ',4900),('Triumph','triumph','TRI',3420),
  ('Kawasaki','kawasaki','KAW',3130),('Ducati','ducati','DUC',2540)
on conflict (slug) do nothing;

-- Categories -----------------------------------------------------------------
insert into categories (name, slug, part_count) values
  ('Brakes','brakes',2140),('Engine','engine',3320),('Exhaust','exhaust',1580),
  ('Suspension','suspension',1290),('Bodywork','bodywork',2760),
  ('Electronics','electronics',980),('Lighting','lighting',1120),
  ('Tyres','tyres',860),('Controls','controls',1440),('Accessories','accessories',3010)
on conflict (slug) do nothing;

-- Sellers (profile_id linked once real auth users register) -------------------
insert into sellers (name, slug, logo, location, business_type, status, rating, review_count, verified, member_since) values
  ('RideFast Motorcycles','ridefast-motorcycles','RF','Johannesburg','Dealership','active',4.9,412,true,'2021-03-01'),
  ('MotoStrip SA','motostrip-sa','MS','Cape Town','Scrapyard','active',4.9,356,true,'2021-07-14'),
  ('Cycle Salvage','cycle-salvage','CS','Durban','Scrapyard','active',4.9,295,true,'2022-01-09'),
  ('Pro Bike Parts','pro-bike-parts','PB','Pretoria','Workshop','active',4.8,310,true,'2020-11-22'),
  ('Thunder Parts','thunder-parts','TP','Port Elizabeth','Dealership','active',4.8,214,true,'2022-05-30'),
  ('Bike Breakers SA','bike-breakers-sa','BB','Bloemfontein','Scrapyard','active',4.7,189,true,'2022-09-18')
on conflict (slug) do nothing;

-- Products (subset; extend as needed) ----------------------------------------
insert into products (seller_id, slug, sku, title, price_cents, condition, category_slug, brand_name, oem_numbers, stock, status, is_featured, is_new, listed_at)
select s.id, v.slug, v.sku, v.title, v.price_cents, v.condition::product_condition, v.category_slug, v.brand_name, v.oem_numbers, v.stock, v.status::listing_status, v.is_featured, v.is_new, now() - (v.age_days || ' days')::interval
from (values
  ('ridefast-motorcycles','oem-brake-lever-bmw-s1000rr','MP-CTL-0001','OEM Brake Lever',210000,'excellent-used','controls','BMW',array['32-72-8-544-207'],3,'active',true,false,2),
  ('motostrip-sa','akrapovic-slip-on-yamaha-r1','MP-EXH-0002','Akrapovič Slip-On',655000,'good-used','exhaust','Yamaha',array['S-Y10SO18-HAPT'],1,'active',true,false,4),
  ('cycle-salvage','brembo-m50-caliper-set-ducati-panigale-v4','MP-BRK-0003','Brembo M50 Caliper Set',789000,'new','brakes','Ducati',array['61340921A'],2,'active',true,true,1),
  ('pro-bike-parts','ohlins-ttx-gp-rear-shock-bmw-s1000rr','MP-SUS-0004','Öhlins TTX GP Rear Shock',1290000,'like-new','suspension','BMW',array['BM-467'],1,'active',true,false,3),
  ('thunder-parts','ktm-duke-390-headlight','MP-LGT-0005','KTM Duke 390 Headlight',145000,'used','lighting','KTM',array['90114001000'],4,'active',true,false,5),
  ('ridefast-motorcycles','chain-sprocket-kit-honda-cbr600rr','MP-ENG-0007','Chain & Sprocket Kit',185000,'new','engine','Honda',array['06406-MFJ-D00'],8,'active',false,true,7),
  ('motostrip-sa','led-indicator-set-triumph-street-triple','MP-LGT-0008','LED Indicator Set',65000,'new','lighting','Triumph',array['T2700730'],12,'active',false,true,8),
  ('cycle-salvage','fork-seals-yamaha-r6','MP-SUS-0010','Fork Seal Kit',45000,'new','suspension','Yamaha',array['2C0-23145-00'],20,'active',false,true,10)
) as v(seller_slug,slug,sku,title,price_cents,condition,category_slug,brand_name,oem_numbers,stock,status,is_featured,is_new,age_days)
join sellers s on s.slug = v.seller_slug
on conflict (slug) do nothing;

-- One fitment per seeded product ---------------------------------------------
insert into fitments (product_id, brand, model, year_from, year_to)
select p.id, f.brand, f.model, f.year_from, f.year_to
from (values
  ('oem-brake-lever-bmw-s1000rr','BMW','S1000RR',2019,2023),
  ('akrapovic-slip-on-yamaha-r1','Yamaha','R1',2015,2023),
  ('brembo-m50-caliper-set-ducati-panigale-v4','Ducati','Panigale V4',2018,2024),
  ('ohlins-ttx-gp-rear-shock-bmw-s1000rr','BMW','S1000RR',2019,2023),
  ('ktm-duke-390-headlight','KTM','Duke 390',2017,2023),
  ('chain-sprocket-kit-honda-cbr600rr','Honda','CBR 600RR',2007,2019),
  ('led-indicator-set-triumph-street-triple','Triumph','Street Triple',2013,2023),
  ('fork-seals-yamaha-r6','Yamaha','R6',2006,2020)
) as f(slug,brand,model,year_from,year_to)
join products p on p.slug = f.slug
on conflict do nothing;
