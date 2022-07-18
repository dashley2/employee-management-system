const db = require("./db/connection");
const inquirer = require("inquirer");
const cTable = require("console.table");
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

          case 'Add a employee':
              break;

          case 'Update an employee role':
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

// Get role params
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