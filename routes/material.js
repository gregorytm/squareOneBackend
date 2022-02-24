"use strict";

/** Routes for affected materials */
const express = require("express");
const { BadRequestError } = require("../expressError");
const Material = require("../models/material");
const router = express.Router({ mergeParams: true });
const { ensureUser, ensureManager } = require("../middleware/auth");

/**POST { material } => { material }
 *
 * material should be {chamber_id, material_name }
 *
 * Returns { id, chamber_id, material_name }
 *
 * Authorization required: active
 */

router.post("/new", ensureUser, async function (req, res, next) {
  try {
    const material = await Material.create(req.body);
    return res.status(201).json(material);
  } catch (err) {
    return next(err);
  }
});

/**POST /reading/new/
 *
 * auth required: active, assigned
 */

router.post("/reading/new", ensureUser, async function (req, res, next) {
  try {
    const materialReading = await Material.newReading(req.body);
    return res.status(201).json(materialReading);
  } catch (err) {
    return next(err);
  }
});

/** GET reading/data
 *
 * returns {readingDate, dayNumber}
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

router.get("/:id", ensureManager, async function (req, res, next) {
  try {
    const materials = await Material.findRelated(req.params.id);
    return res.json({ materials });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
