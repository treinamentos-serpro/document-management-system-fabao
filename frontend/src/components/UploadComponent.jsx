import { useId, useState } from 'react';
import { uploadDocument } from '../services/documents.service.js';

export default function UploadComponent({ owner, onUpload }) {
  const fileId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.file.files[0];
    setError('');
    setMessage('');

    if (!file || file.size === 0) {
      setError('Selecione um arquivo não vazio.');
      return;
    }

    setIsUploading(true);
    try {
      const document = await uploadDocument(file, owner);
      form.reset();
      setMessage('Documento enviado com sucesso.');
      onUpload(document);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section aria-label="Upload de documentos">
      <h2>Enviar documento</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor={fileId}>Arquivo </label>
        <input id={fileId} name="file" type="file" required disabled={isUploading} />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
