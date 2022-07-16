INSERT INTO departments (dept_name)
VALUES
    ('Sales'),
    ('Finance'),
    ('Engineering');

INSERT INTO roles (title, salary, dept_id)
VALUES
    ("Sales Representative", 50000, 1),
    ("Sales Lead", 75000, 1),
    ("Accountant", 80000, 2),
    ("Director of Finance", 100000, 2),
    ("Software Engineer", 110000, 3),
    ("Senior Engineer", 150000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ('Taylor', 'Jones', 1, 2),
    ('Jennifer', 'Lee', 2, NULL),
    ('Carter', 'Richards', 3, 4),
    ('Allison', 'Frank', 4, NULL),
    ('Nick', 'Harris', 5, 6),
    ('Margaret', 'Smith', 6, NULL);