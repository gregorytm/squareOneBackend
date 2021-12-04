"use strict";

/** Routes for affected materials */

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureActive, ensureManager } = require("../middleware/auth");
const Materials = require("../models/materials");

const router = express.Router({ mergeParams: true });

router.get("/chamber/:chamberId/material", async function (req, res, next) {
  try {
    const materials = await Materials.findRelated(req.params.chamberId);
    return res.json({ materials });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
