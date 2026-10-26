# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey fabaosilva!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-serpro/document-management-system-fabao/issues/1)

---

## Executar a aplicação localmente

Em dois terminais, execute:

```sh
cd backend
npm install
npm start
```

```sh
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`, informe um usuário e clique em **Carregar
documentos**. Selecione um arquivo não vazio e clique em **Enviar**; a lista é
atualizada automaticamente. Use **Baixar** ao lado de cada documento para salvar
o arquivo com seu nome original.

O [cliente de API](frontend/src/services/documents.service.js) usa `fetch` com o
prefixo `/api`, encaminhado pelo proxy do Vite para `http://localhost:3000`.
O usuário informado corresponde ao campo `owner` exigido pelo backend; não é
autenticação. Arquivos permanecem no armazenamento local e metadados em memória
são perdidos ao reiniciar o backend.

Validação do frontend:

```sh
cd frontend
node --test
npm run build
```

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
