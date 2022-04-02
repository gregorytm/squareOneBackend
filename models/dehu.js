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

  static async create({
    dehu_number: dehuNumber,
    chamber_id: chamberId,
    location,
  }) {
    const result = await db.query(
      `INSERT INTO dehumidifier(
          dehu_number,
          chamber_id,
          location)
          VALUES ($1, $2, $3)
      RETURNING id, dehu_number, chamber_id, location`,
      [dehuNumber, chamberId, location]
    );
    let dehu = result.rows[0];

    return dehu;
  }

  /** Create new reading (from data), update db, return new reading data
   *
   * data should be { dehu_id, temp, RH, reading_date, day_number}
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
      RETURNING id, dehu_id, temp, RH, reading_date, day_number`,
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

  static async getReadingData(dehuId) {
    const result = await db.query(
      `SELECT id, reading_date, day_number
      FROM reading
      WHERE dehu_id=$1`,
      [dehuId]
    );
    const lastReading = result.rows[result.rows.length - 1];
    return lastReading;
  }

  /** Find all dehus for a given chamber
   *
   * dehu format (id, dehuNumber, chamberId, location)
   *
   * returns [ transformArray ]
   */

  static async findRelated(chamberId) {
    let query = await db.query(
      `SELECT dehumidifier.id, dehu_number, chamber_id, location
                FROM dehumidifier 
                JOIN chamber
                ON dehumidifier.chamber_id = chamber.id
                Where chamber_id = $1`,
      [chamberId]
    );
    const allDehus = query.rows;

    const transformArray = [];

    allDehus.map(function (el) {
      const transformDehu = {
        id: el.id,
        dehuNumber: el.dehu_number,
        chamberId: el.chamber_id,
        location: el.location,
      };
      transformArray.push(transformDehu);
    });

    return transformArray;
  }

  /**Find all dehus and related readings for a project
   *
   * returns { dehuId, dehuNumber, location temp, RH, readingDate, dayNumber
   * JOINED with readings ON dehuId: reaidng: id, chamber_id, temp, RH, readingDate, dayNumber}
   */

  static async getReports(projectId) {
    const result = await db.query(
      `SELECT dehu_Number, location, temp, RH, reading_date, day_number
    FROM dehumidifier
    JOIN reading 
    ON dehumidifier.id = reading.dehu_id
    JOIN chamber 
    ON chamber.id = dehumidifier.chamber_id
    JOIN projects
    ON projects.id = chamber.project_id
    WHERE projects.id = $1`,
      [projectId]
    );
    const chamberReadings = result.rows;
    const transformReadings = chamberReadings.map((chamberReadings) => ({
      dehuNumber: chamberReadings.dehu_number,
      location: chamberReadings.location,
      temp: chamberReadings.temp,
      rh: chamberReadings.rh,
      readingDate: chamberReadings.reading_date,
      dayNumber: chamberReadings.day_number,
    }));
    return transformReadings;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
      from dehumidifier
      WHERE id = $1
      RETURNING id`,
      [id]
    );
    const dehu = result.rows[0];

    if (!dehu) throw new NotFoundError(`No dehumidifier found`);
  }
}

module.exports = Dehu;
