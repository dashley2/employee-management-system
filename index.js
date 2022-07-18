const db = require("./db/connection");
const inquirer = require("inquirer");
const cTable = require('console.table');
const mysql = require('mysql2');

db.connect((err) => {
    if (err) throw err;
    console.log('=================================')
    console.log('         Welcome to the          ')
    console.log('    Employee Management System   ')
    console.log('=================================')
    startPrompt();
  });

const startPrompt = function () {
  return inquirer.prompt({
      type: 'list',
      name: 'initialQuestion',
      message: 'What would you like to do?',
      choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      '>>>EXIT<<<',
      ],
  })
  .then ((answers) => {
      switch (answers.initialQuestion) {
          case 'View all departments':
              viewDepartments();
              break;

          case 'View all roles':
              viewRoles();
              break;

          case 'View all employees':
              viewEmployees();
              break;

          case 'Add a department':
              addDepartment();
              break;

          case 'Add a role':
              newRolePrompt();
              break;

          case 'Add an employee':
              newEmployeePrompt();
              break;

          case 'Update an employee role':
              chooseEmployee();
              break;

          case '>>>EXIT<<<':
              console.log('Bye!');
              process.exit();
      }
  });
}

// View all departments
const viewDepartments = () => {
    const sql = `SELECT * FROM departments`;
    db.query(sql, (err, rows) => {
        if (err) {
                console.log(err);
                initializeApp();
                return;
        } else {
        console.table(rows);
        startPrompt();
        }
    });
};

// Add a new department
const addDepartment = () => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "dept_name",
          message: "Enter the name of the department you would like to add.",
        },
      ])
      .then((answer) => {
        const sql = `INSERT INTO departments (dept_name) VALUES (?)`;
        db.query(sql, answer.dept_name, (err, result) => {
          if (err) {
            console.log(err);
            initializeApp();
            return;
          } else {
          console.log(`Added ${answer.dept_name} to the database.`);
          startPrompt();
          }
        });
    });
};


// View all roles
const viewRoles = () => {
    const sql = `SELECT
    roles.id,
    roles.title AS job,
    roles.salary,
    departments.dept_name AS department
  FROM roles
  LEFT JOIN departments
  ON roles.dept_id = departments.id;
  `;
    db.query(sql, (err, rows) => {
      if(err) {
        console.log(err);
        return;
      }
      console.table(rows);
      startPrompt();
    });
};

// Get new role params
const newRolePrompt = () => {
    inquirer.prompt([
      {
        type: "input",
        name: "role",
        message: "Please enter the name of the role you would like to add.",
      },
      {
        type: "input",
        name: "salary",
        message: "Please enter the salary of the role you are adding.",
      },
    ])
    .then((answers) => {
    const params = [answers.role, answers.salary];

// Connect to department id
    const deptsql = `SELECT id, dept_name FROM departments`;

    db.query(deptsql, (err, deptData) => {
        if (err) {
          console.log(err);
        } else {
          const deptArr = deptData.map(({ id, dept_name }) => ({
            name: dept_name,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "department",
                message: "What department is this role in?",
                choices: deptArr,
              },
            ])
            .then((deptChoice) => {
              const newRoleDept = deptChoice.department;
              params.push(newRoleDept);

              addNewRole(params);
            });
        }
      });
    });
};

// Add new role
const addNewRole = (params) => {
    const sql = `INSERT INTO roles (title, salary, dept_id)
                  VALUES (?, ?, ?)`;

    db.query(sql, params, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Added to roles.`);
        viewRoles();
        startPrompt();
      }
    });
};

// View all employees
const viewEmployees = () => {
    const sql =   `
    SELECT employees.id,
    employees.first_name,
    employees.last_name,
    roles.title AS role,
    roles.salary,
    departments.dept_name AS department,
    CONCAT (manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments on roles.dept_id = departments.id
    LEFT JOIN employees manager ON employees.manager_id = manager.id
    `;
    db.query(sql, (err, rows) => {
        if(err) {
            console.log(err);
            return;
        }
        console.table(rows);
        startPrompt();
    });
};

const newEmployeePromptArray = [
    {
      type: "input",
      name: "firstname",
      message: "What is the first name of your employee?",
    },
    {
      type: "input",
      name: "lastname",
      message: "What is the last name of your employee?",
    },
  ];

// Get first name, last name, and role for new employee
const newEmployeePrompt = () => {
    inquirer.prompt(newEmployeePromptArray)
    .then((answers) => {
        const params = [answers.firstname, answers.lastname];
        const roleSql = `SELECT title, id FROM roles`;

        db.promise()
          .query(roleSql)
          .then(([rows, fields]) => {
            const roleArr = rows.map(({ title, id }) => ({
              name: title,
              value: id,
            }));
            inquirer.prompt([
                {
                  type: "list",
                  name: "role",
                  choices: roleArr,
                },
              ])
            .then((roleChoice) => {
            const newEmployeeRole = roleChoice.role;
            params.push(newEmployeeRole);
            newEmpManager(params);
            });
        });
    });
};

// Get manager for the new employee
const newEmpManager = params => {
    const managerSql = `SELECT first_name, last_name, id FROM employees`;

    db.promise().query(managerSql)
    .then(([rows, fields]) => {
        const managerArr = rows.map(
            ({ first_name, last_name, id }) => ({
            name: first_name + " " + last_name,
            value: id,
            })
        );
        inquirer.prompt([
            {
                type: "list",
                name: "manager",
                choices: managerArr,
            },
            ])
        .then((managerChoice) => {
            const newEmployeeManager = managerChoice.manager;
            params.push(newEmployeeManager);
            addNewEmployee(params);
        });
    });
};

// Add a new employee with the params
const addNewEmployee = params => {
    const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
            VALUES (?, ?, ?, ?)`;

    db.query(sql, params, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Added new employee to the database!`);
        viewEmployees();
    }
    });
};

// Select employee to update role
const chooseEmployee = () => {
    const employeeSql = `SELECT * FROM employees`;
    const params = [];
    db.promise().query(employeeSql)
    .then(( [ rows, fields ]) => {
        const employeeArr = rows.map(( { id, first_name, last_name  }) => ({
            name: first_name + ' ' + last_name,
            value: id
        }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee are you updating?',
                choices: employeeArr
            }
        ])
        .then((employeeChoice) => {
            const chosenEmployee = employeeChoice.employee;
            params.push(chosenEmployee);
            chooseNewRole(params);
        })

    })
};

// Choose a new role for the employee
const chooseNewRole = params => {
    const roleSql = `SELECT * FROM roles`;
    db.promise().query(roleSql)
    .then(( [ rows, fields ]) => {
        const roles = rows.map(( { title, id }) => ({
            name: title,
            value: id
        }))
        console.log(roles);

        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: 'What is the employees new role?',
                choices: roles
            }
        ])
        .then(roleChoice => {
            const newRole = roleChoice.role;
            params.push(newRole);
            let employee = params[0];
            params[1] = employee;
            params[0] = newRole;

            updateRole(params);
        })
    });
};

// Update the employee role with params
const updateRole = params => {
    const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
    db.query(sql, params, (err, result) => {
        if(err) {
            console.log(err);
        } else {
            console.log(`Updated the employee role!`);
            viewEmployees();
        }
    });
};
