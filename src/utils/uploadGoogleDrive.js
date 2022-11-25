const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
  DRIVE_REFRESH_TOKEN,
} = require("./env");
const { google } = require("googleapis");
const fs = require("fs");

// oauth2 config
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: DRIVE_REFRESH_TOKEN });

const uploadGoogleDriveProfile = async (file) => {
  try {
    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    // upload to gd
    const response = await drive.files.create({
      requestBody: {
        name: file.filename,
        mimeType: file.mimetype,
        parents: ["1rUie5CjWJt0K99_urACAWMGhUy7Ru6iP"],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },
    });

    // set permission
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // get gd link
    const result = await drive.files.get({
      fileId: response.data.id,
      //   fields: "webViewLink, webContentLink",
    });

    return response.data.id;
    //   gdLink: result.data.webViewLink,
  } catch (error) {
    console.log(error);
  }
};

const uploadGoogleDriveDestination = async (file) => {
  try {
    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    // upload to gd
    const response = await drive.files.create({
      requestBody: {
        name: file.filename,
        mimeType: file.mimetype,
        parents: ["1QsD4NDN_2kWZGZBUnhUIhhupJ0rtpb_l"],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },
    });

    // set permission
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // get gd link
    const result = await drive.files.get({
      fileId: response.data.id,
      //   fields: "webViewLink, webContentLink",
    });

    return response.data.id;
    //   gdLink: result.data.webViewLink,
  } catch (error) {
    console.log(error);
  }
};

module.exports = { uploadGoogleDriveProfile, uploadGoogleDriveDestination };
