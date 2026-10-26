import { useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';

export default function App() {
  const [ownerInput, setOwnerInput] = useState('');
  const [owner, setOwner] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleOwnerSubmit(event) {
    event.preventDefault();
    setOwner(ownerInput.trim());
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <form onSubmit={handleOwnerSubmit}>
        <label htmlFor="owner">Usuário </label>
        <input
          id="owner"
          name="owner"
          value={ownerInput}
          onChange={(event) => setOwnerInput(event.target.value)}
          required
          pattern=".*\S.*"
        />
        <button type="submit">Carregar documentos</button>
      </form>
      {owner ? (
        <div key={owner}>
          <UploadComponent
            owner={owner}
            onUpload={() => setRefreshKey((value) => value + 1)}
          />
          <DocumentList owner={owner} refreshKey={refreshKey} />
        </div>
      ) : (
        <p>Informe um usuário para enviar, listar e baixar documentos.</p>
      )}
    </main>
  );
}
