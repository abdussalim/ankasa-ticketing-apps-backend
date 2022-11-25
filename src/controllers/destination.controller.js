const { v4: uuidv4 } = require("uuid");
const destinationModels = require("../models/destination.model");
const { success, failed } = require("../utils/createResponse");
const deleteGoogleDrive = require("../utils/deleteGoogleDrive");
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
        image: `https://drive.google.com/thumbnail?id=${image}&sz=s1080
`,
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
      const id = req.params.id;
      const { rowCount, rows } = await destinationModels.getDetailDestination(
        id
      );
      if (!rowCount) {
        return next(createError(403, "ID is Not Found"));
      }

      let { image } = rows[0];

      if (req.file) {
        // menghapus image sebelumnya di gd jika sebelumnya sudah pernah upload
        if (image) {
          console.log(image);
          const imageGoogleDriveID = image.split("id=")[1].split("&sz")[0];
          await deleteGoogleDrive(imageGoogleDriveID);
        }
        // upload photo baru ke gd
        image = await uploadGoogleDriveDestination(req.file);
      }

      const setData = {
        id,
        country: req.body.country,
        place: req.body.place,
        image: `https://drive.google.com/thumbnail?id=${image}&sz=s1080`,
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
