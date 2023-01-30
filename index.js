// Imports node_modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

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
          "View the total utilized budget of a department",
          "Quit",
        ],
      },
    ])
    .then((initialPromptRes) => {
      switch (initialPromptRes.menu) {
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
        case "View the total utilized budget of a department":
          viewDepartmentBudget();
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
  const viewDepartmentsQuery = `
    SELECT * 
    FROM department`;
  trackerDatabase.query(viewDepartmentsQuery, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const viewAllRoles = () => {
  const viewRolesQuery = `
    SELECT title, role.id, salary, department.department_name AS department
    FROM role 
    LEFT JOIN department ON role.department_id = department.id`;
  trackerDatabase.query(viewRolesQuery, (err, res) => {
    if (err) throw err;
    console.table(res);
    initialPrompt();
  });
};

const viewAllEmployees = () => {
  const viewEmployeesQuery = `
    SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name, role.title, role.salary, department.department_name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name 
    FROM employee
    JOIN role ON employee.role_id = role.id 
    LEFT JOIN department ON role.department_id = department.id 
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    ORDER BY employee.id ASC`;
  trackerDatabase.query(viewEmployeesQuery, (err, res) => {
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
      const newDepartmentQuery = `
        INSERT INTO department (department_name) VALUES (?)`;
      trackerDatabase.query(
        newDepartmentQuery,
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

const addRole = () => {
  const departmentsArr = [];
  trackerDatabase.query(`SELECT * FROM department`, (err, departmentRes) => {
    if (err) throw err;
    departmentRes.forEach((department) => {
      let departmentsData = {
        name: department.department_name,
        value: department.id,
      };
      departmentsArr.push(departmentsData);
    });
    let roleQuestions = [
      {
        type: "input",
        name: "title",
        message: "What is the title of the new role?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the new role?",
      },
      {
        type: "list",
        name: "department",
        choices: departmentsArr,
        message: "What department is the new role in?",
      },
    ];
    inquirer
      .prompt(roleQuestions)
      .then((res) => {
        const newRoleQuery = `
        INSERT INTO role (title, salary, department_id) VALUES (?)`;
        trackerDatabase.query(
          newRoleQuery,
          [[res.title, res.salary, res.department]],
          (err, newRoleRes) => {
            if (err) throw err;
            console.log(
              `Successfully inserted ${res.title} role at id ${newRoleRes.insertId}`
            );
            initialPrompt();
          }
        );
      })
      .catch((err) => {
        console.error(err);
      });
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
          const newEmployeeQuery = `
            INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`;
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
  trackerDatabase.query(`SELECT * FROM employee`, (err, employeeRes) => {
    if (err) throw err;
    const employeeArr = [];
    employeeRes.forEach(({ first_name, last_name, id }) => {
      employeeArr.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });
    trackerDatabase.query(`SELECT * FROM role`, (err, roleRes) => {
      if (err) throw err;
      const updateRoleArr = [];
      roleRes.forEach(({ title, id }) => {
        updateRoleArr.push({
          name: title,
          value: id,
        });
      });
      let updateRoleQuestions = [
        {
          type: "list",
          name: "id",
          choices: employeeArr,
          message: "Whose role do you want to update?",
        },
        {
          type: "list",
          name: "role_id",
          choices: updateRoleArr,
          message: "What is the employee's new role?",
        },
      ];

      inquirer
        .prompt(updateRoleQuestions)
        .then((updateRoleRes) => {
          const updateRoleQuery = `UPDATE employee SET role_id = ? WHERE id = ?`;
          trackerDatabase.query(
            updateRoleQuery,
            [updateRoleRes.role_id, updateRoleRes.id],
            (err, res) => {
              if (err) throw err;
              console.log("Employee role updated");
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

const deleteDepartment = () => {
  const deleteDepartmentArr = [];
  connection.query(`SELECT * FROM department`, (err, departmentRes) => {
    if (err) throw err;
    departmentRes.forEach(department => {
      let deleteDepartmentObj = 
        {
          name: department.name,
          value: department.id
        }
    deleteDepartmentArr.push(deleteDepartmentObj);
    });
    let deleteDepartmentQuestion = [
      {
        type: "list",
        name: "id",
        choices: deleteDepartmentArr,
        message: "Which department do you want to delete?"
      }
    ];
    inquirer.prompt(deleteDepartmentQuestion)
    .then(deleteDepartmentRes => {
      const deleteDepartmentQuery = `DELETE FROM DEPARTMENT WHERE id = ?`;
      connection.query(deleteDepartmentQuery, [deleteDepartmentRes.id], (err, res) => {
        if (err) throw err;
        console.log(`Department deleted`);
        startPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
};

const deleteRole = () => {
  trackerDatabase.query(`SELECT * FROM role`, (err, roleRes) => {
    if (err) throw err;
    const deleteRoleArr = [];
    roleRes.forEach(({ title, id }) => {
      deleteRoleArr.push(
        {
        name: title,
        value: id,
        }
      );
    });
    let deleteRoleQuestion = [
      {
        type: "list",
        name: "role_id",
        choices: deleteRoleArr,
        message: "What role do you want to delete?",
      },
    ];
    inquirer
      .prompt(deleteRoleQuestion)
      .then((deleteRoleRes) => {
        const deleteRoleQuery = `DELETE FROM role WHERE id = ?`;
        trackerDatabase.query(deleteRoleQuery, [deleteRoleRes.role_id], (err, res) => {
          if (err?.code === "ER_ROW_IS_REFERENCED_2") {
            console.log(
              "Can't delete role because an employee currently has that role"
            );
            initialPrompt();
            return;
          } else if (err) {
            throw err;
          }
          console.log("Employee role updated");
          initialPrompt();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

const deleteEmployee = () => {
  trackerDatabase.query(`SELECT * FROM employee`, (err, employeeRes) => {
    if (err) throw err;
    const deleteEmployeeArr = [];
    res.forEach(({ first_name, last_name, id }) => {
      deleteEmployeeArr.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });

    let deleteEmployeeQuestions = [
      {
        type: "list",
        name: "id",
        choices: deleteEmployeeArr,
        message: "Which employee do you want to delete?",
      },
    ];

    inquirer
      .prompt(deleteEmployeeQuestions)
      .then((deleteEmployeeRes) => {
        const deleteEmployeeQuery = `DELETE FROM employee WHERE id = ?`;
        trackerDatabase.query(deleteEmployeeQuery, [deleteEmployeeRes.id], (err, res) => {
            if (err) throw err;
            console.log(`Employee deleted`);
            initialPrompt();
          }
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

const viewDepartmentBudget = () => {
  trackerDatabase.query("SELECT * FROM department", (err, departmentRes) => {
    if (err) throw err;
    const departmentBudgetArr = [];
    departmentRes.forEach(({ department_name, id }) => {
      departmentBudgetArr.push(
        {
        name: department_name,
        value: id,
        }
      );
    });
    let budgetQuestion = [
      {
        type: "list",
        name: "id",
        choices: departmentBudgetArr,
        message: "Which department's total utilized budget would you like to view?",
      },
    ];
    inquirer
      .prompt(budgetQuestion)
      .then((departmentBudgetRes) => {
        const budgetQuery = `
          SELECT department.department_name, COALESCE(sum(salary), 0) AS budget
          FROM department
          LEFT JOIN role r ON r.department_id = department.id 
          LEFT JOIN employee ON employee.role_id = r.id
          WHERE department.id = ?`;
        trackerDatabase.query(budgetQuery, [departmentBudgetRes.id], (err, res) => {
          if (err) throw err;
          console.table(res);
          initialPrompt();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};


