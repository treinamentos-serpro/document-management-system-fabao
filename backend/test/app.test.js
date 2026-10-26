const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const storageDirectory = fsSync.mkdtempSync(
  path.join(os.tmpdir(), 'dms-backend-test-'),
);
process.env.STORAGE_DIR = storageDirectory;
const app = require('../src/app');

after(async () => {
  await fs.rm(storageDirectory, { recursive: true, force: true });
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa documentos do usuário dono', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const owner = `user-${crypto.randomUUID()}`;
  const form = new FormData();
  form.append('owner', owner);
  form.append('file', new Blob(['conteúdo do documento'], { type: 'text/plain' }), 'nota.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: form,
  });
  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.equal(document.originalName, 'nota.txt');
  assert.equal(document.owner, owner);
  assert.equal(document.size, Buffer.byteLength('conteúdo do documento'));
  assert.equal(typeof document.id, 'string');
  assert.equal('storageName' in document, false);

  const listResponse = await fetch(
    `${baseUrl}/documents?owner=${encodeURIComponent(owner)}`,
  );
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [document]);

  const downloadResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download?owner=${encodeURIComponent(owner)}`,
  );
  assert.equal(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /nota\.txt/);
  assert.equal(await downloadResponse.text(), 'conteúdo do documento');

  const deniedResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download?owner=outro-usuario`,
  );
  assert.equal(deniedResponse.status, 404);
});

test('rejeita upload sem owner e remove o arquivo temporário', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));
  await new Promise((resolve) => server.once('listening', resolve));
  const form = new FormData();
  form.append('file', new Blob(['conteúdo'], { type: 'text/plain' }), 'sem-owner.txt');
  const filesBefore = await fs.readdir(storageDirectory);

  const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
    method: 'POST',
    body: form,
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
  assert.deepEqual(await fs.readdir(storageDirectory), filesBefore);
});
