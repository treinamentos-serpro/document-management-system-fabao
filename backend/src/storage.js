const path = require('node:path');

const defaultStorageDirectory = path.resolve(__dirname, '../storage');
const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || defaultStorageDirectory,
);
const configuredMaxFileSize = Number(process.env.UPLOAD_MAX_BYTES);
const maxFileSize = Number.isFinite(configuredMaxFileSize)
  && configuredMaxFileSize > 0
  ? configuredMaxFileSize
  : 10 * 1024 * 1024;

module.exports = { storageDirectory, maxFileSize };