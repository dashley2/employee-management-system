const db = require("./db/connection");
const inquirer = require("inquirer");


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
              break;

          case 'View all roles':
              break;

          case 'View all employees':
              break;

          case 'Add a department':
              break;

          case 'Add a role':
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

