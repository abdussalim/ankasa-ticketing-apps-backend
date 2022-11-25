const { v4: uuidv4 } = require("uuid");
const destinationModels = require("../models/destination.model");
const { success, failed } = require("../utils/createResponse");
const { uploadGoogleDriveDestination } = require("../utils/uploadGoogleDrive");

const destinationController = {
  createDestination: async (req, res) => {
    try {
      const id = uuidv4();
      const file = req.file;
      let image = await uploadGoogleDriveDestination(file);
      const setData = {
        id,
        country: req.body.country,
        place: req.body.place,
        image: `https://drive.google.com/uc?export=view&id=${image}`,
        price: Number(req.body.price),
        totalAirline: Number(req.body.totalAirline),
        date: new Date(),
      };
      const destination = await destinationModels.createDestination(setData);
      success(res, {
        code: 200,
        payload: destination,
        message: "sucess create destination!",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "internal server error!",
      });
    }
  },
  getDestination: async (req, res) => {
    const limit = req.query.limit ? req.query.limit : 10;
    const sortType = req.query.sortType ? req.query.sortType : "DESC";
    try {
      const destination = await destinationModels.getDestination(
        sortType,
        limit
      );
      success(res, {
        code: 200,
        payload: destination.rows,
        message: "sucess get destination!",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "internal server error!",
      });
    }
  },
  getDetailDestination: async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await destinationModels.getDetailDestination(id);
      success(res, {
        code: 200,
        payload: destination.rows[0],
        message: "sucess get detail destination!",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "internal server error!",
      });
    }
  },
  updateDestination: async (req, res) => {
    try {
      const PORT = process.env.PORT;
      const DB_HOST = process.env.DB_HOST;
      let image = req.file.filename;
      const setData = {
        id: req.params.id,
        country: req.body.country,
        place: req.body.place,
        image: `http://${DB_HOST}:${PORT}/img/${image}`,
        price: Number(req.body.price),
        totalAirline: Number(req.body.totalAirline),
        date: new Date(),
      };
      const destination = await destinationModels.updateDestination(setData);
      success(res, {
        code: 200,
        payload: destination,
        message: "update destination success!",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "internal server error!",
      });
    }
  },
  deleteDestination: async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await destinationModels.deleteDestination(id);
      success(res, {
        code: 200,
        payload: destination,
        message: "delete destination success!",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "internal server error!",
      });
    }
  },
};

module.exports = destinationController;
