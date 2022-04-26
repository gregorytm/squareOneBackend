const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const jwt = require("jsonwebtoken");
const { ensureAdmin } = require("../middleware/auth");

//TODO delete this file

// search of active employees
router.get("/search", ensureAdmin, async (req, res, next) => {
  try {
    const reuslts = await db.query(
      `SELECT * FROM employees WHERE active = true`
    );
    return res.jons(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

// seach new employees
router.get("/search/unactivate", ensureAdmin, async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT * FROM employees WHERE active = false`
    );
    return res.json(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

//update status of employee to active
router.patch("/employee/:id", ensureAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const results = await db.query(
      "UPDATE employees SET active=$1, WHERE id=$2",
      [active, id]
    );
    return res.send(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

//update status of employee to active AND manager
router.patch("/manager/:id", ensureAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active, manager } = req.body;
    const results = await db.query(
      "UPDATE employees SET active=$1, manger=$2 WHERE id=$5",
      [active, manager]
    );
    return res.send(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

//delete employee from database
router.delete("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const results = db.query("DELETE FROM employees WHERE id=$1", [
      req.params.id,
    ]);
    return res.send({ msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
