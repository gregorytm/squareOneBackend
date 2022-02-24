"use strict";

/** Routes for chambers */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureUser, ensureManager } = require("../middleware/auth");
const Chamber = require("../models/chamber");
const chamberNewSchema = require("../schemas/chamberNew");
const chamberSearchSchema = require("../schemas/chamberSearch");
const chamberUpdateSchema = require("../schemas/chamberUpdate");

const router = express.Router({ mergeParams: true });

/**POST / {chamber} => { chamber }
 *
 * chamber should be { chamberName, projectId }
 *
 * Returns { id, chamberName, projectId}
 *
 * authorization required: active
 */

router.post("/", ensureUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, chamberNewSchema);
    if (!validator.valid) {
      const errs = validator.erros.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const chamber = await Chamber.create(req.body);
    return res.status(201).json({ chamber });
  } catch (err) {
    return next(err);
  }
});

/**GET / =>
 * {chambers: [{id, chamberName, projectId }, ...] }
 *
 * all chambers for given project
 *
 * Authorization required: active
 */

router.get("/", ensureUser, async function (req, res, next) {
  try {
    const chambers = await Chamber.findRelated(req.params);
    return res.json({ chambers });
  } catch (err) {
    return next(err);
  }
});

/**Get /[id] => { chamber }
 *
 * Returns related chamber {id, chamber_name, project_id}
 * Where chamber is { id }
 *
 * Authorization required: none
 */

router.get("/:id", ensureUser, async function (req, res, next) {
  try {
    const chamber = await Chamber.get(req.params.id);
    return res.json({ chamber });
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

    const chamber = await Chamber.update(req.params.id, req.body);
    return res.json({ chamber });
  } catch (err) {
    return next(err);
  }
});

/** GET/ reading/data
 *
 * returns {readingDate, dayNumber}
 */

router.get(
  `/:chamberId/reading/data`,
  ensureManager,
  async function (req, res, next) {
    try {
      const chamberData = await Chamber.getReadingData(req.params.chamberId);
      return res.json({ chamberData });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /reading/new*/

router.post("/reading/new", ensureUser, async function (req, res, next) {
  try {
    const chamberReading = await Chamber.newReading(req.body);
    return res.status(201).json(chamberReading);
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => { deleted: id }
 *
 * Authorization required: manager
 */

router.delete("/:id", ensureManager, async function (req, res, next) {
  try {
    await Chamber.remove(req.params.chamberId);
    return res.json({ deleted: req.params.chamberId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
