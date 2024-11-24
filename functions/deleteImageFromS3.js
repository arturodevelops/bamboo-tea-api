const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../models/AWS');

const deleteImageFromS3 = async (fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `images/${fileName}`,
  };
  try {
    await s3.send(new DeleteObjectCommand(params));
    console.log(`Successfully deleted ${fileName} from S3.`);
  } catch (error) {
    console.error(`Error deleting ${fileName}:`, error);
    throw new Error('Failed to delete image from S3');
  }
};

module.exports = deleteImageFromS3
