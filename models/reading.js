"use strict";

const db = require("../db");

/** Related functions for readings */

class Reading {
  /** Create a new reading on either chamber, dehu, or affected material
   *
   * data should be when coming from chamber or dehu's
   *  { (chamber_id, dehu_id), temp, RH, reading_date, day_number}
   *
   * when coming from affected material
   * { material_id, mositure_content, reading_date, day_number}
   *
   * Returns { related data }
   */

  static async create(data) {
    if (data.chamberId !== undefined) {
      let result = await db.query(
        `INSERT INTO reading (chamber_id, temp, RH, reading_date, day_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, chamber_id, temp, RH, reading_date, day_number`,
        [data.chamberId, data.temp, data.RH, data.readingDate, data.dayNumber]
      );
      let chamber = result.rows[0];
      return chamber;
    } else if (data.dehumidifierId !== undefined) {
      let result = await db.query(
        `INSERT INTO (dehumidifier_id, temp, RH, reading_date, day_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, dehumidifier_id, temp, RH, reading_date, day_number`,
        [data.dehuId, data.temp, data.RH, data.readingDate, data.dayNumber]
      );
      let dehu = result.rows[0];
      return dehu;
    } else {
      let result = await db.query(
        `INSERT INTO (material_id, moisture_content, reading_date, day_number)
        VALUES ($1,$2, $3, $4, $5)
        RETURNING id, material_id, moisture_content, reading_date, day_number`,
        [
          data.materialId,
          data.moistureContent,
          data.readingDate,
          data.dayNumber,
        ]
      );
      let material = result.rows[0];
      return material;
    }
  }

  /** Find all readings for a given chamber, dehu, or affected material
   *
   * readings format { id, chamberId, dehuId, materialId, temp,
   *  RH, moistureContent, readingDate, dayNumber}
   *
   * Returns
   * {chamberId, dehuId, materialId, temp, RH, mostureContent, readingDate, dayNumber}
   */

  static async findChamberReadings(chamberId) {
    let query = await db.query(
      `SELECT chamber_id, temp, RH, reading_date, day_number
      FROM reading
      JOIN chamber
      ON reading.id = chamber.id`
    );
    const allChamberReadings = query.rows;

    const transformArray = [];

    allChamberReadings.map(function (el) {
      const transformReadings = {
        chamberId: el.chamber_id,
        temp: el.temp,
        rh: el.RH,
        readingDate: el.reading_date,
        dayNumber: el.day_number,
      };
      transformArray.push(transformReadings);
    });
    return transformArray;
  }

  static async findMaterialReadings(materialId) {
    let query = await db.query(
      `SELECT material_id, moisture_content, reading_date, day_number
      FROM reading
      JOIN affected_material
      ON reading.material_id = affected_material.id`
    );
    const allMaterialReadings = query.rows;

    const transformArray = [];

    allMaterialReadings.map(function (el) {
      const transformReading = {
        materialId: el.material_id,
        moistureContent: el.moisture_content,
        readingDate: el.reading_date,
        dayNumber: el.day_number,
      };
      transformArray.push(transformReading);
    });
    return transformArray;
  }

  static async findDehuReadings(dehuId) {
    let query =
      await db.query(`SELECT dehu_id, temp, RH, reading_date, day_number
    FROM reading
    JOIN dehumidifier
    ON reading.dehu_id = dehumidifier.id`);
    const allDehuReadings = query.rows;

    const transformArray = [];

    allDehuReadings.map(function (el) {
      const transformReading = {
        dehuID: el.dehu_id,
        temp: el.temp,
        rh: el.RH,
        readingDate: el.reading_date,
        dayNumber: day_number,
      };
      transformArray.push(transformMaterials);
    });
    return transformArray;
  }
}

module.exports = Reading;
