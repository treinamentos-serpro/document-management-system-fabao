import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  downloadDocument,
  listDocuments,
  uploadDocument,
} from '../src/services/documents.service.js';

test('lista documentos com owner codificado e sinal de cancelamento', async (context) => {
  const documents = [{ id: '123', originalName: 'nota.txt' }];
  const controller = new AbortController();
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/documents?owner=ana+%26+bia');
    assert.equal(options.signal, controller.signal);
    return Response.json(documents);
  });

  assert.deepEqual(
    await listDocuments('ana & bia', { signal: controller.signal }),
    documents,
  );
});

test('envia multipart com file e owner sem definir Content-Type manualmente', async (context) => {
  const file = new File(['conteúdo'], 'nota.txt', { type: 'text/plain' });
  const document = { id: '123', originalName: file.name };
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/upload');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers, undefined);
    assert.equal(options.body.get('owner'), 'ana');
    assert.equal(options.body.get('file').name, file.name);
    assert.equal(await options.body.get('file').text(), 'conteúdo');
    return Response.json(document, { status: 201 });
  });

  assert.deepEqual(await uploadDocument(file, 'ana'), document);
});

test('baixa o conteúdo binário com id e owner codificados', async (context) => {
  const bytes = new Uint8Array([0, 255, 128, 10]);
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/documents/id%2Fespecial/download?owner=ana%26bia');
    return new Response(bytes, { headers: { 'Content-Type': 'application/octet-stream' } });
  });

  const blob = await downloadDocument('id/especial', 'ana&bia');
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), bytes);
});

test('propaga erros JSON do backend nas três operações', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => Response.json(
    { error: { code: 'VALIDATION_ERROR', message: 'O campo owner é obrigatório.' } },
    { status: 400 },
  ));

  for (const operation of [
    () => listDocuments(''),
    () => uploadDocument(new File(['texto'], 'nota.txt'), ''),
    () => downloadDocument('123', ''),
  ]) {
    await assert.rejects(operation, { message: 'O campo owner é obrigatório.' });
  }
});

test('expõe falhas HTTP não JSON e falhas de rede', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () =>
    new Response('Bad Gateway', { status: 502 }));
  await assert.rejects(() => listDocuments('ana'), { message: 'Falha na requisição (HTTP 502).' });

  fetchMock.mock.mockImplementation(async () => {
    throw new TypeError('fetch failed');
  });
  await assert.rejects(() => listDocuments('ana'), {
    message: 'Não foi possível conectar ao servidor.',
  });
});

test('preserva cancelamento da requisição', async (context) => {
  const error = new DOMException('Cancelado', 'AbortError');
  context.mock.method(globalThis, 'fetch', async () => { throw error; });
  await assert.rejects(() => listDocuments('ana'), (result) => result === error);
});
