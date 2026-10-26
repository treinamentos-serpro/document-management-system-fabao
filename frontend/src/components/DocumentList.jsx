import { useEffect, useState } from 'react';
import { listDocuments } from '../services/documents.service.js';
import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ owner, refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');

    async function loadDocuments() {
      try {
        const result = await listDocuments(owner, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setDocuments(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();
    return () => controller.abort();
  }, [owner, refreshKey, retryKey]);

  return (
    <section aria-label="Lista de documentos" aria-busy={isLoading}>
      <h2>Documentos de {owner}</h2>
      {isLoading ? (
        <p role="status">Carregando documentos...</p>
      ) : error ? (
        <>
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
            Tentar novamente
          </button>
        </>
      ) : documents.length === 0 ? (
        <p>Nenhum documento encontrado.</p>
      ) : (
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              <p>
                {document.originalName} — {document.size.toLocaleString('pt-BR')} bytes
                {' — '}{new Date(document.uploadedAt).toLocaleString('pt-BR')}
              </p>
              <DownloadButton document={document} owner={owner} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
