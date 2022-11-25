// const bcrypt = require('bcrypt');
const userModel = require("../models/user.model");
const createPagination = require("../utils/createPagination");
const { success, failed } = require("../utils/createResponse");
const deleteFile = require("../utils/deleteFile");
const { uploadGoogleDriveProfile } = require("../utils/uploadGoogleDrive");
const deleteGoogleDrive = require("../utils/deleteGoogleDrive");

module.exports = {
  list: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const count = await userModel.countAll();
      const paging = createPagination(count.rows[0].count, page, limit);
      const users = await userModel.selectAll(paging);

      success(res, {
        code: 200,
        payload: users.rows,
        message: "Select List User Success",
        pagination: paging.response,
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "Internal Server Error",
      });
    }
  },
  detail: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userModel.selectById(id);

      // jika user tidak ditemukan
      if (!user.rowCount) {
        failed(res, {
          code: 404,
          payload: `User with Id ${id} not found`,
          message: "Select Detail User Failed",
        });
        return;
      }

      success(res, {
        code: 200,
        payload: user.rows[0],
        message: "Select Detail User Success",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "Internal Server Error",
      });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await userModel.selectById(id);
      // jika user tidak ditemukan
      if (!user.rowCount) {
        failed(res, {
          code: 404,
          payload: `User with Id ${id} not found`,
          message: "Update User Failed",
        });
        return;
      }

      // jika update user disertai photo
      const { photo, email } = user.rows[0]; // email tidak boleh diubah
      await userModel.updateById(id, { ...req.body, photo, email });

      success(res, {
        code: 200,
        payload: null,
        message: "Update User Success",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "Internal Server Error",
      });
    }
  },
  updatePhoto: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await userModel.selectById(id);
      console.log(user);
      // jika user tidak ditemukan
      if (!user.rowCount) {
        // menghapus photo jika ada
        if (req.files) {
          if (req.files.photo) {
            deleteFile(req.files.photo[0].path);
          }
        }

        failed(res, {
          code: 404,
          payload: `User with Id ${id} not found`,
          message: "Update User Failed",
        });
        return;
      }

      // jika update user disertai photo
      let { photo } = user.rows[0];
      // jika ada upload photo
      if (req.files) {
        if (req.files.photo) {
          // menghapus photo sebelumnya di gd jika sebelumnya sudah pernah upload
          if (user.rows[0].photo) {
            await deleteGoogleDrive(user.rows[0].photo);
          }
          // upload photo baru ke gd
          photo = await uploadGoogleDriveProfile(req.files.photo[0]);
          // menghapus photo setelah diupload ke gd
          deleteFile(req.files.photo[0].path);
        }
      }

      await userModel.updatePhoto(user.rows[0].id, photo);

      success(res, {
        code: 200,
        payload: null,
        message: "Update User Photo Success",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "Internal Server Error",
      });
    }
  },
  // updatePhoto: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { rowCount, rows } = await userModel.selectById(id);

  //     // jika user tidak ditemukan
  //     if (!rowCount) {
  //       // menghapus photo jika ada
  //       if (req.file) {
  //         deleteFile(req.file.path);
  //       }

  //       failed(res, {
  //         code: 404,
  //         payload: `User with Id ${id} not found`,
  //         message: "Update User Failed",
  //       });
  //       return;
  //     }

  //     // jika update user disertai photo
  //     let { photo } = rows[0];
  //     if (req.file) {
  //       if (photo) {
  //         console.log(photo);
  //         const photoGoogleDriveID = photo
  //           .split("id=")[1]
  //           .split("&sz")[0];
  //         await deleteGoogleDrive(photoGoogleDriveID);
  //         console.log(photoGoogleDriveID);
  //       }
  //       // upload photo baru ke gd
  //       thumbnail = await uploadGoogleDriveProfile(request.file);
  //       console.log(thumbnail);
  //     }
  //     await userModel.updatePhoto(id, photo);

  //     success(res, {
  //       code: 200,
  //       payload: null,
  //       message: "Update User Photo Success",
  //     });
  //   } catch (error) {
  //     failed(res, {
  //       code: 500,
  //       payload: error.message,
  //       message: "Internal Server Error",
  //     });
  //   }
  // },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userModel.selectById(id);

      // jika user tidak ditemukan
      if (!user.rowCount) {
        failed(res, {
          code: 404,
          payload: `User with Id ${id} not found`,
          message: "Delete User Failed",
        });
        return;
      }
      await userModel.removeById(id);

      // menghapus photo jika ada
      if (user.rows[0].photo) {
        deleteFile(`public/${user.rows[0].photo}`);
      }

      success(res, {
        code: 200,
        payload: null,
        message: "Delete User Success",
      });
    } catch (error) {
      failed(res, {
        code: 500,
        payload: error.message,
        message: "Internal Server Error",
      });
    }
  },
};
