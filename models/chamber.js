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
   * chamber format (chamberName, project_id)
   *
   * -Returns [{ chamberName }]
   */

  static async findAll(projectId) {
    let query = `SELECT chamber_name, address
      FROM chamber
      JOIN projects
      ON chamber.project_id = projects.id`;
    return result.rows;
  }

  /** Given a chamber id, return data about job
   *
   * Returns {id, chamberName, projectName}
   *  where readings [{ id chamberId, temp, RH,
   *  moistureContent, readingDate, dayNumber}, ...]
   *
   */

  static async get(id) {
    // const chamberRes = await db.query(
    //   `SELECT id,
    //     chamber_name AS "chamberName",
    //     project_id AS "projectId"
    //   FROM chamber
    //   WHERE id = $1`, [id]
    // );

    // const chamber = chamberRes.rows[0];

    // if(!chamber) throw new NotFoundError(`No chamber: ${id}`);

    // const readingsRes = await db.query(
    //   `SELECT chamber_id AS "chamberId",
    //     temp,
    //     RH,
    //     reading_date AS "readingDate"
    //   FROM reading
    //   WHERE id= $1`, [chamber.id]
    // );
    // chamber.readings = readingsRes.rows;

    // const dehuRes = await db.query(
    //   `SELECT id,
    //     dehu_number AS "dehuNumber",
    //     chamber_id AS "chamberId",
    //     location
    //   FROM dehumidifier
    //   WHERE id= $1`, [chamber.id]
    // )
    // chamber.dehus = dehuRes.rows;

    // const materialRes = await db.query(
    //   `SELECT id,
    //     room_id AS roomId,
    //     material_name AS materialName
    //   FROM affected_material
    //   WHERE id=$1`, [chamber.id]
    // )
    // chamber.materials = materialRes.rows;

    const projectRes = await db.query(
      `SELECT id,
        insured_name AS "insuredName",
        address,
        created_at AS "createdAt",
        active
      FROM projects
      WHERE id= $1`,
      [chamber.projectId]
    );

    delete chamber.projectId;
    chamber.project = projectRes.rows[0];

    return chamber;
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
