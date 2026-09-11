-- Sample data for demo purposes — a handful of real, well-known
-- Ambedkar-related items so the archive isn't empty during judging.

INSERT INTO archive_items (title, description, item_type, script, language, source_volume, source_page_start, year_created, author_or_speaker, is_public)
VALUES
(
    'Annihilation of Caste',
    'A undelivered speech written in 1936 for the Jat-Pat Todak Mandal, later self-published, that remains one of the most powerful critiques of the Hindu caste system and its scriptural justification.',
    'speech', 'devanagari_modern', 'en',
    'Dr. Babasaheb Ambedkar: Writings and Speeches, Vol. 1', 23, 1936,
    'Dr. B.R. Ambedkar', TRUE
),
(
    'Draft Constitution of India — Fundamental Rights Chapter',
    'Handwritten and typed drafting notes from the Constituent Assembly debates outlining the Fundamental Rights chapter, chaired by Dr. Ambedkar as head of the Drafting Committee.',
    'constitutional_debate', 'devanagari_archaic', 'en',
    'Dr. Babasaheb Ambedkar: Writings and Speeches, Vol. 13', 101, 1948,
    'Dr. B.R. Ambedkar', TRUE
),
(
    'Waiting for a Visa',
    'An autobiographical manuscript narrating Ambedkar''s personal experiences of caste-based discrimination, including during his education abroad.',
    'manuscript', 'devanagari_modern', 'en',
    'Dr. Babasaheb Ambedkar: Writings and Speeches, Vol. 12', 661, 1935,
    'Dr. B.R. Ambedkar', TRUE
),
(
    'Ambedkar''s Address at the Conversion Ceremony, Nagpur',
    'Speech delivered on 14 October 1956 during the mass conversion to Buddhism at Deekshabhoomi, Nagpur.',
    'speech', 'devanagari_modern', 'en',
    'Dr. Babasaheb Ambedkar: Writings and Speeches, Vol. 17', 5, 1956,
    'Dr. B.R. Ambedkar', TRUE
);

INSERT INTO historical_places (name, description, place_type, city, state, country, geo_point)
VALUES
(
    'Chaityabhoomi',
    'The memorial and cremation site of Dr. B.R. Ambedkar in Dadar, Mumbai — a major pilgrimage site visited by millions every year on his death anniversary.',
    'memorial', 'Mumbai', 'Maharashtra', 'India',
    ST_GeogFromText('SRID=4326;POINT(72.8410 19.0402)')
),
(
    'Deekshabhoomi',
    'The site in Nagpur where Dr. Ambedkar and approximately 500,000 followers converted to Buddhism on 14 October 1956.',
    'memorial', 'Nagpur', 'Maharashtra', 'India',
    ST_GeogFromText('SRID=4326;POINT(79.0714 21.1350)')
),
(
    'Dr. Ambedkar National Memorial, 26 Alipur Road',
    'The house in Delhi where Dr. Ambedkar spent his last days, now converted into a national memorial and museum.',
    'memorial', 'New Delhi', 'Delhi', 'India',
    ST_GeogFromText('SRID=4326;POINT(77.2219 28.6805)')
);
