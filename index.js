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
  const query = `SELECT * FROM department`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const viewAllRoles = () => {
  const query = `
    SELECT title, role.id, salary, department.department_name AS department
    FROM role 
    LEFT JOIN department ON role.department_id = department.id`;

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
  LEFT JOIN employee manager ON manager.id = employee.manager_id
  ORDER BY employee.id ASC`;
  trackerDatabase.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const addDepartment = () => {
  let departmentQuestion = [
    {
      type: "input",
      name: "department_name",
      message: "What is the name of the department?",
    },
  ];

  inquirer
    .prompt(departmentQuestion)
    .then((res) => {
      const query = `INSERT INTO department (department_name) VALUES (?)`;
      trackerDatabase.query(
        query,
        [[res.department_name]],
        (err, newDepartmentRes) => {
          if (err) throw err;
          console.log(
            `${res.department_name} department added to the database at id ${newDepartmentRes.insertId}`
          );
          initialPrompt();
        }
      );
    })
    .catch((err) => {
      console.error(err);
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
            (err, newEmployeeRes) => {
              if (err) throw err;
              console.log(
                `${res.first_name} ${res.last_name} added to the database with id ${newEmployeeRes.insertId}`
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

const updateRole = () => {
  //get all the employee list
  trackerDatabase.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
    if (err) throw err;
    const employeeChoice = [];
    emplRes.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });

    //get all the role list to make choice of employee's role
    trackerDatabase.query("SELECT * FROM ROLE", (err, rolRes) => {
      if (err) throw err;
      const roleChoice = [];
      rolRes.forEach(({ title, id }) => {
        roleChoice.push({
          name: title,
          value: id,
        });
      });

      let questions = [
        {
          type: "list",
          name: "id",
          choices: employeeChoice,
          message: "whose role do you want to update?",
        },
        {
          type: "list",
          name: "role_id",
          choices: roleChoice,
          message: "what is the employee's new role?",
        },
      ];

      inquirer
        .prompt(questions)
        .then((response) => {
          const query = `UPDATE EMPLOYEE SET role_id = ? WHERE id = ?;`;
          trackerDatabase.query(
            query,
            [response.role_id, response.id],
            (err, res) => {
              if (err) throw err;

              console.log("successfully updated employee's role!");
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

const deleteRole = () => {
  // get all the role list to make choice of employee's role
  trackerDatabase.query("SELECT * FROM ROLE", (err, rolRes) => {
    if (err) throw err;
    const roleChoice = [];
    rolRes.forEach(({ title, id }) => {
      roleChoice.push({
        name: title,
        value: id,
      });
    });

    let questions = [
      {
        type: "list",
        name: "role_id",
        choices: roleChoice,
        message: "What role do you want to delete?",
      },
    ];

    inquirer
      .prompt(questions)
      .then((response) => {
        const query = `DELETE FROM role WHERE id = ?;`;
        trackerDatabase.query(query, [response.role_id], (err, res) => {
          if (err?.code === "ER_ROW_IS_REFERENCED_2") {
            console.log(
              "Can't delete role because an employee currently has that role"
            );
            initialPrompt();
            return;
          } else if (err) {
            throw err;
          }
          console.log("successfully updated employee's role!");
          initialPrompt();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
