"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");
const { NotFoundError } = require("../expressError");

/** Related functions for chambers */

class Chamber {
  /** Create a chamber(from data), update chamber return new chamber data
   *
   * data should be { chamber_name, project_id }
   *
   * Returns { chamerName, projectId }
   */

  static async create(data) {
    const result = await db.query(
      `INSERT INTO chamber (chamber_name, project_id)
    VALUES ($1, $2)
    RETURNING id, chamber_name project_id`,
      [data.chamberName, data.projectId]
    );
    let chamber = result.rows[0];

    return chamber;
  }

  /** Find all chambers for a given project
   *
   * chamber format (chamberName, projectId)
   *
   * -Returns [ transformArray ]
   */

  static async findRelated(projectId) {
    let query = await db.query(`SELECT chamber.id, chamber_name, project_id
      FROM chamber
      JOIN projects
      ON chamber.project_id = projects.id`);
    const allChambers = query.rows;

    const transformArray = [];

    allChambers.map(function (el) {
      const transformChamber = {
        id: el.id,
        chamberName: el.chamber_name,
        projectId: el.project_id,
      };
      transformArray.push(transformChamber);
    });

    return transformArray;
  }

  /** Given a chamber id, return data about chamber
   *
   *
   *
   * Returns {id, chamberName, projectId}
   *
   */

  static async get(id) {
    const chamberRes = await db.query(
      `SELECT id,
        chamber_name,
        project_id
      FROM chamber
      WHERE project_id= $1`,
      [id]
    );
    const chambers = chamberRes.rows;

    const transformChambers = chambers.map((chamber) => ({
      id: chamber.id,
      chamberName: chamber.chamber_name,
      projectId: chamber.project_id,
    }));
    return transformChambers;
  }

  /** Update chamber name
   *
   */

  // static async update (id, chamberName) {
  //   const querySql = `UPDATE chamber
  //                     SET chamber_name=$1
  //                     WHERE id=$2
  //                     RETURNING chamber_name AS "chamberName"`,
  //                     [id, chamberName];
  //   const chamber = querySql.rows[0];

  //   if(!chamber) throw new NotFoundError(`No chamber found`);

  //   return chamber
  // }

  /**Delete given chamber from database; returns undefined
   *
   * throws NotFoundError if chamber not found
   */

  static async remove(id) {
    const result = await db.query(
      `DELETE
      FROM chamber
      WHERE id=$1
      RETURNING id`,
      [id]
    );
    const chamber = result.rows[0];

    if (!chamber) throw new NotFoundError("No chamber found");
  }
}

module.exports = Chamber;
