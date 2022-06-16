"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

//** Related functions for users. */

class Employee {
  /** authenticate employee with username, password
   *
   * Returns { username first_inital, last_name, role
   *
   * Throws UnauthorizedError if user not found or wrong password.
   */

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id,
        username,
        password,
        first_inital AS "firstInital",
        last_name AS "lastName",
        role
      FROM employees
      WHERE username = $1`,
      [username]
    );

    const employee = result.rows[0];
    console.assert(!!employee, `no user with username "${username}"found`);

    if (employee) {
      //compare hashed password to a new has from password
      const isValid = await bcrypt.compare(password, employee.password);
      console.assert(isValid, "invalid password supplied");
      if (isValid === true) {
        delete employee.password;
        return employee;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstInital, lastName, role }
   *
   * throws BadRequestError on duplicates.
   */

  static async register({
    username,
    password,
    first_inital: firstInital,
    last_name: lastName,
    role,
  }) {
    //check username availability
    const duplicateCheck = await db.query(
      `SELECT username
      FROM employees
      WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    //hashes password using our work factor
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO employees
      (username,
        password,
        first_inital,
        last_name,
        role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, first_inital AS "firstInital", last_name AS "lastName", role`,
      [username, hashedPassword, firstInital, lastName, role]
    );

    const employee = result.rows[0];

    return employee;
  }

  /**Find all users
   *
   * Returns [{ username, first_inital, last_name, role }, ...]
   */

  static async getAll() {
    const result = await db.query(
      `SELECT id,
        first_inital AS "firstInital",
        last_name AS "lastName",
        role
      FROM employees
      WHERE role <> 'admin'
      OR role is NULL`
    );
    return result.rows;
  }

  /**Given an Id, return data about employee.
   *
   * Returns { username, first_inital, last_name, role }
   *
   * Throws NotFoundError if user not found
   */

  static async get(id) {
    const employeeRes = await db.query(
      `SELECT id,
        username,
        first_inital AS "firstInital",
        last_name As "lastName",
        role
      FROM employees
      WHERE employees.id = $1`,
      [id]
    );

    const employee = employeeRes.rows[0];

    if (!employee) throw new NotFoundError(`No employee found`);
    return employee;
  }

  /**Given an Id, update role status to manager
   *
   * throws NotFoundError if no employee found
   */
  static async promoteToManager(empId) {
    const querySql = await db.query(
      `UPDATE employees
      SET role = 'manager' 
      WHERE id = $1
      RETURNING last_name, role`,
      [empId]
    );
    const employee = querySql.rows;

    if (!employee) throw new NotFoundError(`No employee found`);
    return employee;
  }

  /**Given an id, update role status to active user
   *
   * throws NotFoundError if no employee found
   */
  static async promoteToUser(empId) {
    const querySql = await db.query(
      `UPDATE employees
      SET role = 'user' 
      WHERE id = $1
      RETURNING last_name, role`,
      [empId]
    );
    const employee = querySql.rows;

    if (!employee) throw new NotFoundError(`No employee found`);
    return employee;
  }

  /**Given an empId, update role status to unactive
   *
   * throws NotFoundError if no employee found
   */
  static async makeUnactive(empId) {
    const querySql = await db.query(
      `UPDATE employees
      SET role = null 
      WHERE id = $1
      RETURNING last_name, role`,
      [empId]
    );
    const employee = querySql.rows;

    if (!employee) throw new NotFoundError(`No employee found`);
    return employee;
  }

  /**
   * Update employe data with `data` sent from client
   *
   * Data includes: { first_inital, last_name }
   *
   * returns employee updated data
   */

  static async update(empId, { firstInital, lastName }) {
    const querySql = await db.query(
      `Update employees
      SET first_inital = $1,
      last_name=$2
      WHERE id=$3
      RETURNING username, first_inital AS firstInital, last_name AS lastName`,
      [firstInital, lastName, empId]
    );

    const employee = querySql.rows[0];
    return employee;
  }

  /** Delete given user from database; returns undefined
   *
   * throws NotFoundError if no emp found
   */

  static async remove(empId) {
    let result = await db.query(
      `DELETE
      FROM employees
      WHERE id = $1
      RETURNING username`,
      [empId]
    );
    const employee = result.rows[0];

    if (!employee) throw new NotFoundError(`No user found`);
  }
}

module.exports = Employee;
