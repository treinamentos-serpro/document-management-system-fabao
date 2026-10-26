const crypto = require('node:crypto');
const fs = require('node:fs');
const express = require('express');
const multer = require('multer');
const { storageDirectory, maxFileSize } = require('../storage');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename: (req, file, callback) => {
    callback(null, crypto.randomUUID());
  },
});
const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
});

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;