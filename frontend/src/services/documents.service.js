const API_PREFIX = '/api';

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error('Não foi possível conectar ao servidor.', { cause: error });
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(body?.error?.message || `Falha na requisição (HTTP ${response.status}).`);
  }

  return response;
}

export async function listDocuments(owner, { signal } = {}) {
  const query = new URLSearchParams({ owner });
  const response = await request(`/documents?${query}`, { signal });
  return response.json();
}

export async function uploadDocument(file, owner) {
  const body = new FormData();
  body.append('owner', owner);
  body.append('file', file);
  const response = await request('/upload', { method: 'POST', body });
  return response.json();
}

export async function downloadDocument(id, owner) {
  const query = new URLSearchParams({ owner });
  const response = await request(`/documents/${encodeURIComponent(id)}/download?${query}`);
  return response.blob();
}
