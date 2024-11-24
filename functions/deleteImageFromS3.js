const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../models/AWS');

const deleteImageFromS3 = async (fileName) => {
  // Decode the file name to handle URL encoding
  const decodedFileName = decodeURIComponent(fileName);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `images/${decodedFileName}`,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    console.log(`Successfully deleted ${decodedFileName} from S3.`);
  } catch (error) {
    console.error(`Error deleting ${decodedFileName}:`, error);
    throw new Error('Failed to delete image from S3');
  }
};

module.exports = deleteImageFromS3;
