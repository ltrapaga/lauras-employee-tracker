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

const initalPrompt = () => {
  // Initializes inquirer
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
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
      switch (res.choice) {
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

const viewAllDepartments = () => {
  const query = `SELECT * FROM department`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initalPrompt();
  });
};

const viewAllRoles = () => {
  const query = `
    SELECT r.id AS id, title, salary, d.name AS department
    FROM role AS r 
    LEFT JOIN department AS d ON r.department_id = d.id`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initalPrompt();
  });
};

const viewAllEmployees = () => {
  const query = `
    SELECT e.id AS id, e.first_name AS first_name, e.last_name AS last_name, 
    r.title AS role, d.name AS department, CONCAT(m.first_name, " ", m.last_name) AS manager
    FROM employee AS e 
    LEFT JOIN role AS r ON e.role_id = r.id
    LEFT JOIN department AS d ON r.department_id = d.id
    LEFT JOIN employee AS m ON e.manager_id = m.id`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initalPrompt();
  });
};
