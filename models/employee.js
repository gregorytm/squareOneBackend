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

  static async register({ username, password, first_inital, last_name, role }) {
    const duplicateCheck = await db.query(
      `SELECT username
      FROM employees
      WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

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
      [username, hashedPassword, first_inital, last_name, role]
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
      FROM employees`
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

  /**Given an Id, update role status to go from user to manager */
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
   * Data can include:
   * { first_inital, last_name }
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

  /**
   * Update user data with `data`.
   *
   * This is a partial update == only one field is required
   * for update
   *
   * Data can include:
   *  { username, firstInital, lastName, password role }
   *
   * Returns { username, firstName, lastName, role }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make an employee an admin.
   * Callers of this function must be certain they ahve validated inputs to this
   * or serious security ristsk are opened.
   */

  // static async update(username, data) {
  //   if (data.password) {
  //     data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
  //   }

  //   const { setCols, values } = sqlForPartialUpdate(data, {
  //     firstInital: "first_inital",
  //     lastName: "last_name",
  //     role: "role",
  //   });
  //   const usernameVarIdx = "$" + (values.length + 1);

  //   const querySql = `UPDATE employees
  //                   SET ${setCols}
  //                   WHERE username = ${usernameVarIdx}
  //                   Returning username,
  //                             first_inital As "firstInital",
  //                             last_name AS "lastName:,
  //                             role`;
  //   const result = await db.query(querySql, [...values, username]);
  //   const employee = result.rows[0];

  //   if (!employee) throw new NotFoundError(`No user: ${username}`);

  //   delete employee.password;
  //   return employee;
  // }

  /** Delete given user from database; returns undefined */

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
