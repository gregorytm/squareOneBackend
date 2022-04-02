"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for chambers */

class Chamber {
  /** Create a chamber(from data), update chamber return new chamber data
   *
   * data should be { chamber_name, project_id }
   *
   * Returns { chamerName, projectId }
   */

  static async create({ chamber_name: chamberName, project_id: projectId }) {
    const result = await db.query(
      `INSERT INTO chamber (chamber_name, project_id)
    VALUES ($1, $2)
    RETURNING id, chamber_name, project_id`,
      [chamberName, projectId]
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
    let query = await db.query(
      `SELECT chamber.id, chamber_name, project_id
      FROM chamber
      JOIN projects
      ON chamber.project_id = projects.id
      WHERE project_id = $1`,
      [projectId]
    );
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
      WHERE id = $1`,
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

  /** Find last reading data given an chamberId
   *
   * returns
   */

  static async getReadingData(chamberId) {
    const result = await db.query(
      `SELECT id, reading_date, day_number
      FROM reading
      WHERE chamber_id=$1`,
      [chamberId]
    );
    const lastReading = result.rows[result.rows.length - 1];

    return lastReading;
  }

  /**Find all chambers and related readings for a project
   *
   * returns { chamberId, chamberName, projectId,
   * JOINED with readings ON chamberId: reaidng: id, chamber_id, temp, RH, readingDate, dayNumber}
   */

  static async getReports(projectId) {
    const result = await db.query(
      `SELECT chamber_name, temp, RH, reading_date, day_number
    FROM chamber
    JOIN reading
    ON chamber.id =reading.chamber_id
    WHERE chamber.project_id = $1`,
      [projectId]
    );
    const chamberReadings = result.rows;
    const transformReadings = chamberReadings.map((chamberReadings) => ({
      chamberName: chamberReadings.chamber_name,
      temp: chamberReadings.temp,
      rh: chamberReadings.rh,
      readingDate: chamberReadings.reading_date,
      dayNumber: chamberReadings.day_number,
    }));
    return transformReadings;
  }

  /**Create new reading  (from data), update db, return new reading data
   *
   * data should be { chamber_id, temp, RH, reading_date, day_number}
   *
   * Returns { id, insured_name, address, created_at, day_number}
   */

  static async newReading({
    chamber_id: chamberId,
    dehu_id: dehuId,
    material_id: materialId,
    temp,
    RH,
    moisture_content: moistureContent,
    reading_date: readingDate,
    day_number: dayNumber,
  }) {
    const result = await db.query(
      `INSERT INTO reading
      (chamber_id, dehu_id, material_id, temp, RH, moisture_content, reading_date, day_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, chamber_id, temp, RH, reading_date, day_number`,
      [
        chamberId,
        dehuId,
        materialId,
        temp,
        RH,
        moistureContent,
        readingDate,
        dayNumber,
      ]
    );
    const reading = result.rows[0];
    return reading;
  }

  /**Delete given chamber from database; returns undefined
   *
   * throws NotFoundError if chamber not found
   */

  static async remove(chamberId) {
    const result = await db.query(
      `DELETE
      FROM chamber
      WHERE id=$1
      RETURNING id`,
      [chamberId]
    );
    const chamber = result.rows[0];

    if (!chamber) throw new NotFoundError("No chamber found");
  }
}

module.exports = Chamber;
