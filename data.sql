DROP DATABASE IF EXISTS squareonedb;

CREATE DATABASE squareonedb;

\c squareonedb;


CREATE TABLE employees 
(
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_inital TEXT NOT NULL,
  last_name TEXT NOT NULL,
  status TEXT NOT NULL
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
  emp_id INTEGER NOT NULL REFERENCES employees,
  proj_id INTEGER NOT NULL REFERENCES projects
);


CREATE TABLE chamber 
(
  id SERIAL PRIMARY KEY,
  chamber_name  TEXT NOT NULL,
  project_id INTEGER NOT NULL REFERENCES projects
  );


CREATE TABLE dehumidifier 
(
  id SERIAL PRIMARY KEY,
  dehu_number INTEGER NOT NULL,
  chamber_id INTEGER NOT NULL REFERENCES chamber,
  location TEXT NOT NULL
);

CREATE TABLE affected_material 
(
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chamber,
  material_name TEXT NOT NULL
);


CREATE TABLE reading 
(
  id SERIAL PRIMARY KEY,
  chamber_id INTEGER REFERENCES chamber,
  dehu_id INTEGER REFERENCES dehumidifier,
  material_id INTEGER REFERENCES affected_material,
  temp INTEGER,
  RH INTEGER,
  moisture_content INTEGER,
  reading_date DATE NOT NULL,
  day_number INTEGER NOT NULL
);



-- sample date
-- seperate into own file BEFORE deployment

INSERT INTO employees
  (first_inital, password, last_name, username,  status)
VALUES  
  ('T', 'TT', 'Mr. T', 'TTT', 'active');

INSERT INTO employees
  (first_inital, last_name, username, password, status)
VALUES  
  ('A', 'AA', 'Mr. A', 'AAA', 'unactive');

  INSERT INTO employees
  (first_inital, last_name, username, password, status)
VALUES  
  ('B', 'BB', 'Mr. B', 'BBB', 'manager');

INSERT INTO projects
  (insured_name, address, created_at, active)
VALUES
  ('Joker bob', '123 fake street', '1999-01-08', true);

INSERT INTO employees_to_projects
  (emp_id, proj_id)
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

INSERT INTO dehumidifier
  (dehu_number, chamber_id, location)
VALUES
  (1, 1, 'next to fridge');

INSERT INTO affected_material
  (room_id, material_name)
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

