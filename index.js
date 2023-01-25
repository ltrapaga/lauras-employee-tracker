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

const employeePrompt = () => {
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
          viewAll("DEPARTMENT");
          break;
        case "View all roles":
          viewAll("ROLE");
          break;
        case "View all employees":
          viewAll("EMPLOYEE");
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
        case "View employees by department":
          viewEmployeeByDepartment();
          break;
        case "View employees by manager":
          viewEmployeesByManager();
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
    })
};
