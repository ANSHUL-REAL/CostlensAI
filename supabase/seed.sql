-- =============================================================
-- CostLens AI — Demo Seed Data
-- Derived from IBM HR Analytics dataset (1,470 rows).
-- Hourly rates scaled to INR using Indian IT market benchmarks:
--   Level 1 (0-2 yr) → ₹280-399/hr  (B1)
--   Level 2 (2-5 yr) → ₹400-649/hr  (B2)
--   Level 3 (5-10 yr) → ₹650-999/hr  (B3)
--   Level 4 (10-15 yr) → ₹1000-1499/hr (B4)
-- Run AFTER schema.sql.
-- =============================================================

-- ── Employees (19 across 5 departments) ────────────────────
insert into public.employees (name, email, role, department, hourly_rate, cost_band, status) values
  -- Engineering
  ('Anshul Nautiyal', 'anshul@acme.com', 'Frontend Developer',       'Engineering', 500,  'B2', 'active'),
  ('Rahul Verma',     'rahul@acme.com',  'Backend Developer',        'Engineering', 650,  'B3', 'active'),
  ('Vikram Singh',    'vikram@acme.com', 'Senior Backend Developer',  'Engineering', 850,  'B3', 'active'),
  ('Kavya Patel',     'kavya@acme.com',  'Junior Frontend Developer', 'Engineering', 380,  'B1', 'active'),
  ('Aditya Kumar',    'aditya@acme.com', 'DevOps Engineer',           'Engineering', 920,  'B3', 'active'),
  ('Rohan Malhotra',  'rohan@acme.com',  'Full Stack Developer',      'Engineering', 580,  'B2', 'active'),
  -- Design
  ('Sourab Reddy',    'sourab@acme.com', 'UI/UX Designer',            'Design',      450,  'B2', 'active'),
  ('Divya Kapoor',    'divya@acme.com',  'Senior Designer',           'Design',      720,  'B3', 'active'),
  ('Tanya Mehta',     'tanya@acme.com',  'Product Designer',          'Design',      480,  'B2', 'active'),
  -- Product
  ('Priya Sharma',    'priya@acme.com',  'Project Manager',           'Product',     900,  'B3', 'active'),
  ('Kiran Desai',     'kiran@acme.com',  'Product Manager',           'Product',     950,  'B3', 'active'),
  ('Saurav Bhat',     'saurav@acme.com', 'Product Analyst',           'Product',     620,  'B2', 'active'),
  -- HR
  ('Meera Iyer',      'meera@acme.com',  'HR Lead',                   'HR',          550,  'B2', 'active'),
  ('Nisha Joshi',     'nisha@acme.com',  'HR Manager',                'HR',          600,  'B2', 'active'),
  ('Pooja Pandey',    'pooja@acme.com',  'Recruiter',                 'HR',          380,  'B1', 'active'),
  -- Sales
  ('Arjun Rao',       'arjun@acme.com',  'Sales Manager',             'Sales',       700,  'B3', 'active'),
  ('Manish Chopra',   'manish@acme.com', 'Senior Sales Executive',    'Sales',       750,  'B3', 'active'),
  ('Riya Nair',       'riya@acme.com',   'Business Dev Manager',      'Sales',       520,  'B2', 'active'),
  ('Deepak Saxena',   'deepak@acme.com', 'Sales Director',            'Sales',       1200, 'B4', 'active')
on conflict (email) do nothing;

-- ── Projects ────────────────────────────────────────────────
insert into public.projects (name, description, budget, priority, keywords, status) values
  ('CareCircle',       'Donor & patient matching platform',   15000, 'High',   array['donor','patient','blood','dashboard','thalassemia','api','carecircle'], 'active'),
  ('Sales CRM',        'Internal CRM & pipeline tooling',     10000, 'Medium', array['crm','pipeline','client','demo','sales'],                               'active'),
  ('Internal HR',      'Hiring & people operations',           8000, 'Low',    array['hiring','policy','hr','onboarding','interview','performance','recruit'], 'active'),
  ('Product Research', 'Discovery & roadmap research',        12000, 'Medium', array['research','roadmap','brainstorm','discovery','sprint'],                 'active'),
  ('Unclassified',     'Meetings not yet attributed',              0, 'None',   array[]::text[],                                                              'active')
on conflict do nothing;
