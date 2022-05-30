"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

/**  Related functions for projects */

class Project {
  /** Create a company (from data), update db, return new company data
   *
   * data should be { insured_name, address, created_at, active}
   *
   * Returns { insured_name, address, created_at, active }
   *
   */

  static async create({
    insured_name: insuredName,
    address,
    created_at: createdAt,
  }) {
    const result = await db.query(
      `INSERT INTO projects
      (insured_name, address, created_at, active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, insured_name, address, created_at, active`,
      [insuredName, address, createdAt, true]
    );
    const project = result.rows[0];
    return project;
  }

  /**Find all active projects
   *
   * returns {id, insured_name, created_at, active}
   */

  static async findActive(active = true) {
    let result = await db.query(
      `SELECT id, 
          insured_name, 
          address, 
          created_at,
          active
        FROM projects
        WHERE active = $1`,
      [active]
    );
    const projects = result.rows;

    if (!projects) throw new NotFoundError(`No project found`);
    return projects;
  }

  /**Given a project id return data about project
   *
   * Returns {id, insuredName, address, createdAt, active}
   *
   * throws UnauthorizedError if no projects found
   */

  static async get(id) {
    const projectRes = await db.query(
      `SELECT id,
        insured_name AS "insuredName",
        address,
        created_at AS "createdAt",
        active
      FROM projects
      WHERE id = $1`,
      [id]
    );
    const project = projectRes.rows[0];

    if (!project) throw new NotFoundError(`No project found`);
    return project;
  }

  /**Given a project id, removes project from the db
   *
   * does not return anything
   *
   * throws unauthorizedError if no projects found
   */

  static async remove(id) {
    const result = await db.query(
      `DELETE
      FROM projects
      WHERE id = $1
      Returning id`,
      [id]
    );
    const project = result.rows[0];

    if (!project) throw new NotFoundError(`No project found`);
  }

  /**Given a project id and data, updata project details
   *
   * data includes insuredName and address
   *
   * throws BadRequestError if updata data is left empty or fails
   */

  static async update(id, data) {
    if (data) {
      const result = await db.query(
        `UPDATE projects
        SET insured_name = $1, address = $2
        WHERE id=$3
        RETURNING id, insured_name AS "insuredName", address`,
        [data.insured_name, data.address, id]
      );
      return result;
    } else {
      throw new BadRequestError(`update data required`);
    }
  }
}

module.exports = Project;
