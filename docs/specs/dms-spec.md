# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem documentos, mantendo os arquivos no filesystem local e seus metadados em memória.

## 2. Escopo

### Dentro do escopo

- Enviar um arquivo e associá-lo a um identificador de usuário.
- Listar documentos associados a um usuário.
- Baixar um documento pelo identificador, validando o usuário informado.
- Armazenar arquivos em `backend/storage` com `multer` e `diskStorage`.
- Manter metadados em memória durante a execução do processo.
- Apresentar no frontend os fluxos de envio, listagem e download.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Persistência de metadados em banco de dados.
- Autenticação, autorização robusta ou gestão de contas.
- Versionamento, edição, exclusão ou compartilhamento de documentos.
- Pré-visualização ou conversão de arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo junto com seu identificador (`owner`). |
| RF-02 | O sistema rejeita envio sem arquivo, sem `owner` ou com arquivo vazio. |
| RF-03 | O sistema gera um identificador único e registra nome original, tamanho, data/hora, usuário dono e tipo de mídia. |
| RF-04 | O usuário pode listar os documentos associados ao `owner` informado. |
| RF-05 | O usuário pode baixar um documento pelo identificador, desde que informe o mesmo `owner` associado ao documento. |
| RF-06 | O download preserva o nome original como nome sugerido ao salvar o arquivo. |
| RF-07 | A aplicação mantém o endpoint `GET /health` existente para verificação de disponibilidade. |
| RF-08 | Erros da API são retornados em formato JSON consistente, sem expor caminhos internos ou detalhes sensíveis. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Arquivos são gravados exclusivamente no filesystem local, em `backend/storage`, usando `multer` com `diskStorage`. |
| RNF-02 | Metadados ficam em memória e são perdidos quando o processo backend é reiniciado. |
| RNF-03 | O backend permanece em CommonJS, com Express e dependências já presentes no projeto. |
| RNF-04 | O frontend permanece em React + Vite e consome a API por `fetch`, usando o prefixo `/api` do proxy existente. |
| RNF-05 | A porta do backend é configurável por `PORT`, com padrão `3000`. |
| RNF-06 | O limite de tamanho do upload é configurável por `UPLOAD_MAX_BYTES`, com padrão de 10 MiB. |
| RNF-07 | O nome físico do arquivo é gerado pelo sistema; o nome original não é usado para construir caminhos no filesystem. |
| RNF-08 | O sistema não expõe o caminho físico de armazenamento nas respostas da API. |
| RNF-09 | A API aceita arquivos de qualquer tipo de mídia nesta fase; não há allowlist de extensões ou MIME types. |

## 5. Modelo de dados

### Metadados do documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | API e interno | Identificador único, gerado pelo backend. |
| `originalName` | string | API e interno | Nome original enviado pelo usuário. |
| `size` | number | API e interno | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | API e interno | Data e hora do envio em ISO 8601. |
| `owner` | string | API e interno | Identificador do usuário dono, fornecido na requisição. |
| `mimeType` | string | API e interno | Tipo de mídia informado pelo upload, com fallback `application/octet-stream`. |
| `storageName` | string | Apenas interno | Nome gerado para o arquivo no filesystem; nunca retornado pela API. |

Os metadados são mantidos em memória pelo repositório durante a vida do processo. Os arquivos são persistidos em `backend/storage`. Após reinício, os arquivos podem permanecer no disco sem metadados associados; recuperação ou limpeza desses arquivos não faz parte desta versão.

O campo `owner` é apenas um identificador informado pelo cliente. Sem autenticação, ele não constitui uma barreira de segurança.

## 6. Contratos de API

As rotas do backend não incluem `/api`. No desenvolvimento, o proxy do Vite remove esse prefixo antes de encaminhar as requisições ao backend.

Formato de erro comum:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição compreensível do erro."
  }
}