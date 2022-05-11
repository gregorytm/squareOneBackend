"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");
const { NotFoundError } = require("../expressError");

/** Related functions for materials */

class Material {
  /** Create new affected materials (from data), return new chamber data
   *
   * data should be { chamber_id, material_name }
   *
   * returns { chamberId, materialName }
   */

  static async create({ chamber_id: chamberId, material_name: materialName }) {
    const result = await db.query(
      `INSERT INTO affected_material (chamber_id, material_name)
    VALUES($1, $2)
    RETURNING id, chamber_id, material_name`,
      [chamberId, materialName]
    );
    let material = result.rows[0];
    return material;
  }

  /** Find all effected materials for a given chamber
   *
   * materials format { chamberId, materialName }
   *
   * Returns { chamberId, materialName }
   */

  static async findRelated(chamberId) {
    let query = await db.query(
      `SELECT affected_material.id AS "id", chamber_id AS "chamberId", material_name AS "materialName"
      FROM affected_material
      JOIN chamber
      ON affected_material.chamber_id = chamber.id
      WHERE chamber_id=$1`,
      [chamberId]
    );
    const allMaterials = query.rows;
    return allMaterials;
  }

  /**FInd last reading data given a materialId
   *
   * returns reading_date, day_number
   */

  static async getReadingData(materialId) {
    const result = await db.query(
      `SELECT id, reading_date AS "readingDate", day_number AS "dayNumber"
      FROM reading
      WHERE material_id=$1`,
      [materialId]
    );
    const lastReading = result.rows[result.rows.length - 1];

    return lastReading;
  }

  /**Find all materials and related readings for a project
   *
   * returns { dehuId, dehuNumber, location temp, RH, readingDate, dayNumber
   * JOINED with readings ON dehuId: reaidng: id, chamber_id, temp, RH, readingDate, dayNumber}
   */

  static async getReports(projectId) {
    const result = await db.query(
      `SELECT material_name, chamber_name, moisture_content, reading_date, day_number
    FROM affected_material
    JOIN reading
    ON affected_material.id = reading.material_id
    JOIN chamber
    ON chamber.id = affected_material.chamber_id
    JOIN projects
    ON projects.id = chamber.project_id
    WHERE projects.id = $1`,
      [projectId]
    );
    const materialReadings = result.rows;
    const transformReadings = materialReadings.map((chamberReading) => ({
      materialName: chamberReading.material_name,
      chamberName: chamberReading.chamber_name,
      moistureContent: chamberReading.moisture_content,
      readingDate: chamberReading.reading_date,
      dayNumber: chamberReading.day_number,
    }));
    return transformReadings;
  }

  /** Create new reading (from data), update DB, return new reading data
   *
   * data should be { material_id, moisture_content, reading_date, day_number}
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
      RETURNING id, material_id, moisture_content, reading_date, day_number`,
      [
        chamberId,
        dehuId,
        materialId,
        RH,
        temp,
        moistureContent,
        readingDate,
        dayNumber,
      ]
    );
    const reading = result.rows[0];
    return reading;
  }

  /**Delete given material from database; returns undefined
   *
   * throws NotFoundError if chamber not found
   */

  static async remove(materialId) {
    const result = await db.query(
      `DELETE
      FROM affected_material
      WHERE id=$1
      RETURNING id`,
      [materialId]
    );
    const material = result.rows[0];

    if (!material) throw new NotFoundError("No material found");
  }
}

module.exports = Material;
