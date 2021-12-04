"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");

/** Related functions for dehu's */

class Dehu {
  /**Create a dehumidifier (dehu), update dehu,
   *
   * data should be { dehuNumber, chamberId, location }
   *
   * Returns { id, dehuNumber, chamberId, location }
   */

  static async create(data) {
    const result = await db.query(
      `INSERT INTO dehumidifier(
          dehu_Number,
          chamber_id,
          location)
          VALUES ($1, $2, $3)
      RETURNING id, dehu_number AS "dehuNumber, chamberId AS "chamber_id", location`,
      [data.dehuNumber, data.chamberId, data.location]
    );
    let dehu = result.rows[0];

    return dehu;
  }

  /** Find all dehus for a given chamber
   *
   * dehu format (id, dehuNumber, chamberId, location)
   *
   * returns [ transformArray ]
   */

  static async findRelated(chamberId) {
    let query =
      await db.query(`SELECT dehumidifier.id, dehu_number, chamber_id, location
                FROM dehumidifier 
                JOIN chamber
                ON dehumidifier.chamber_id = chamber.id`);
    const allDehus = query.rows;
    console.log("allDehus", allDehus);

    const transformArray = [];

    allDehus.map(function (el) {
      const transformDehu = {
        id: el.id,
        dehuNumber: el.dehu_number,
        projectId: el.chamber_id,
        location: el.location,
      };
      transformArray.push(transformDehu);
    });
    console.log("transformArray", transformArray);

    return transformArray;
  }
}

module.exports = Dehu;
