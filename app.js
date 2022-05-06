"use strict";

/** Express app for Square one Restorations */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const projectRoutes = require("./routes/projects");
const chamberRoutes = require("./routes/chamber");
const dehuRoutes = require("./routes/dehu");
const materialRoutes = require("./routes/material");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/employee", employeeRoutes);
app.use("/projects", projectRoutes);
app.use("/chamber", chamberRoutes);
app.use("/dehu", dehuRoutes);
app.use("/material", materialRoutes);

//404 error handler == matches everything
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

//general error handler, anything undandled goes here
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
