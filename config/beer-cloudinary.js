const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const storage = cloudinaryStorage({
  cloudinary,
  folder: "image",
  allowedFormats: ["jpg", "png"],
  transformation: [
    {
      height: 4000,
      width: 2000,
      crop: "thumb",
      gravity: "auto:classic"
    }
  ],

  filename: function(req, res, cb) {
    cb(null, res.originalname);
  }
});

const uploadCloud = multer({ storage });
module.exports = uploadCloud;
