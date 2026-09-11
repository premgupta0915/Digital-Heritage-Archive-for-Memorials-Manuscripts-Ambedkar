-- Fixes garbled em-dash/apostrophe characters caused by an encoding
-- mismatch when the original seed file was run through psql on Windows.

UPDATE archive_items
SET title = 'Draft Constitution of India - Fundamental Rights Chapter'
WHERE title LIKE 'Draft Constitution of India%Fundamental Rights Chapter';

UPDATE historical_places
SET description = 'The memorial and cremation site of Dr. B.R. Ambedkar in Dadar, Mumbai - a major pilgrimage site visited by millions every year on his death anniversary.'
WHERE name = 'Chaityabhoomi';
