"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");

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
   *
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
    return projects;
  }

  /**Given a project id return data about project
   *
   * Returns {id, insuredName, address, createdAt, active}
   *
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

  static async update(id, data) {
    if (data.insuredName && data.address) {
      const result = await db.query(
        `UPDATE projects
        SET insured_name = $1, address = $2
        WHERE id=$4
        RETURNING id, insured_name AS "insuredName", address`,
        [data.insuredName, data.address, id]
      );
      return result;
    } else if (data.insuredName && !data.address) {
      const result = await db.query(
        `UPDATE projects
        SET insured_name = $1
        WHERE id=$2
        RETURNING id, insured_name AS "insuredName", address`,
        [data.insuredName, id]
      );
      return result;
    } else if (!data.insuredName && data.address) {
      const result = await db.query(
        `UPDATE projects
        SET address=$1
        WHERE id=$2
        RETURNING id, insured_name AS  "insuredName", address`
      );
      return result;
    } else {
      throw new NotFoundError(`No project found`);
    }
  }
}

module.exports = Project;
