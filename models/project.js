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

  /**Find all projects (optional filter on searchFilters)
   *
   * searchFilters(all optional):
   * - address
   * -insured_name (will find casae-insensitive, partial matches)
   * -created_at
   * -active status
   *
   *  Returns [{ id, insured-name, address, created_at active}, ...],
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
      insured_name,
        address,
        created_at,
        active
      FROM projects
      WHERE id = $1`,
      [id]
    );

    const project = projectRes.rows[0];

    if (!project) throw new NotFoundError(`No project found`);

    const transformProject = {
      id: project.id,
      insuredName: project.insured_name,
      address: project.address,
      createdAt: new Date(project.created_at),
      active: project.active,
    };
    return transformProject;
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
}

module.exports = Project;
