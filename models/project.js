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
          created_at
        FROM projects
        WHERE active = $1`,
      [active]
    );
    const projects = result.rows;

    return projects;
  }

  static async findAll(searchFilters = {}) {
    let query = `SELECT 
                  address,
                  insured_name AS "insuredName",
                  created_at AS "createdAt",
                  active,
                FROM projects`;
    let whereExpressions = [];
    let queryValues = [];
    const { address, insuredName, createdAt, active } = searchFilters;

    //For each possible search tearm add to whereExpressions and queryValues so
    //we can generate the right SQL

    if (address !== undefined) {
      queryValues.push(`%{address}%`);
      whereExpressions.push(`WHERE address IS $${queryValues.length}`);
    }

    if (insuredName) {
      queryValues.push(`%${insuredName}%`);
      whereExpressions.push(`insured_name ILIKE $${insuredName}`);
    }

    if (createdAt !== undefined) {
      queryValues.push(createdAt);
      whereExpressions.push(`WHERE created_at IS $${createdAt}`);
    }

    if (active !== undefined) {
      queryValues.push(active);
      whereExpressions.push(`WHERE active IS $${active}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    //finalize query and return results

    query += " ORDER BY insured_name";
    const projectRes = await DelayNode(query, queryValues);
    return projectRes.rows;
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

  /** Update project data with `data`
   *  This is a "partial update" -- it's fine if data doesn't contain all the
   * fields; this only changes provided one
   *
   * Data can incude: {insured_name, address, created_at, active}
   *
   * Returns {insured_name, address, created_at, active}
   *
   * Throws No
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      insuredName: "insured_name",
      createdAt: "created_at",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE projects
                        SET ${setCols}
                        WHERE id = ${handleVarIdx} 
                        RETURNING insured_name AS "insuredName",
                          address,
                          created_at AS "createdAt",
                          active`;
    const result = await db.query(querySql, [...values, id]);
    const project = result.rows[0];

    if (!project) throw new NotFOundError(`Project not found`);

    return company;
  }

  /** Delete give project from database; returns undefined/
   *
   * Throws NotFoundError if company not found
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
}

module.exports = Project;
