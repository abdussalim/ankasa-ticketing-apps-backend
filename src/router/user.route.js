const express = require("express");
const {
  list,
  detail,
  update,
  remove,
  updatePhoto,
} = require("../controllers/user.controller");
const upload = require("../middlewares/uploadDrive");
const userValidation = require("../validations/user.validation");
const runValidation = require("../middlewares/runValidation");
const jwtAuth = require("../middlewares/jwtAuth");

const router = express.Router();

router
  .get("/user", jwtAuth, list)
  .get("/user/:id", detail)
  .put("/user/:id", userValidation.update, update)
  .put("/user/:id/photo", upload, updatePhoto)
  .delete("/user/:id", remove);

module.exports = router;
