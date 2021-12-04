"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helperFunctions/sql");
const { notFoundError } = require("../expressError");

/** Related functions for materials */

class Materials {
  /** Find all effected materials for a given project
   *
   * materials format { chamberId, materialName }
   *
   * Returns { chamberId, materialName }
   */

  static async findRelated(chamberId) {
    let query =
      await db.query(`SELECT affected_material.id, chamber_id, material_name
      FROM affected_material
      JOIN chamber
      ON affected_material.chamber_id = chamber.id`);
    const allMaterials = query.rows;

    const transformArray = [];

    allMaterials.map(function (el) {
      const transformMaterials = {
        id: el.id,
        chamberId: el.chamber_id,
        materialName: el.material_name,
      };
      transformArray.push(transformMaterials);
    });
    console.log("transformed materials", transformArray);
    return transformArray;
  }
}

module.exports = Materials;
