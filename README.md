# 🍕 PizzaOne - Sistema Completo de Pedidos 🍕
 Aplicação completa de delivery de pizzaria, composta por 
 Frontend (React + Vite ) e Backend (Node.js + Express + TypeScript + SQL Server), incluindo:
## Cadastro de pedidos
* Cálculo automático de preço 
* Emissão de Nota Fiscal (NFe) 
* Histórico de didos em CSV
* Finalização de pedidos
* Painel moderno
* Suporte a itens extras, bebidas e sobremesas
  
## Conteúdo
* Sobre a aplicação
* Tecnologias
* Iniciando a Aplicação
* Screenshots

## Tecnologias Utilizadas

* Frontend
   * React 19
   * Rapidamente 7
   * CSS
   * Ícones Lucide
   * Recartas
   * Modo escuro
   * Componentização avançada
* Backend
   * Node.js
   * Expressar
   * TypeScript
   * Servidor SQL (mssql)
   * Gravador CSV (fs)
   * CORS
   * API REST
## 📂 Estrutura de Pastas 📂 
      /front-end
      ├── /src
      │ ├── index.tsx
      │ ├── App.tsx
      │ ├── /componentes
      │ ├── /páginas
      │ ├── /ganchos
      │ ├── /serviços
      ├── index.html
      /backend
      ├── /src
      │ ├── server.ts
      │ ├── database.ts
      │ ├── nfeService.ts
      │ ├── types.ts
      ├── package.json
      ├── tsconfig.json
      /sistema_Pizzaria_p1-main
      ├── /csv
      │ ├── ativos.csv
      │ ├── historic.csv
      ativos.csv
      histórico.csv

## 🛠️ Instalação
   1. Backend
```bash
pizzaone/backend
cd backend
npm install
npm run dev
```         
   O backend iniciará em:
```
http://localhost:3000
```
   2. Front-end
```/pizzaone 
npm install
npm run dev
```
O frontend iniciará em:
```
http://localhost:5173
```
## 🔌 Rotações de API (Backend)
| Método | Rota | Descrição |
| ---------- | ---------------------- | ----------------------------------- |
|PUBLICAR |/api/pedidos | Cria um pedido |
|PEGAR |/api/pedidos | Lista todos os pedidos |
|EXCLUIR|/api/pedidos/:id | Finaliza e move pedido p/ histórico |
|PUBLICAR |/api/pedidos/:id/nfe | Emite NFe para o pedido |
## 📄 CSV Gerados
| Arquivo | Finalidade |
| ----------------- | ---------------------- |
|ativos.csv | Pedidos ativos na loja |
|histórico.csv | Pedidos finalizados |


## AUTORES
Heringson Lima ```ra: 2404307```   
Wesley da Silva Santos ```ra: 2522594``` 

```ra: Registro Acadêmico UniAnchieta ⬆⬆```

PizzaOne — Entrega Premium 🚀🍕
