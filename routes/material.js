"use strict";

/** Routes for affected materials */
const express = require("express");
const jsonschema = require("jsonschema");
const materialNewSchema = require("../schemas/materialNew.json");
const materialReadingSchema = require("../schemas/materialReading.json");
const { BadRequestError } = require("../expressError");
const Material = require("../models/material");
const router = express.Router({ mergeParams: true });
const { ensureUser, ensureManager } = require("../middleware/auth");

/**POST /new => { material }
 *
 * material should be {chamber_id, material_name }
 *
 * Returns { id, chamber_id, material_name }
 *
 * Authorization required: active status
 */

router.post("/new", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, materialNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const material = await Material.create(req.body);
    return res.status(201).json(material);
  } catch (err) {
    return next(err);
  }
});

/**GET /[:projId]/chamber/[chamberId]/material
 *
 * returns { affected_material.id, chamber_id, material_name }
 *
 * auth required: active status
 */

router.get("/:chamberId", ensureUser, async function (req, res, next) {
  try {
    const material = await Material.findRelated(req.params.chamberId);
    return res.json({ material });
  } catch (err) {
    return next(err);
  }
});

/**POST /reading/new
 *
 * material should be { chamber_id, dehu_id, material_id, temp, RH,
 *                      moisture_content, reading_date, day_number }
 *
 * only values in materi_id, moisture_content, reading_date, day_number
 *
 * auth required: active status
 */

router.post("/reading/new", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, materialReadingSchema);
    console.log("test", validator.valid);
    if (!validator.valid) {
      const errs = validator.erros.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const materialReading = await Material.newReading(req.body);
    return res.status(201).json(materialReading);
  } catch (err) {
    return next(err);
  }
});

/** GET /[materialId]/reading/data
 *
 * returns { id, readingDate, dayNumber }
 *
 * auth required: active status
 */

router.get(
  `/:materialId/reading/data`,
  ensureUser,
  async function (req, res, next) {
    try {
      const materialData = await Material.getReadingData(req.params.materialId);
      return res.json({ materialData });
    } catch (err) {
      return next(err);
    }
  }
);

/**GET /[id]
 *
 * returns {  affected_material.id, chamber_id, material_name }
 *
 * auth required: active status
 */

router.get("/:id", ensureManager, async function (req, res, next) {
  try {
    const materials = await Material.findRelated(req.params.id);
    return res.json({ materials });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => { deleted: id }
 *
 * Authorization required: manager
 */

router.delete("/:materialId", ensureManager, async function (req, res, next) {
  try {
    await Material.remove(req.params.materialId);
    return res.json({ deleted: req.params.materialId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
