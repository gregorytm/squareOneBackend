"use strict";

const db = require("../db");
const { NotFoundError } = require("./expressError");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");

/** Related functions for projects */

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

  /** Find all dehus related to chamberId
   *
   * Returns [{ id, dehuNumber, chamberId, location }]
   */

  static async findAll({ chamberId } = {}) {
    let query = `SELECT d.id,
                  d.dehuNumber,
                  d.chamberId,
                  d.location,
                  c.id
                FROM dehumidifier d
                  LEFT JOIN chamber AS c ON c.id = d.chamber_id`;
  }
}
