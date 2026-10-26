const fs = require('node:fs/promises');
const documentsService = require('../services/documents.service');

function sendValidationError(res, message) {
  return res.status(400).json({
    error: { code: 'VALIDATION_ERROR', message },
  });
}

async function removeUploadedFile(file) {
  if (!file) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function uploadDocument(req, res, next) {
  const owner = typeof req.body.owner === 'string' ? req.body.owner.trim() : '';
  if (!owner) {
    try {
      await removeUploadedFile(req.file);
    } catch (error) {
      return next(error);
    }
    return sendValidationError(res, 'O campo owner é obrigatório.');
  }

  if (!req.file || req.file.size === 0) {
    try {
      await removeUploadedFile(req.file);
    } catch (error) {
      return next(error);
    }
    return sendValidationError(res, 'Envie um arquivo não vazio.');
  }

  try {
    const document = documentsService.createDocument(req.file, owner);
    return res.status(201).json(document);
  } catch (error) {
    try {
      await removeUploadedFile(req.file);
    } catch (cleanupError) {
      return next(cleanupError);
    }
    return next(error);
  }
}

function listDocuments(req, res) {
  const owner = typeof req.query.owner === 'string' ? req.query.owner.trim() : '';
  if (!owner) {
    return sendValidationError(res, 'O parâmetro owner é obrigatório.');
  }

  return res.json(documentsService.listDocuments(owner));
}

function downloadDocument(req, res, next) {
  const owner = typeof req.query.owner === 'string' ? req.query.owner.trim() : '';
  if (!owner) {
    return sendValidationError(res, 'O parâmetro owner é obrigatório.');
  }

  const document = documentsService.getDownload(req.params.id, owner);
  if (!document) {
    return res.status(404).json({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
    });
  }

  return res.download(
    document.filePath,
    document.originalName,
    { headers: { 'Content-Type': document.mimeType } },
    (error) => {
      if (!error) {
        return;
      }
      if (res.headersSent) {
        return next(error);
      }
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: { code: 'DOCUMENT_FILE_NOT_FOUND', message: 'Arquivo não encontrado.' },
        });
      }
      return next(error);
    },
  );
}

module.exports = { uploadDocument, listDocuments, downloadDocument };