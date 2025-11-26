-- Delete existing generic topics
DELETE FROM topics;

-- ===========================================
-- PHYSICS TOPICS (JEE/NEET)
-- ===========================================

-- Units and Measurements
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'SI Units and Dimensions', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Units and Measurements' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Dimensional Analysis', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Units and Measurements' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Significant Figures', 3, 'Easy', 20 FROM chapters WHERE chapter_name = 'Units and Measurements' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Error Analysis', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Units and Measurements' AND subject = 'Physics';

-- Motion in a Straight Line
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Distance and Displacement', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Motion in a Straight Line' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Speed and Velocity', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Motion in a Straight Line' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Equations of Motion', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Motion in a Straight Line' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Graphical Analysis', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Motion in a Straight Line' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Free Fall Motion', 5, 'Medium', 35 FROM chapters WHERE chapter_name = 'Motion in a Straight Line' AND subject = 'Physics';

-- Motion in a Plane
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Vectors and Scalars', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Motion in a Plane' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Vector Addition and Subtraction', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Motion in a Plane' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Projectile Motion', 3, 'Hard', 60 FROM chapters WHERE chapter_name = 'Motion in a Plane' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Circular Motion', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Motion in a Plane' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Relative Motion', 5, 'Hard', 45 FROM chapters WHERE chapter_name = 'Motion in a Plane' AND subject = 'Physics';

-- Laws of Motion
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Newton First Law and Inertia', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Laws of Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Newton Second Law', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Laws of Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Newton Third Law', 3, 'Easy', 30 FROM chapters WHERE chapter_name = 'Laws of Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Free Body Diagrams', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'Laws of Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Friction', 5, 'Hard', 50 FROM chapters WHERE chapter_name = 'Laws of Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Pseudo Forces', 6, 'Hard', 45 FROM chapters WHERE chapter_name = 'Laws of Motion' AND subject = 'Physics';

-- Work, Energy and Power
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Work Done by Force', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Work, Energy and Power' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kinetic Energy', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Work, Energy and Power' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Potential Energy', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Work, Energy and Power' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Conservation of Energy', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'Work, Energy and Power' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Power and Efficiency', 5, 'Medium', 30 FROM chapters WHERE chapter_name = 'Work, Energy and Power' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Collisions', 6, 'Hard', 50 FROM chapters WHERE chapter_name = 'Work, Energy and Power' AND subject = 'Physics';

-- System of Particles and Rotational Motion
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Centre of Mass', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'System of Particles and Rotational Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Moment of Inertia', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'System of Particles and Rotational Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Torque and Angular Momentum', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'System of Particles and Rotational Motion' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Rolling Motion', 4, 'Hard', 60 FROM chapters WHERE chapter_name = 'System of Particles and Rotational Motion' AND subject = 'Physics';

-- Gravitation
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Universal Law of Gravitation', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Gravitation' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Gravitational Field and Potential', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Gravitation' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Escape Velocity', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Gravitation' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Orbital Motion and Satellites', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Gravitation' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kepler Laws', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Gravitation' AND subject = 'Physics';

-- Mechanical Properties of Solids
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Stress and Strain', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Mechanical Properties of Solids' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Elastic Moduli', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Mechanical Properties of Solids' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Poisson Ratio', 3, 'Medium', 30 FROM chapters WHERE chapter_name = 'Mechanical Properties of Solids' AND subject = 'Physics';

-- Mechanical Properties of Fluids
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Pressure in Fluids', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Mechanical Properties of Fluids' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Pascal Law and Applications', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Mechanical Properties of Fluids' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Bernoulli Principle', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Mechanical Properties of Fluids' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Viscosity', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Mechanical Properties of Fluids' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Surface Tension', 5, 'Medium', 45 FROM chapters WHERE chapter_name = 'Mechanical Properties of Fluids' AND subject = 'Physics';

-- Thermal Properties of Matter
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Temperature and Heat', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Thermal Properties of Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Thermal Expansion', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Thermal Properties of Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Calorimetry', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Thermal Properties of Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Heat Transfer', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'Thermal Properties of Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Newton Law of Cooling', 5, 'Medium', 35 FROM chapters WHERE chapter_name = 'Thermal Properties of Matter' AND subject = 'Physics';

-- Thermodynamics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'First Law of Thermodynamics', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Thermodynamic Processes', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Heat Engines', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Second Law and Entropy', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Physics';

-- Kinetic Theory
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ideal Gas Laws', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Kinetic Theory' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kinetic Theory of Gases', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Kinetic Theory' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Degrees of Freedom', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Kinetic Theory' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Mean Free Path', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Kinetic Theory' AND subject = 'Physics';

-- Oscillations
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Simple Harmonic Motion', 1, 'Medium', 50 FROM chapters WHERE chapter_name = 'Oscillations' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Energy in SHM', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Oscillations' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Simple Pendulum', 3, 'Easy', 30 FROM chapters WHERE chapter_name = 'Oscillations' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Spring Mass System', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'Oscillations' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Damped and Forced Oscillations', 5, 'Hard', 50 FROM chapters WHERE chapter_name = 'Oscillations' AND subject = 'Physics';

-- Waves
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Wave Motion Basics', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Transverse and Longitudinal Waves', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Wave Equation', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Superposition and Interference', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Standing Waves', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Doppler Effect', 6, 'Hard', 45 FROM chapters WHERE chapter_name = 'Waves' AND subject = 'Physics';

-- Electric Charges and Fields
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electric Charge and Properties', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Electric Charges and Fields' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Coulomb Law', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Electric Charges and Fields' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electric Field', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Electric Charges and Fields' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electric Field Lines', 4, 'Easy', 25 FROM chapters WHERE chapter_name = 'Electric Charges and Fields' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Gauss Law', 5, 'Hard', 55 FROM chapters WHERE chapter_name = 'Electric Charges and Fields' AND subject = 'Physics';

-- Electrostatic Potential and Capacitance
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electric Potential', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Electrostatic Potential and Capacitance' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Equipotential Surfaces', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Electrostatic Potential and Capacitance' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Capacitors and Capacitance', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Electrostatic Potential and Capacitance' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Combination of Capacitors', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Electrostatic Potential and Capacitance' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Energy Stored in Capacitor', 5, 'Medium', 35 FROM chapters WHERE chapter_name = 'Electrostatic Potential and Capacitance' AND subject = 'Physics';

-- Current Electricity
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electric Current and Drift Velocity', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Current Electricity' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ohm Law and Resistance', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Current Electricity' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Combination of Resistors', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Current Electricity' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kirchhoff Laws', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Current Electricity' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Wheatstone Bridge', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Current Electricity' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Potentiometer', 6, 'Medium', 45 FROM chapters WHERE chapter_name = 'Current Electricity' AND subject = 'Physics';

-- Moving Charges and Magnetism
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Magnetic Force on Moving Charge', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Moving Charges and Magnetism' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Biot-Savart Law', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Moving Charges and Magnetism' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ampere Law', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Moving Charges and Magnetism' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Force Between Parallel Currents', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Moving Charges and Magnetism' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Moving Coil Galvanometer', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Moving Charges and Magnetism' AND subject = 'Physics';

-- Magnetism and Matter
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Bar Magnet and Magnetic Field', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Magnetism and Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Earth Magnetism', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Magnetism and Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Magnetic Properties of Materials', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Magnetism and Matter' AND subject = 'Physics';

-- Electromagnetic Induction
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Faraday Law of Induction', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Electromagnetic Induction' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Lenz Law', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Electromagnetic Induction' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Motional EMF', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Electromagnetic Induction' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Self and Mutual Inductance', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Electromagnetic Induction' AND subject = 'Physics';

-- Alternating Current
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'AC Fundamentals', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Alternating Current' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'AC Circuits (R, L, C)', 2, 'Medium', 50 FROM chapters WHERE chapter_name = 'Alternating Current' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'LCR Circuit and Resonance', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Alternating Current' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Power in AC Circuits', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Alternating Current' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Transformers', 5, 'Easy', 30 FROM chapters WHERE chapter_name = 'Alternating Current' AND subject = 'Physics';

-- Electromagnetic Waves
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Maxwell Equations', 1, 'Hard', 45 FROM chapters WHERE chapter_name = 'Electromagnetic Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electromagnetic Spectrum', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Electromagnetic Waves' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Properties of EM Waves', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Electromagnetic Waves' AND subject = 'Physics';

-- Ray Optics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Reflection of Light', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Ray Optics and Optical Instruments' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Refraction and Snell Law', 2, 'Easy', 35 FROM chapters WHERE chapter_name = 'Ray Optics and Optical Instruments' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Total Internal Reflection', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Ray Optics and Optical Instruments' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Lenses and Mirror Formula', 4, 'Medium', 50 FROM chapters WHERE chapter_name = 'Ray Optics and Optical Instruments' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Prism and Dispersion', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Ray Optics and Optical Instruments' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Optical Instruments', 6, 'Medium', 45 FROM chapters WHERE chapter_name = 'Ray Optics and Optical Instruments' AND subject = 'Physics';

-- Wave Optics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Huygens Principle', 1, 'Medium', 35 FROM chapters WHERE chapter_name = 'Wave Optics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Interference of Light', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Wave Optics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Young Double Slit Experiment', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Wave Optics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Diffraction', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Wave Optics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Polarization', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Wave Optics' AND subject = 'Physics';

-- Dual Nature of Radiation and Matter
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Photoelectric Effect', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Dual Nature of Radiation and Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Einstein Photoelectric Equation', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Dual Nature of Radiation and Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'de Broglie Wavelength', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Dual Nature of Radiation and Matter' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Davisson Germer Experiment', 4, 'Medium', 30 FROM chapters WHERE chapter_name = 'Dual Nature of Radiation and Matter' AND subject = 'Physics';

-- Atoms
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Rutherford Model', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Atoms' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Bohr Model', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Atoms' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Hydrogen Spectrum', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Atoms' AND subject = 'Physics';

-- Nuclei
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nuclear Structure', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Nuclei' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Mass Defect and Binding Energy', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Nuclei' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Radioactivity', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Nuclei' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nuclear Fission and Fusion', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Nuclei' AND subject = 'Physics';

-- Semiconductor Electronics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Energy Bands in Solids', 1, 'Medium', 35 FROM chapters WHERE chapter_name = 'Semiconductor Electronics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'P-N Junction Diode', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Semiconductor Electronics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Diode as Rectifier', 3, 'Easy', 30 FROM chapters WHERE chapter_name = 'Semiconductor Electronics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Transistors', 4, 'Medium', 50 FROM chapters WHERE chapter_name = 'Semiconductor Electronics' AND subject = 'Physics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Logic Gates', 5, 'Easy', 35 FROM chapters WHERE chapter_name = 'Semiconductor Electronics' AND subject = 'Physics';

-- ===========================================
-- CHEMISTRY TOPICS (JEE/NEET)
-- ===========================================

-- Some Basic Concepts
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Mole Concept', 1, 'Easy', 40 FROM chapters WHERE chapter_name = 'Some Basic Concepts of Chemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Stoichiometry', 2, 'Medium', 50 FROM chapters WHERE chapter_name = 'Some Basic Concepts of Chemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Percentage Composition', 3, 'Easy', 30 FROM chapters WHERE chapter_name = 'Some Basic Concepts of Chemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Limiting Reagent', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Some Basic Concepts of Chemistry' AND subject = 'Chemistry';

-- Structure of Atom
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Atomic Models', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Structure of Atom' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Quantum Numbers', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Structure of Atom' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electronic Configuration', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Structure of Atom' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Shapes of Orbitals', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Structure of Atom' AND subject = 'Chemistry';

-- Classification of Elements
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Periodic Table Development', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Classification of Elements and Periodicity' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Periodic Trends', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Classification of Elements and Periodicity' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ionization Energy', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Classification of Elements and Periodicity' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electronegativity', 4, 'Easy', 30 FROM chapters WHERE chapter_name = 'Classification of Elements and Periodicity' AND subject = 'Chemistry';

-- Chemical Bonding
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ionic Bond', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Chemical Bonding and Molecular Structure' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Covalent Bond', 2, 'Easy', 35 FROM chapters WHERE chapter_name = 'Chemical Bonding and Molecular Structure' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'VSEPR Theory', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Chemical Bonding and Molecular Structure' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Hybridization', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Chemical Bonding and Molecular Structure' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Molecular Orbital Theory', 5, 'Hard', 55 FROM chapters WHERE chapter_name = 'Chemical Bonding and Molecular Structure' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Hydrogen Bonding', 6, 'Easy', 25 FROM chapters WHERE chapter_name = 'Chemical Bonding and Molecular Structure' AND subject = 'Chemistry';

-- States of Matter
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Gas Laws', 1, 'Easy', 35 FROM chapters WHERE chapter_name = 'States of Matter' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ideal Gas Equation', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'States of Matter' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Real Gases', 3, 'Hard', 45 FROM chapters WHERE chapter_name = 'States of Matter' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Liquefaction of Gases', 4, 'Medium', 30 FROM chapters WHERE chapter_name = 'States of Matter' AND subject = 'Chemistry';

-- Thermodynamics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'System and Surroundings', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'First Law', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Enthalpy', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Hess Law', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Entropy and Gibbs Energy', 5, 'Hard', 50 FROM chapters WHERE chapter_name = 'Thermodynamics' AND subject = 'Chemistry';

-- Equilibrium
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Chemical Equilibrium', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Equilibrium' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Le Chatelier Principle', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Equilibrium' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ionic Equilibrium', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Equilibrium' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'pH and Buffer Solutions', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Equilibrium' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Solubility Product', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Equilibrium' AND subject = 'Chemistry';

-- Redox Reactions
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Oxidation and Reduction', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Redox Reactions' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Oxidation Number', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Redox Reactions' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Balancing Redox Equations', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Redox Reactions' AND subject = 'Chemistry';

-- Hydrogen
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Position and Properties', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Hydrogen' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Isotopes and Compounds', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Hydrogen' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Water and Heavy Water', 3, 'Easy', 25 FROM chapters WHERE chapter_name = 'Hydrogen' AND subject = 'Chemistry';

-- s-Block Elements
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Alkali Metals', 1, 'Easy', 35 FROM chapters WHERE chapter_name = 's-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Alkaline Earth Metals', 2, 'Easy', 35 FROM chapters WHERE chapter_name = 's-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Important Compounds', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 's-Block Elements' AND subject = 'Chemistry';

-- p-Block Elements
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Group 13 Elements', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'p-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Group 14 Elements', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'p-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Group 15 Elements', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'p-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Group 16 Elements', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'p-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Group 17 Halogens', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'p-Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Group 18 Noble Gases', 6, 'Easy', 30 FROM chapters WHERE chapter_name = 'p-Block Elements' AND subject = 'Chemistry';

-- Organic Chemistry Basics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'IUPAC Nomenclature', 1, 'Medium', 50 FROM chapters WHERE chapter_name = 'Organic Chemistry: Some Basic Principles' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Isomerism', 2, 'Hard', 55 FROM chapters WHERE chapter_name = 'Organic Chemistry: Some Basic Principles' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Reaction Mechanisms', 3, 'Hard', 60 FROM chapters WHERE chapter_name = 'Organic Chemistry: Some Basic Principles' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electronic Effects', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Organic Chemistry: Some Basic Principles' AND subject = 'Chemistry';

-- Hydrocarbons
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Alkanes', 1, 'Easy', 35 FROM chapters WHERE chapter_name = 'Hydrocarbons' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Alkenes', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Hydrocarbons' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Alkynes', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Hydrocarbons' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Aromatic Hydrocarbons', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Hydrocarbons' AND subject = 'Chemistry';

-- Solutions
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Concentration Units', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Solutions' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Raoult Law', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Solutions' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Colligative Properties', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Solutions' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Abnormal Molecular Mass', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Solutions' AND subject = 'Chemistry';

-- Electrochemistry
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electrochemical Cells', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Electrochemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nernst Equation', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Electrochemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Conductance', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Electrochemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electrolysis', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Electrochemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Corrosion', 5, 'Easy', 25 FROM chapters WHERE chapter_name = 'Electrochemistry' AND subject = 'Chemistry';

-- Chemical Kinetics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Rate of Reaction', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Chemical Kinetics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Order and Molecularity', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Chemical Kinetics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Integrated Rate Laws', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Chemical Kinetics' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Arrhenius Equation', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Chemical Kinetics' AND subject = 'Chemistry';

-- Surface Chemistry
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Adsorption', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Surface Chemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Catalysis', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Surface Chemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Colloids', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Surface Chemistry' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Emulsions', 4, 'Easy', 25 FROM chapters WHERE chapter_name = 'Surface Chemistry' AND subject = 'Chemistry';

-- d and f Block Elements
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Transition Elements', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'd and f Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Properties of d-Block', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'd and f Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Lanthanoids and Actinoids', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'd and f Block Elements' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Important Compounds', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'd and f Block Elements' AND subject = 'Chemistry';

-- Coordination Compounds
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Werner Theory', 1, 'Medium', 35 FROM chapters WHERE chapter_name = 'Coordination Compounds' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'IUPAC Nomenclature', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Coordination Compounds' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Isomerism', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Coordination Compounds' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Bonding Theories (VBT, CFT)', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Coordination Compounds' AND subject = 'Chemistry';

-- Haloalkanes and Haloarenes
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nomenclature and Classification', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Haloalkanes and Haloarenes' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'SN1 and SN2 Reactions', 2, 'Hard', 55 FROM chapters WHERE chapter_name = 'Haloalkanes and Haloarenes' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Elimination Reactions', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Haloalkanes and Haloarenes' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Aryl Halides', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Haloalkanes and Haloarenes' AND subject = 'Chemistry';

-- Alcohols, Phenols and Ethers
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Alcohols', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Alcohols, Phenols and Ethers' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Phenols', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Alcohols, Phenols and Ethers' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ethers', 3, 'Easy', 35 FROM chapters WHERE chapter_name = 'Alcohols, Phenols and Ethers' AND subject = 'Chemistry';

-- Aldehydes, Ketones and Carboxylic Acids
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Aldehydes and Ketones', 1, 'Medium', 50 FROM chapters WHERE chapter_name = 'Aldehydes, Ketones and Carboxylic Acids' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nucleophilic Addition', 2, 'Hard', 55 FROM chapters WHERE chapter_name = 'Aldehydes, Ketones and Carboxylic Acids' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Carboxylic Acids', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Aldehydes, Ketones and Carboxylic Acids' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Acid Derivatives', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Aldehydes, Ketones and Carboxylic Acids' AND subject = 'Chemistry';

-- Amines
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Classification and Nomenclature', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Amines' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Basicity of Amines', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Amines' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Chemical Reactions', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Amines' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Diazonium Salts', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Amines' AND subject = 'Chemistry';

-- Biomolecules
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Carbohydrates', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Proteins and Amino Acids', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nucleic Acids', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Vitamins and Enzymes', 4, 'Easy', 35 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Chemistry';

-- Polymers
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Classification of Polymers', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Polymers' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Addition Polymerization', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Polymers' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Condensation Polymerization', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Polymers' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Important Polymers', 4, 'Easy', 30 FROM chapters WHERE chapter_name = 'Polymers' AND subject = 'Chemistry';

-- Chemistry in Everyday Life
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Drugs and Medicines', 1, 'Easy', 35 FROM chapters WHERE chapter_name = 'Chemistry in Everyday Life' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Food Additives', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Chemistry in Everyday Life' AND subject = 'Chemistry';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Cleansing Agents', 3, 'Easy', 25 FROM chapters WHERE chapter_name = 'Chemistry in Everyday Life' AND subject = 'Chemistry';

-- ===========================================
-- MATHEMATICS TOPICS (JEE)
-- ===========================================

-- Sets
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Types of Sets', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Sets' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Set Operations', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Sets' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Venn Diagrams', 3, 'Easy', 25 FROM chapters WHERE chapter_name = 'Sets' AND subject = 'Mathematics';

-- Relations and Functions
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Types of Relations', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Relations and Functions' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Types of Functions', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Relations and Functions' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Composition and Inverse', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Relations and Functions' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Binary Operations', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Relations and Functions' AND subject = 'Mathematics';

-- Trigonometric Functions
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Trigonometric Ratios', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Trigonometric Functions' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Trigonometric Identities', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Trigonometric Functions' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Trigonometric Equations', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Trigonometric Functions' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Properties of Triangles', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Trigonometric Functions' AND subject = 'Mathematics';

-- Complex Numbers
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Complex Number Algebra', 1, 'Easy', 35 FROM chapters WHERE chapter_name = 'Complex Numbers and Quadratic Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Polar Form', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Complex Numbers and Quadratic Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'De Moivre Theorem', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Complex Numbers and Quadratic Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Quadratic Equations', 4, 'Medium', 50 FROM chapters WHERE chapter_name = 'Complex Numbers and Quadratic Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nature of Roots', 5, 'Hard', 45 FROM chapters WHERE chapter_name = 'Complex Numbers and Quadratic Equations' AND subject = 'Mathematics';

-- Linear Inequalities
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Linear Inequalities', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Linear Inequalities' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'System of Inequalities', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Linear Inequalities' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Graphical Solutions', 3, 'Easy', 30 FROM chapters WHERE chapter_name = 'Linear Inequalities' AND subject = 'Mathematics';

-- Permutations and Combinations
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Fundamental Counting Principle', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Permutations and Combinations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Permutations', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Permutations and Combinations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Combinations', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Permutations and Combinations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Applications', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Permutations and Combinations' AND subject = 'Mathematics';

-- Binomial Theorem
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Binomial Expansion', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Binomial Theorem' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'General Term', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Binomial Theorem' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Middle Term', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Binomial Theorem' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Binomial Coefficients', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Binomial Theorem' AND subject = 'Mathematics';

-- Sequences and Series
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Arithmetic Progression', 1, 'Easy', 35 FROM chapters WHERE chapter_name = 'Sequences and Series' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Geometric Progression', 2, 'Easy', 35 FROM chapters WHERE chapter_name = 'Sequences and Series' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Harmonic Progression', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Sequences and Series' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Sum of Special Series', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Sequences and Series' AND subject = 'Mathematics';

-- Straight Lines
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Equation of Line', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Straight Lines' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Slope and Intercepts', 2, 'Easy', 25 FROM chapters WHERE chapter_name = 'Straight Lines' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Distance and Angle', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Straight Lines' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Family of Lines', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Straight Lines' AND subject = 'Mathematics';

-- Conic Sections
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Circle', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Conic Sections' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Parabola', 2, 'Hard', 55 FROM chapters WHERE chapter_name = 'Conic Sections' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ellipse', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Conic Sections' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Hyperbola', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Conic Sections' AND subject = 'Mathematics';

-- 3D Geometry
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Direction Cosines', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Three Dimensional Geometry' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Equation of Line in 3D', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Three Dimensional Geometry' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Equation of Plane', 3, 'Medium', 50 FROM chapters WHERE chapter_name = 'Three Dimensional Geometry' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Distance and Angle', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Three Dimensional Geometry' AND subject = 'Mathematics';

-- Limits and Derivatives
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Limits', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Limits and Derivatives' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Derivatives from First Principles', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Limits and Derivatives' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Differentiation Rules', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Limits and Derivatives' AND subject = 'Mathematics';

-- Continuity and Differentiability
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Continuity', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Continuity and Differentiability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Differentiability', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Continuity and Differentiability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Chain Rule', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Continuity and Differentiability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Implicit Differentiation', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Continuity and Differentiability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Higher Order Derivatives', 5, 'Hard', 45 FROM chapters WHERE chapter_name = 'Continuity and Differentiability' AND subject = 'Mathematics';

-- Applications of Derivatives
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Rate of Change', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Applications of Derivatives' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Tangents and Normals', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Applications of Derivatives' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Maxima and Minima', 3, 'Hard', 60 FROM chapters WHERE chapter_name = 'Applications of Derivatives' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Monotonicity', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'Applications of Derivatives' AND subject = 'Mathematics';

-- Integrals
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Indefinite Integrals', 1, 'Medium', 50 FROM chapters WHERE chapter_name = 'Integrals' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Integration Methods', 2, 'Hard', 60 FROM chapters WHERE chapter_name = 'Integrals' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Definite Integrals', 3, 'Medium', 50 FROM chapters WHERE chapter_name = 'Integrals' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Properties of Definite Integrals', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Integrals' AND subject = 'Mathematics';

-- Applications of Integrals
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Area Under Curves', 1, 'Medium', 50 FROM chapters WHERE chapter_name = 'Applications of Integrals' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Area Between Curves', 2, 'Hard', 55 FROM chapters WHERE chapter_name = 'Applications of Integrals' AND subject = 'Mathematics';

-- Differential Equations
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Order and Degree', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Differential Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Variable Separable', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Differential Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Homogeneous DE', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Differential Equations' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Linear DE', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Differential Equations' AND subject = 'Mathematics';

-- Vector Algebra
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Vector Operations', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Vector Algebra' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Scalar Product', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Vector Algebra' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Vector Product', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Vector Algebra' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Scalar Triple Product', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Vector Algebra' AND subject = 'Mathematics';

-- Probability
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Basic Probability', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Probability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Conditional Probability', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Probability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Bayes Theorem', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Probability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Random Variables', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Probability' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Binomial Distribution', 5, 'Medium', 45 FROM chapters WHERE chapter_name = 'Probability' AND subject = 'Mathematics';

-- Matrices
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Types of Matrices', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Matrices' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Matrix Operations', 2, 'Easy', 35 FROM chapters WHERE chapter_name = 'Matrices' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Transpose and Inverse', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Matrices' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Elementary Operations', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Matrices' AND subject = 'Mathematics';

-- Determinants
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Properties of Determinants', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Determinants' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Evaluation Methods', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Determinants' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Applications (Area, Equations)', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Determinants' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Cramer Rule', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Determinants' AND subject = 'Mathematics';

-- Mathematical Reasoning
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Statements and Connectives', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Mathematical Reasoning' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Logical Operations', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'Mathematical Reasoning' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Validity of Arguments', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Mathematical Reasoning' AND subject = 'Mathematics';

-- Statistics
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Measures of Central Tendency', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Statistics' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Measures of Dispersion', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Statistics' AND subject = 'Mathematics';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Standard Deviation', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Statistics' AND subject = 'Mathematics';

-- ===========================================
-- BIOLOGY TOPICS (NEET)
-- ===========================================

-- The Living World
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Characteristics of Living Organisms', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'The Living World' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Taxonomic Categories', 2, 'Easy', 30 FROM chapters WHERE chapter_name = 'The Living World' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nomenclature', 3, 'Easy', 25 FROM chapters WHERE chapter_name = 'The Living World' AND subject = 'Biology';

-- Biological Classification
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kingdom Monera', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biological Classification' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kingdom Protista', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Biological Classification' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Kingdom Fungi', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biological Classification' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Viruses and Viroids', 4, 'Easy', 30 FROM chapters WHERE chapter_name = 'Biological Classification' AND subject = 'Biology';

-- Plant Kingdom
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Algae', 1, 'Medium', 35 FROM chapters WHERE chapter_name = 'Plant Kingdom' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Bryophytes', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Plant Kingdom' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Pteridophytes', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Plant Kingdom' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Gymnosperms and Angiosperms', 4, 'Medium', 45 FROM chapters WHERE chapter_name = 'Plant Kingdom' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Plant Life Cycles', 5, 'Hard', 50 FROM chapters WHERE chapter_name = 'Plant Kingdom' AND subject = 'Biology';

-- Animal Kingdom
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Basis of Classification', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Animal Kingdom' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Non-Chordates', 2, 'Hard', 60 FROM chapters WHERE chapter_name = 'Animal Kingdom' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Chordates', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Animal Kingdom' AND subject = 'Biology';

-- Cell: The Unit of Life
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Cell Theory', 1, 'Easy', 25 FROM chapters WHERE chapter_name = 'Cell: The Unit of Life' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Prokaryotic Cell', 2, 'Medium', 35 FROM chapters WHERE chapter_name = 'Cell: The Unit of Life' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Eukaryotic Cell', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Cell: The Unit of Life' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Cell Organelles', 4, 'Medium', 50 FROM chapters WHERE chapter_name = 'Cell: The Unit of Life' AND subject = 'Biology';

-- Biomolecules
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Carbohydrates', 1, 'Medium', 35 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Proteins', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Lipids', 3, 'Medium', 30 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nucleic Acids', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Enzymes', 5, 'Hard', 50 FROM chapters WHERE chapter_name = 'Biomolecules' AND subject = 'Biology';

-- Cell Cycle and Cell Division
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Cell Cycle', 1, 'Medium', 35 FROM chapters WHERE chapter_name = 'Cell Cycle and Cell Division' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Mitosis', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Cell Cycle and Cell Division' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Meiosis', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Cell Cycle and Cell Division' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Significance of Meiosis', 4, 'Medium', 30 FROM chapters WHERE chapter_name = 'Cell Cycle and Cell Division' AND subject = 'Biology';

-- Photosynthesis
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Light Reactions', 1, 'Hard', 50 FROM chapters WHERE chapter_name = 'Photosynthesis in Higher Plants' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Dark Reactions (Calvin Cycle)', 2, 'Hard', 55 FROM chapters WHERE chapter_name = 'Photosynthesis in Higher Plants' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'C3 and C4 Pathways', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Photosynthesis in Higher Plants' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Factors Affecting Photosynthesis', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Photosynthesis in Higher Plants' AND subject = 'Biology';

-- Respiration in Plants
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Glycolysis', 1, 'Hard', 45 FROM chapters WHERE chapter_name = 'Respiration in Plants' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Krebs Cycle', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Respiration in Plants' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Electron Transport Chain', 3, 'Hard', 55 FROM chapters WHERE chapter_name = 'Respiration in Plants' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Fermentation', 4, 'Medium', 30 FROM chapters WHERE chapter_name = 'Respiration in Plants' AND subject = 'Biology';

-- Human Reproduction
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Male Reproductive System', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Human Reproduction' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Female Reproductive System', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Human Reproduction' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Gametogenesis', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Human Reproduction' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Fertilization and Implantation', 4, 'Medium', 35 FROM chapters WHERE chapter_name = 'Human Reproduction' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Pregnancy and Development', 5, 'Medium', 40 FROM chapters WHERE chapter_name = 'Human Reproduction' AND subject = 'Biology';

-- Principles of Inheritance
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Mendel Laws', 1, 'Medium', 45 FROM chapters WHERE chapter_name = 'Principles of Inheritance and Variation' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Deviations from Mendelism', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Principles of Inheritance and Variation' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Sex Determination', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Principles of Inheritance and Variation' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Genetic Disorders', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Principles of Inheritance and Variation' AND subject = 'Biology';

-- Molecular Basis of Inheritance
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'DNA Structure', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Molecular Basis of Inheritance' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'DNA Replication', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Molecular Basis of Inheritance' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Transcription', 3, 'Hard', 50 FROM chapters WHERE chapter_name = 'Molecular Basis of Inheritance' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Translation', 4, 'Hard', 55 FROM chapters WHERE chapter_name = 'Molecular Basis of Inheritance' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Gene Regulation', 5, 'Hard', 50 FROM chapters WHERE chapter_name = 'Molecular Basis of Inheritance' AND subject = 'Biology';

-- Evolution
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Origin of Life', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Evolution' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Evidence of Evolution', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Evolution' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Theories of Evolution', 3, 'Medium', 45 FROM chapters WHERE chapter_name = 'Evolution' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Hardy-Weinberg Principle', 4, 'Hard', 50 FROM chapters WHERE chapter_name = 'Evolution' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Human Evolution', 5, 'Medium', 35 FROM chapters WHERE chapter_name = 'Evolution' AND subject = 'Biology';

-- Human Health and Disease
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Common Diseases', 1, 'Medium', 40 FROM chapters WHERE chapter_name = 'Human Health and Disease' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Immunity', 2, 'Hard', 50 FROM chapters WHERE chapter_name = 'Human Health and Disease' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'AIDS and Cancer', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Human Health and Disease' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Drugs and Alcohol Abuse', 4, 'Easy', 30 FROM chapters WHERE chapter_name = 'Human Health and Disease' AND subject = 'Biology';

-- Biotechnology Principles
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'rDNA Technology', 1, 'Hard', 55 FROM chapters WHERE chapter_name = 'Biotechnology: Principles and Processes' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Tools of rDNA Technology', 2, 'Medium', 45 FROM chapters WHERE chapter_name = 'Biotechnology: Principles and Processes' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'PCR and Gel Electrophoresis', 3, 'Medium', 40 FROM chapters WHERE chapter_name = 'Biotechnology: Principles and Processes' AND subject = 'Biology';

-- Ecosystem
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Structure and Function', 1, 'Easy', 30 FROM chapters WHERE chapter_name = 'Ecosystem' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Energy Flow', 2, 'Medium', 40 FROM chapters WHERE chapter_name = 'Ecosystem' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ecological Pyramids', 3, 'Medium', 35 FROM chapters WHERE chapter_name = 'Ecosystem' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Nutrient Cycling', 4, 'Medium', 40 FROM chapters WHERE chapter_name = 'Ecosystem' AND subject = 'Biology';
INSERT INTO topics (chapter_id, topic_name, topic_number, difficulty_level, estimated_time)
SELECT id, 'Ecological Succession', 5, 'Medium', 35 FROM chapters WHERE chapter_name = 'Ecosystem' AND subject = 'Biology';