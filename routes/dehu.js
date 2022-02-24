"use strict";

/** Routes for dehus  */
const express = require("express");
const { BadRequrestError } = require("../expressError");
const { ensureUser, ensureManager } = require("../middleware/auth");
const Dehu = require("../models/dehu.js");
const router = express.Router({ mergeParams: true });

//to be removeed later
const ExpressError = require("../expressError");
const db = require("../db");

/** POST { dehu } => { dehu }
 *
 * dehu should be { dehu_number chamber_id, location }
 *
 * Returns { id, dehu_number, chamber_id, location }
 *
 * Authorization required: admin
 */

router.post("/new", ensureUser, async function (req, res, next) {
  try {
    const dehu = await Dehu.create(req.body);
    return res.status(201).json(dehu);
  } catch (err) {
    return next(err);
  }
});

/**Get =>
 * {dehu: [{id, dehuNumber, chamberId, location},...] }
 *
 * all dehu's for a given chamber
 *
 * Authorization required: active
 */

router.get("/:id", ensureUser, async function (req, res, next) {
  try {
    const dehus = await Dehu.findRelated(req.params.id);
    return res.json({ dehus });
  } catch (err) {
    return next(err);
  }
});

/** GET/ reading/data
 *
 * returns {readingDate, daynumber}
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

/** POST /reading/new/
 *
 * auth required: active, assigned
 */

router.post("/reading/new", ensureUser, async function (req, res, next) {
  try {
    const chamberReading = await Dehu.newReading(req.body);
    return res.status(201).json(chamberReading);
  } catch (err) {
    return next(err);
  }
});

//update dehu
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

router.delete("/:id", ensureManager, async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = db.query("DELETE FROM dehumidifier WHERE id =$1", [
      req.params.id,
    ]);
    return (res.send = { msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
