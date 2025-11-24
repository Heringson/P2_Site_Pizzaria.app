// backend/src/database.ts

import sql from 'mssql';
import { PizzariaEntrada } from './types.js';

export const sqlConfig: sql.config = {
  user: 'sa',
  password: 'SuaSenhaForte123!', // Certifique-se que esta senha está correta
  database: 'PizzariaDB',
  server: 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let appPool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (appPool && appPool.connected) {
    return appPool;
  }
  try {
    appPool = await sql.connect(sqlConfig);
    return appPool;
  } catch (err) {
    console.error('Erro ao conectar ao pool:', err);
    throw err;
  }
}

export async function initializeDatabase() {
  try {
    // 1. Verifica/Cria o Banco (Master)
    const masterConfig = { ...sqlConfig, database: 'master' };
    const poolMaster = await new sql.ConnectionPool(masterConfig).connect();
    
    const dbCheck = await poolMaster.request().query(`
      SELECT name FROM master.dbo.sysdatabases WHERE name = '${sqlConfig.database}'
    `);

    if (dbCheck.recordset.length === 0) {
      console.log(`Banco ${sqlConfig.database} não encontrado. Criando...`);
      await poolMaster.request().query(`CREATE DATABASE ${sqlConfig.database}`);
    }
    await poolMaster.close();

    // 2. Conecta no Banco Correto
    const pool = await getPool();
    console.log('Conectado ao SQL Server com sucesso.');

    await criarTabelaPedidos(pool);

  } catch (err) {
    console.error('Erro ao inicializar o SQL Server:', err);
    throw err;
  }
}

async function criarTabelaPedidos(pool: sql.ConnectionPool) {
  try {
    // Cria a tabela base se não existir
    const queryCreate = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Pedidos' AND xtype='U')
      CREATE TABLE Pedidos (
        idPedido INT IDENTITY(1,1) PRIMARY KEY,
        cliente NVARCHAR(100),
        telefone NVARCHAR(20),
        pedidoPizza NVARCHAR(MAX),
        pedidoBebida NVARCHAR(MAX),
        tamanhoPizza NVARCHAR(50),
        quantidadePizza INT,
        bordaRecheada BIT,
        quantidadeBebidas INT,
        sobremesa NVARCHAR(MAX),
        quantidadeSobremesa INT,
        enderecoEntrega NVARCHAR(255),
        horaPedido DATETIME,
        formaPagamento NVARCHAR(50),
        itemExtra NVARCHAR(MAX),
        precoItemExtra DECIMAL(10,2),
        precoTotal DECIMAL(10,2),
        cpfNota NVARCHAR(20) DEFAULT NULL,
        nfeUrl NVARCHAR(255) DEFAULT NULL,
        nfeStatus NVARCHAR(20) DEFAULT 'Pendente'
      )
    `;
    await pool.request().query(queryCreate);

    // --- MIGRAÇÕES DE SEGURANÇA (Caso a tabela já exista sem essas colunas) ---
    
    // Nota Fiscal
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'cpfNota' AND Object_ID = Object_ID(N'Pedidos'))
      ALTER TABLE Pedidos ADD cpfNota NVARCHAR(20) DEFAULT NULL;
    `);
    
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'nfeUrl' AND Object_ID = Object_ID(N'Pedidos'))
      ALTER TABLE Pedidos ADD nfeUrl NVARCHAR(255) DEFAULT NULL;
    `);

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'nfeStatus' AND Object_ID = Object_ID(N'Pedidos'))
      ALTER TABLE Pedidos ADD nfeStatus NVARCHAR(20) DEFAULT 'Pendente';
    `);

    // Preços e Extras
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'precoTotal' AND Object_ID = Object_ID(N'Pedidos'))
      ALTER TABLE Pedidos ADD precoTotal DECIMAL(10,2) DEFAULT 0;
    `);

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'itemExtra' AND Object_ID = Object_ID(N'Pedidos'))
      ALTER TABLE Pedidos ADD itemExtra NVARCHAR(MAX) DEFAULT NULL;
    `);

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'precoItemExtra' AND Object_ID = Object_ID(N'Pedidos'))
      ALTER TABLE Pedidos ADD precoItemExtra DECIMAL(10,2) DEFAULT 0;
    `);
    
    console.log('Tabela Pedidos verificada e atualizada (Migrações aplicadas).');
  } catch (err) {
    console.error('Erro ao criar/atualizar tabela:', err);
  }
}

// --- MÉTODOS ---

export async function insertPedido(
  pedido: Omit<PizzariaEntrada, 'idPedido' | 'horaPedido'> & { precoTotal: number }
): Promise<PizzariaEntrada> {

  const pool = await getPool();
  const horaPedido = new Date(); // Gera data aqui no servidor (mais seguro)
  const request = pool.request();

  // Bind dos parâmetros
  request.input('cliente', sql.NVarChar, pedido.cliente);
  request.input('telefone', sql.NVarChar, pedido.telefone);
  request.input('pedidoPizza', sql.NVarChar, pedido.pedidoPizza);
  request.input('pedidoBebida', sql.NVarChar, pedido.pedidoBebida);
  request.input('tamanhoPizza', sql.NVarChar, pedido.tamanhoPizza);
  request.input('quantidadePizza', sql.Int, pedido.quantidadePizza);
  request.input('bordaRecheada', sql.Bit, pedido.bordaRecheada);
  request.input('quantidadeBebidas', sql.Int, pedido.quantidadeBebidas);
  request.input('sobremesa', sql.NVarChar, pedido.sobremesa);
  request.input('quantidadeSobremesa', sql.Int, pedido.quantidadeSobremesa);
  request.input('enderecoEntrega', sql.NVarChar, pedido.enderecoEntrega);
  request.input('horaPedido', sql.DateTime, horaPedido);
  request.input('formaPagamento', sql.NVarChar, pedido.formaPagamento);
  request.input('cpfNota', sql.NVarChar, pedido.cpfNota || null);
  
  // Inputs dos novos campos
  request.input('itemExtra', sql.NVarChar, pedido.itemExtra || '');
  request.input('precoItemExtra', sql.Decimal(10, 2), pedido.precoItemExtra || 0);
  request.input('precoTotal', sql.Decimal(10, 2), pedido.precoTotal);

  // Query Corrigida
  const query = `
    INSERT INTO Pedidos (
      cliente, telefone, pedidoPizza, pedidoBebida, tamanhoPizza, quantidadePizza,
      bordaRecheada, quantidadeBebidas, sobremesa, quantidadeSobremesa, enderecoEntrega,
      horaPedido, formaPagamento, itemExtra, precoItemExtra, precoTotal, cpfNota
    ) 
    OUTPUT INSERTED.idPedido
    VALUES (
      @cliente, @telefone, @pedidoPizza, @pedidoBebida, @tamanhoPizza, @quantidadePizza,
      @bordaRecheada, @quantidadeBebidas, @sobremesa, @quantidadeSobremesa, @enderecoEntrega,
      @horaPedido, @formaPagamento, @itemExtra, @precoItemExtra, @precoTotal, @cpfNota
    );
  `;

  const result = await request.query(query);

  const idPedido = result.recordset[0].idPedido;

  return { 
    idPedido, 
    horaPedido: horaPedido.toISOString(), 
    ...pedido 
  };
}

export async function getAllPedidos(): Promise<PizzariaEntrada[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM Pedidos ORDER BY horaPedido DESC
  `);
  return result.recordset as PizzariaEntrada[];
}

export async function getPedidoById(id: number) {
  const pool = await getPool();
  const request = pool.request();
  request.input('idPedido', sql.Int, id);
  const result = await request.query(`
    SELECT * FROM Pedidos WHERE idPedido = @idPedido
  `);
  return result.recordset[0];
}

export async function deletePedido(id: number) {
  const pool = await getPool();
  const request = pool.request();
  request.input('idPedido', sql.Int, id);
  await request.query(`DELETE FROM Pedidos WHERE idPedido = @idPedido`);
}

// Lógica de Preço do Backend (Back-up de segurança)
export function calcularPrecoTotal(dados: {
  tamanhoPizza: string;
  quantidadePizza: number;
  bordaRecheada: boolean;
  quantidadeBebidas: number;
  sobremesa: string;
  quantidadeSobremesa: number;
  precoItemExtra?: number;
}): number {

  const precos: any = {
    tamanho: { 'Pequena': 30, 'Média': 40, 'Grande': 50, 'Família': 60 },
    borda: 5,
    bebida: 8,
    sobremesa: {
      'Pudim': 8, 'Sorvete': 10, 'Brigadeiro': 4, 'Brownie': 12, 'Bolo de Chocolate': 9
    }
  };

  let total = 0;

  if (dados.quantidadePizza > 0) {
    // Se o tamanho não existir na lista, assume Média (40)
    const valorPizza = precos.tamanho[dados.tamanhoPizza] || 40;
    total += valorPizza * dados.quantidadePizza;
    
    if (dados.bordaRecheada) total += precos.borda * dados.quantidadePizza;
  }

  if (dados.quantidadeBebidas > 0) {
    total += dados.quantidadeBebidas * precos.bebida;
  }

  if (dados.quantidadeSobremesa > 0) {
    const valorSobremesa = precos.sobremesa[dados.sobremesa] || 10;
    total += valorSobremesa * dados.quantidadeSobremesa;
  }

  if (dados.precoItemExtra) total += Number(dados.precoItemExtra);

  return total;
}