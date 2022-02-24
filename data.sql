DROP DATABASE IF EXISTS squareonedb;

CREATE DATABASE squareonedb;

\c squareonedb;

CREATE TYPE authRole AS ENUM ('user', 'manager', 'admin');

CREATE TABLE employees 
(
  id SERIAL PRIMARY KEY,
  username VARCHAR(25),
  password TEXT NOT NULL,
  first_inital TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role authRole
);


CREATE TABLE projects 
(
  id SERIAL PRIMARY KEY,
  insured_name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at DATE NOT NULL,
  active BOOLEAN
);


CREATE TABLE employees_to_projects 
(
  employee_id INTEGER
    REFERENCES employees ON DELETE CASCADE,
  proj_id INTEGER 
    REFERENCES projects ON DELETE CASCADE
);


CREATE TABLE chamber 
(
  id SERIAL PRIMARY KEY,
  chamber_name  TEXT NOT NULL,
  project_id INTEGER 
    REFERENCES projects ON DELETE CASCADE
  );


CREATE TABLE dehumidifier 
(
  id SERIAL PRIMARY KEY,
  dehu_number INTEGER NOT NULL,
  chamber_id INTEGER NOT NULL REFERENCES chamber ON DELETE CASCADE,
  location TEXT NOT NULL
);

CREATE TABLE affected_material 
(
  id SERIAL PRIMARY KEY,
  chamber_id INTEGER NOT NULL REFERENCES chamber ON DELETE CASCADE,
  material_name TEXT NOT NULL
);


CREATE TABLE reading 
(
  id SERIAL PRIMARY KEY,
  chamber_id INTEGER REFERENCES chamber ON DELETE CASCADE,
  dehu_id INTEGER REFERENCES dehumidifier ON DELETE CASCADE,
  material_id INTEGER REFERENCES affected_material ON DELETE CASCADE,
  temp INTEGER,
  RH INTEGER,
  moisture_content INTEGER,
  reading_date DATE NOT NULL,
  day_number INTEGER NOT NULL
);



-- sample data
-- seperate into own file BEFORE deployment

INSERT INTO employees
  (username, password, first_inital,  last_name, role)
VALUES  
  ('user', '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q', 'T', 'T', 'user');

INSERT INTO employees
  (username, password, first_inital, last_name, role)
VALUES
  ('manager', '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q', 'M', 'M', 'manager');

INSERT INTO employees
  (username, password, first_inital, last_name, role)
VALUES
  ('admin', '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q', 'R', 'R', 'admin');

INSERT INTO employees
  (first_inital, last_name, username, password, role)
VALUES  
  ('A', 'AA', 'Mr. A', 'AAA', NULL);

INSERT INTO projects
  (insured_name, address, created_at, active)
VALUES
  ('Joker bob', '123 fake street', '1999-01-08', True);

INSERT INTO projects
  (insured_name, address, created_at, active)
VALUES
  ('JillyGal', '123 fake street', '1999-01-08', True);

INSERT INTO employees_to_projects
  (employee_id, proj_id)
VALUES
  (1, 1);

INSERT INTO chamber
  (chamber_name, project_id)
VALUES
('outside', 1);

INSERT INTO chamber
(chamber_name, project_id)
VALUES
( 'uneffected', 1);

INSERT INTO chamber(chamber_name, project_id)
VALUES( 'uneffected', 2);

INSERT INTO dehumidifier
  (dehu_number, chamber_id, location)
VALUES
  (1, 1, 'next to fridge');

INSERT INTO affected_material
  (chamber_id, material_name)
VALUES
  (1, 'drywall area 1');

INSERT INTO reading
    (chamber_id, dehu_id, material_id, temp, RH, moisture_content, reading_date, day_number)
VALUES
  (1, null, null, 75, 101, null, '1/18/1999', 0);

INSERT INTO reading
  (chamber_id, dehu_id, material_id, temp, RH, moisture_content, reading_date, day_number)
VALUES
  (null, 1, null, 101, 75, null, '1/18/1999', 0);

INSERT INTO reading
  (chamber_id, dehu_id, material_id, temp, RH, moisture_content, reading_date, day_number)
VALUES
  (null, null, 1, null, null, 65, '1/18/1999', 0);

