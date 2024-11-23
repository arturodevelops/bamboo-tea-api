const multer = require('multer');
const multerS3 = require('multer-s3');
const {s3} = require('../models/AWS')

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => cb(null, `images/${Date.now()}_${file.originalname}`), // Define the file key
  }),
});

module.exports = upload;
