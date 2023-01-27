// Prompts:
// 1. What would you like to do?
// Select:
// View all employees (Shows pertinent table)
// Update employee role
// Which employee's role do you want to update? (Select from list of current employees)
// Which role do you want to assign the selected employee? (Select from list of current roles ----> takes back to question 1)
// Add employee
// What is the employee's first name? (Input)
// What is the employee's last name? (Input)
// What is the employee's role? (Select from list of current roles)
// Who is the employee's manager? (Select from list of current employees or none ----> takes back to question 1)

// View all roles (Shows pertinent table)
// Add role
// What is the name of the role? (Input)
// What is the salary of the role? (Input)
// Which department does the role belong to? (Select from list of current departments ----> takes back to question 1)

// View all departmets (Shows pertinent table)
// Add department
// What is the name of the department? (Input ----> takes back to question 1)
// Quit

// Imports node_modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console");

// Connect to database
const trackerDatabase = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "SswUfu*Esuub3!.",
    database: "tracker_db",
  },
  console.log("Connected to the tracker_db database.")
);

const initialPrompt = () => {
  // Initializes inquirer
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        loop: false,
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add department",
          "Add role",
          "Add employee",
          "Update employee role",
          "View employees by department",
          "View employees by manager",
          "Update employee managers",
          "Delete department",
          "Delete role",
          "Delete employee",
          "View the combined salaries of all employees in a department",
          "Quit",
        ],
      },
    ])
    .then((res) => {
      switch (res.menu) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "View employees by department":
          viewEmployeeByDepartment();
          break;
        case "View employees by manager":
          viewEmployeesByManager();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Add role":
          addRole();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Update employee role":
          updateRole();
          break;
        case "Update employee managers":
          updateManagers();
          break;
        case "Delete department":
          deleteDepartment();
          break;
        case "Delete role":
          deleteRole();
          break;
        case "Delete employee":
          deleteEmployee();
          break;
        case "View the combined salaries of all employees in a department":
          viewDepartmentSalaries();
          break;
        default:
          trackerDatabase.end();
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

initialPrompt();

const viewAllDepartments = () => {
  const query = `SELECT * FROM department;`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const viewAllRoles = () => {
  const query = `
  SELECT * FROM role 
  JOIN department ON role.department_id = department.id;`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const viewAllEmployees = () => {
  const query = `
  SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name, role.title, role.salary, department.department_name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name 
  FROM employee 
  JOIN role ON employee.role_id = role.id 
  LEFT JOIN department ON role.department_id = department.id 
  LEFT JOIN employee manager ON manager.id = employee.manager_id;`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const addEmployee = () => {
  trackerDatabase.query(`SELECT * FROM employee`, (err, employeeRes) => {
    if (err) throw err;
    const employeeOptions = [
      {
        name: "None",
        value: 0,
      },
    ];

    employeeRes.forEach(({ first_name, last_name, id }) => {
      employeeOptions.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });

    trackerDatabase.query(`SELECT * FROM role`, (err, roleRes) => {
      if (err) throw err;
      const roleOptions = [];
      roleRes.forEach(({ title, id }) => {
        roleOptions.push({
          name: title,
          value: id,
        });
      });

      let employeeQuestions = [
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?",
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?",
        },
        {
          type: "list",
          name: "role_id",
          choices: roleOptions,
          message: "What is the employee's role?",
        },
        {
          type: "list",
          name: "manager_id",
          choices: employeeOptions,
          message: "Who is the employee's manager?",
        },
      ];

      inquirer
        .prompt(employeeQuestions)
        .then((res) => {
          const newEmployeeQuery = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`;
          let manager_id = res.manager_id !== 0 ? res.manager_id : null;
          trackerDatabase.query(
            newEmployeeQuery,
            [[res.first_name, res.last_name, res.role_id, manager_id]],
            (err, res) => {
              if (err) throw err;
              console.log(
                `Successfully inserted employee ${res.first_name} ${res.last_name} with id ${res.insertId}`
              );
              initialPrompt();
            }
          );
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });
};
