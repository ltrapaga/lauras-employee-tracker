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
const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console');



