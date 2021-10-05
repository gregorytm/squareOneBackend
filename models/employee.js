"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");
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
   * Returns { username first_inital, last_name, status
   *
   * Throws UnauthorizedError if user not found or wrong password.
   */

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT Username,
              password,
              first_inital AS "firstInital",
              last_name AS "lastName",
              status
      FROM employees
      WHERE username = $1`,
      [username]
    );

    const employee = result.rows[0];

    if (employee) {
      //compare hashed password to a new has from password
      const isValid = await bcrypt.compare(password, employee.password);
      if (isValid === true) {
        delete employee.password;
        return employee;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstInital, lastName, status }
   *
   * throws BadRequestError on duplicates.
   */

  static async register({ username, password, firstInital, lastName, status }) {
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
        status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, first_inital AS "firstInital", last_name AS "lastName", status`,
      [username, hashedPassword, firstInital, lastName, status]
    );

    const employee = result.rows[0];

    return employee;
  }

  /**Find all users
   *
   * Returns [{ username, first_inital, last_name, status }, ...]
   */

  static async findAll() {
    const result = await db.query(
      `SELECT username,
        first_inital AS "firstInital",
        last_name AS "lastName",
        status
      FROM employees
      ORDER BY username`
    );
    return result.rows;
  }

  /**Given a username, return data about employee.
   *
   * Returns { username, first_inital, last_name, status }
   *
   * Throws NotFoundError if user not found
   */

  static async get(username) {
    const employeeRes = await db.query(
      `SELECT username,
        first_inital AS "firstName",
        last_nae As "lastName",
        status
      FROM employees
      WHERE username = $1`,
      [username]
    );

    const employee = employeeRes.rows[0];

    if (!employee) throw new NotFoundError(`No employee: ${username}`);
    return employeee;
  }
  /**
   * Update user data with `data`.
   *
   * This is a partial update == only one field is required
   * for update
   *
   * Data can include:
   *  { username, firstInital, lastName, password status }
   *
   * Returns { username, firstName, lastName, status }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make an employee an admin.
   * Callers of this function must be certain they ahve validated inputs to this
   * or serious security ristsk are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstInital: "first_inital",
      lastName: "last_name",
      status: "status",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE employees
                    SET ${setCols}
                    WHERE username = ${usernameVarIdx}
                    Returning username,
                              first_inital As "firstInital",
                              last_name AS "lastName:,
                              status`;
    const result = await db.query(querySql, [...values, username]);
    const employee = result.rows[0];

    if (!employee) throw new NotFoundError(`No user: ${username}`);

    delete employee.password;
    return employee;
  }

  /** Delete given user from database; returns undefined */

  static async remove(username) {
    let result = await db.query(
      `DELETE
      FROM employees
      WHERE username = $1
      RETURNING username,`[username]
    );
    const employee = result.rows[0];

    if (!employee) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = Employee;
