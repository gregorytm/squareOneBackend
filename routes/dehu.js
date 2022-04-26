"use strict";

/** Routes for dehus  */
const express = require("express");
const jsonschema = require("jsonschema");
const dehuNewSchema = require("../schemas/dehuNew.json");
const dehuReadingSchema = require("../schemas/dehuReading.json");
const { BadRequestError } = require("../expressError");
const { ensureUser, ensureManager } = require("../middleware/auth");
const Dehu = require("../models/dehu.js");
const router = express.Router({ mergeParams: true });

//to be removeed later
const ExpressError = require("../expressError");
const db = require("../db");

/** POST /new  => { dehu }
 *
 * dehu should be { dehu_number chamber_id, location }
 *
 * Returns { id, dehu_number, chamber_id, location }
 *
 * Authorization required: admin
 */

router.post("/new", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, dehuNewSchema);
    console.log("dehu test", req.body);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const dehu = await Dehu.create(req.body);
    return res.status(201).json({ dehu });
  } catch (err) {
    return next(err);
  }
});

/**GET /[id] => { dehus }
 *
 * all dehu's for a given chamber { dehumidifier.id, dehu_number, chamber_id, location }
 *
 * Authorization required: active status
 */

router.get("/:id", ensureUser, async function (req, res, next) {
  try {
    const dehus = await Dehu.findRelated(req.params.id);
    return res.json({ dehus });
  } catch (err) {
    return next(err);
  }
});

/** GET /[dehuId]/reading/data => { readingData }
 *
 * returns last date and time for reading { readingDate, daynumber }
 *
 * auth required: active manager
 */

router.get(
  `/:dehuId/reading/data`,
  ensureManager,
  async function (req, res, next) {
    try {
      const dehuData = await Dehu.getReadingData(req.params.dehuId);
      return res.json({ dehuData });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /reading/new/ => { readingData }
 *
 * requires { chamber_id, dehu_id, material_id, temp, RH, moisture_content,
 *            reading_date, day_number }
 *
 * returns 201 { id, dehu_id, temp, RH, reading_date, day_number }
 * auth required: active, assigned
 */

router.post("/reading/new", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, dehuReadingSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const dehuReading = await Dehu.newReading(req.body);
    return res.status(201).json(dehuReading);
  } catch (err) {
    return next(err);
  }
});

//TODO: impliment or delete
/** PATCH /[id] => dehuData
 * requires
 */
router.patch("/:id", ensureManager, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dehu_number, chamber_id, location } = req.body;
    const results = await db.query(
      "UPDATE projects SET dehu_number=$1, chamer_id=$2, location=$3 WHERE id=$5 RETURNING dehu_number, chamber_id, location",
      [{ dehu_number, chamber_id, location }]
    );
    return res.send(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

/** DELETE /[id] => { deleted: id }
 *
 * Authorization required: manager
 */

router.delete("/:dehuId", ensureManager, async function (req, res, next) {
  try {
    await Dehu.remove(req.params.dehuId);
    return res.json({ deleted: req.params.dehuId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
