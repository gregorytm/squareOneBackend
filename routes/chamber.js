"use strict";

/** Routes for chambers */
const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureUser, ensureManager } = require("../middleware/auth");
const Chamber = require("../models/chamber");

const jsonschema = require("jsonschema");
const chamberNewSchema = require("../schemas/chamberNew");
const chamberReadingSchema = require("../schemas/chamberReading");
const chamberUpdateSchema = require("../schemas/chamberUpdate");

const router = express.Router({ mergeParams: true });

/**GET /[projId]/chamber/:chamberId
 *
 * Returns {id, chamber_name, project_id }
 *
 * auth required: active status
 */

router.get("/:chamberId", ensureUser, async function (req, res, next) {
  try {
    const chamber = await Chamber.get(req.params.chamberId);
    return res.json({ chamber });
  } catch (err) {
    return next(err);
  }
});

/** GET /reading/data => { data }
 *
 * returns data and tiem of last reading { id, reading_date, day_number }
 *
 * auth required: active manager
 */

router.get(
  `/:chamberId/reading/data`,
  ensureUser,
  async function (req, res, next) {
    try {
      const chamberData = await Chamber.getReadingData(req.params.chamberId);
      return res.json({ chamberData });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /reading/new => {reading}
 *
 * returns 201 { chamber_id, dehu_id, material_id, temp, RH, moisture_content,
 * reading_date, day_number }
 *
 * throws BadRequestError if schema check fails
 *
 * auth required: ensureUser
 */

router.post("/reading/new", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, chamberReadingSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const chamberReading = await Chamber.newReading(req.body);
    return res.status(201).json(chamberReading);
  } catch (err) {
    return next(err);
  }
});

/**POST / {chamber} => { chamber }
 *
 * chamber should be { chamberName, projectId }
 *
 * Returns { id, chamberName, projectId}
 *
 * authorization required: ensureUser
 */

router.post("/:projId/new", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, chamberNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const chamber = await Chamber.create(req.body);
    return res.status(201).json({ chamber });
  } catch (err) {
    return next(err);
  }
});

/** PATCH/ [chamberId] { chamberName}
 *
 * Only chamberName can be changed
 *
 * RETURNS { id, chamberName, projectId }
 */

router.patch("/:id", ensureManager, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, chamberUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const chamber = await Chamber.update(req.body);
    return res.json({ chamber });
  } catch (err) {
    return next(err);
  }
});

/** GET /[projId]/chambers  => { chambers }
 *
 * Returns { chamber.id, chamber_name, project_id }
 *
 * auth required :active status
 */
router.get("/project/:projId/", ensureUser, async function (req, res, next) {
  try {
    const chambers = await Chamber.findRelated(req.params.projId);
    return res.json({ chambers });
  } catch (err) {
    return next(err);
  }
});

/** GET /reading/[readingid]
 *
 * Returns { id, chamberId, chamberName, temp, rh, readingDate, dayNumber }
 *
 * auth required: manager
 */

router.get(
  `/reading/:readingId`,
  ensureManager,
  async function (req, res, next) {
    try {
      const chamberReadingDetails = await Chamber.getReadingDetails(
        req.params.readingId
      );
      return res.json({ chamberReadingDetails });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /reading/[readingId]
 *
 * returns { deleted: id}
 *
 * Authorization required: manager
 */

router.delete(
  "/reading/:readingId",
  ensureManager,
  async function (req, res, next) {
    try {
      await Chamber.removeReadingEntry(req.params.readingId);
      return res.json({ deleted: req.params.readingId });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[id] => { deleted: id }
 *
 * Authorization required: manager
 */

router.delete("/:chamberId", ensureManager, async function (req, res, next) {
  try {
    await Chamber.remove(req.params.chamberId);
    return res.json({ deleted: req.params.chamberId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
