-- Seed Data for Major Global Stock Exchanges (ISO 10383 MIC codes)

BEGIN;

-- Americas
INSERT INTO stock_exchanges (mic_code, name, country, country_code, region, is_priority) VALUES
('XNYS', 'New York Stock Exchange', 'United States', 'USA', 'Americas', TRUE),
('XNAS', 'NASDAQ', 'United States', 'USA', 'Americas', TRUE),
('XTSE', 'Toronto Stock Exchange', 'Canada', 'CAN', 'Americas', FALSE),
('XMEX', 'Bolsa Mexicana de Valores', 'Mexico', 'MEX', 'Americas', FALSE)
ON CONFLICT (mic_code) DO NOTHING;

-- Europe
INSERT INTO stock_exchanges (mic_code, name, country, country_code, region, is_priority) VALUES
('XLON', 'London Stock Exchange', 'United Kingdom', 'GBR', 'Europe', FALSE),
('XPAR', 'Euronext Paris', 'France', 'FRA', 'Europe', FALSE),
('XETR', 'Deutsche Börse Xetra', 'Germany', 'DEU', 'Europe', FALSE),
('XAMS', 'Euronext Amsterdam', 'Netherlands', 'NLD', 'Europe', FALSE),
('XSWX', 'SIX Swiss Exchange', 'Switzerland', 'CHE', 'Europe', FALSE),
('XMAD', 'Bolsa de Madrid', 'Spain', 'ESP', 'Europe', FALSE),
('XMIL', 'Borsa Italiana', 'Italy', 'ITA', 'Europe', FALSE),
('XOSL', 'Oslo Stock Exchange', 'Norway', 'NOR', 'Europe', FALSE),
('XSTO', 'Nasdaq Stockholm', 'Sweden', 'SWE', 'Europe', FALSE),
('XHEL', 'Nasdaq Helsinki', 'Finland', 'FIN', 'Europe', FALSE),
('XWAR', 'Warsaw Stock Exchange', 'Poland', 'POL', 'Europe', FALSE)
ON CONFLICT (mic_code) DO NOTHING;

-- Asia-Pacific
INSERT INTO stock_exchanges (mic_code, name, country, country_code, region, is_priority) VALUES
('XTKS', 'Tokyo Stock Exchange', 'Japan', 'JPN', 'Asia-Pacific', FALSE),
('XHKG', 'Hong Kong Stock Exchange', 'Hong Kong', 'HKG', 'Asia-Pacific', FALSE),
('XSHG', 'Shanghai Stock Exchange', 'China', 'CHN', 'Asia-Pacific', FALSE),
('XSHE', 'Shenzhen Stock Exchange', 'China', 'CHN', 'Asia-Pacific', FALSE),
('XKRX', 'Korea Exchange', 'South Korea', 'KOR', 'Asia-Pacific', FALSE),
('XBOM', 'Bombay Stock Exchange', 'India', 'IND', 'Asia-Pacific', FALSE),
('XNSE', 'National Stock Exchange of India', 'India', 'IND', 'Asia-Pacific', FALSE),
('XASX', 'Australian Securities Exchange', 'Australia', 'AUS', 'Asia-Pacific', FALSE),
('XSES', 'Singapore Exchange', 'Singapore', 'SGP', 'Asia-Pacific', FALSE),
('XIDX', 'Indonesia Stock Exchange', 'Indonesia', 'IDN', 'Asia-Pacific', FALSE),
('XBKK', 'Stock Exchange of Thailand', 'Thailand', 'THA', 'Asia-Pacific', FALSE),
('XKLS', 'Bursa Malaysia', 'Malaysia', 'MYS', 'Asia-Pacific', FALSE)
ON CONFLICT (mic_code) DO NOTHING;

-- Middle East & Africa
INSERT INTO stock_exchanges (mic_code, name, country, country_code, region, is_priority) VALUES
('XTAE', 'Tel Aviv Stock Exchange', 'Israel', 'ISR', 'Middle East & Africa', FALSE),
('XDFM', 'Dubai Financial Market', 'United Arab Emirates', 'ARE', 'Middle East & Africa', FALSE),
('XSAU', 'Saudi Stock Exchange (Tadawul)', 'Saudi Arabia', 'SAU', 'Middle East & Africa', FALSE),
('XJSE', 'Johannesburg Stock Exchange', 'South Africa', 'ZAF', 'Middle East & Africa', FALSE)
ON CONFLICT (mic_code) DO NOTHING;

COMMIT;
