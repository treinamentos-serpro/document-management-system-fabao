const crypto = require('node:crypto');
const path = require('node:path');
const documentsRepository = require('../repositories/documents.repository');
const { storageDirectory } = require('../storage');

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype || 'application/octet-stream',
    storageName: file.filename,
  };

  return toPublicDocument(documentsRepository.save(document));
}

function listDocuments(owner) {
  return documentsRepository.findAllByOwner(owner).map(toPublicDocument);
}

function getDownload(id, owner) {
  const document = documentsRepository.findById(id);
  if (!document || document.owner !== owner) {
    return null;
  }

  return {
    filePath: path.join(storageDirectory, document.storageName),
    originalName: document.originalName,
    mimeType: document.mimeType,
  };
}

module.exports = { createDocument, listDocuments, getDownload };