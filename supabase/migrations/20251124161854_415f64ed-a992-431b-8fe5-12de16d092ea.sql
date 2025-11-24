-- Add missing columns to topics table
ALTER TABLE topics 
  ADD COLUMN IF NOT EXISTS estimated_time integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 1;

ALTER TABLE topics ALTER COLUMN topic_number DROP NOT NULL;

-- Physics Chapter 1: Units and Measurements
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT 
  topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Physical Quantities', 'Understanding fundamental and derived quantities', 60, 'easy', true, false, 1),
    ('SI Units', 'International System of Units and their applications', 45, 'easy', true, false, 2),
    ('Dimensional Analysis', 'Checking equations and deriving relations', 90, 'medium', false, true, 3),
    ('Errors in Measurement', 'Types of errors and their calculations', 75, 'medium', false, true, 4),
    ('Significant Figures', 'Rules and applications in calculations', 60, 'easy', false, true, 5)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Physics' AND c.chapter_number = 1;

-- Physics Chapter 2: Motion in a Straight Line
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Position and Displacement', 'Understanding position vectors and displacement', 45, 'easy', true, false, 1),
    ('Velocity and Speed', 'Average and instantaneous velocity', 60, 'easy', true, false, 2),
    ('Acceleration', 'Rate of change of velocity', 60, 'medium', false, true, 3),
    ('Equations of Motion', 'Kinematic equations for uniform acceleration', 90, 'medium', false, true, 4),
    ('Graphs of Motion', 'Position-time, velocity-time graphs', 75, 'medium', false, true, 5),
    ('Free Fall', 'Motion under gravity', 60, 'medium', false, true, 6)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Physics' AND c.chapter_number = 2;

-- Physics Chapter 3: Motion in a Plane
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Vectors in 2D', 'Resolution and addition of vectors', 75, 'medium', false, true, 1),
    ('Projectile Motion', 'Motion in two dimensions under gravity', 120, 'hard', false, true, 2),
    ('Circular Motion', 'Uniform circular motion and centripetal acceleration', 90, 'medium', false, true, 3),
    ('Relative Velocity', 'Motion in different reference frames', 75, 'medium', false, true, 4)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Physics' AND c.chapter_number = 3;

-- Chemistry Chapter 1
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Matter and Classification', 'Pure substances and mixtures', 45, 'easy', true, false, 1),
    ('Atomic and Molecular Mass', 'Calculation of atomic masses', 60, 'easy', true, false, 2),
    ('Mole Concept', 'Avogadro number and molar mass', 90, 'medium', false, true, 3),
    ('Stoichiometry', 'Limiting reagent and percent yield', 105, 'hard', false, true, 4)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Chemistry' AND c.chapter_number = 1;

-- Chemistry Chapter 2
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Atomic Models', 'Thomson, Rutherford, Bohr models', 90, 'medium', true, false, 1),
    ('Quantum Numbers', 'n, l, m, s quantum numbers', 75, 'medium', false, true, 2),
    ('Electronic Configuration', 'Aufbau principle and Hund rule', 90, 'medium', false, true, 3)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Chemistry' AND c.chapter_number = 2;

-- Mathematics Chapter 1
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Sets and Operations', 'Union, intersection, complement', 60, 'easy', true, false, 1),
    ('Relations', 'Types of relations and properties', 75, 'medium', true, false, 2),
    ('Functions', 'Domain, range, and types of functions', 90, 'medium', false, true, 3),
    ('Inverse Functions', 'Finding and properties', 60, 'medium', false, true, 4)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Mathematics' AND c.chapter_number = 1;

-- Mathematics Chapter 2
INSERT INTO topics (topic_name, description, chapter_id, estimated_time, difficulty_level, is_free, is_premium, order_index, topic_number)
SELECT topic_data.name, topic_data.description, c.id, topic_data.time, topic_data.difficulty, topic_data.is_free, topic_data.is_premium, topic_data.order_idx, topic_data.order_idx
FROM chapters c
CROSS JOIN LATERAL (VALUES
    ('Complex Number Basics', 'Imaginary unit and operations', 60, 'easy', true, false, 1),
    ('Argand Plane', 'Geometric representation', 75, 'medium', false, true, 2),
    ('Modulus and Argument', 'Polar form of complex numbers', 90, 'medium', false, true, 3)
) AS topic_data(name, description, time, difficulty, is_free, is_premium, order_idx)
WHERE c.subject = 'Mathematics' AND c.chapter_number = 2;

-- Add topic dependencies
INSERT INTO topic_dependencies (subject, topic, requires_topics, difficulty_multiplier)
VALUES
  ('Physics', 'Dimensional Analysis', ARRAY['Physical Quantities', 'SI Units'], 1.2),
  ('Physics', 'Acceleration', ARRAY['Velocity and Speed'], 1.3),
  ('Physics', 'Equations of Motion', ARRAY['Acceleration'], 1.4),
  ('Physics', 'Projectile Motion', ARRAY['Vectors in 2D', 'Equations of Motion'], 1.6),
  ('Chemistry', 'Stoichiometry', ARRAY['Mole Concept', 'Atomic and Molecular Mass'], 1.5),
  ('Chemistry', 'Electronic Configuration', ARRAY['Quantum Numbers'], 1.4),
  ('Mathematics', 'Inverse Functions', ARRAY['Functions'], 1.3),
  ('Mathematics', 'Modulus and Argument', ARRAY['Complex Number Basics', 'Argand Plane'], 1.4)
ON CONFLICT DO NOTHING;