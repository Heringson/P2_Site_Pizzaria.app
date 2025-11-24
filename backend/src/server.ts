// backend/src/server.ts

import * as nfeService from './nfeService.js';
import express from 'express';
import * as db from './database.js';
import { PizzariaEntrada } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Configuração do CSV
const CSV_DIR = path.resolve(__dirname, '../../sistema_Pizzaria_p1-main/csv');
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

const ARQ = {
  ativos: path.join(CSV_DIR, 'ativos.csv'),
  historico: path.join(CSV_DIR, 'historico.csv')
};

// --- Helpers CSV ---
function csvSafe(s: any): string {
  const str = String(s ?? '');
  return /,|"|\n/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function entradaToCsv(p: PizzariaEntrada & { horaSaida?: string }): string {
  return [
    p.idPedido ?? '',
    p.cliente ?? '',
    p.telefone ?? '',
    p.pedidoPizza ?? '',
    p.pedidoBebida ?? '',
    p.tamanhoPizza ?? '',
    p.quantidadePizza ?? 0,
    p.bordaRecheada ?? false,
    p.quantidadeBebidas ?? 0,
    p.sobremesa ?? '',
    p.quantidadeSobremesa ?? 0,
    p.enderecoEntrega ?? '',
    p.horaPedido ?? '',
    p.formaPagamento ?? '',
    p.horaSaida ?? '',
    p.precoTotal ?? 0,
    p.itemExtra ?? '',
    p.precoItemExtra ?? 0
  ].map(csvSafe).join(',') + '\n';
}

async function appendToCsv(filePath: string, row: string) {
  try {
    await fs.promises.appendFile(filePath, row, 'utf8');
  } catch (err) {
    console.error(`Erro ao salvar no CSV: ${filePath}`, err);
  }
}

// -----------------------------------------
// ROTAS
// -----------------------------------------

// POST: Criar pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const d = req.body;

    const precoCalculado = db.calcularPrecoTotal({
      tamanhoPizza: d.tamanhoPizza || 'Média',
      quantidadePizza: d.quantidadePizza || 0,
      bordaRecheada: d.bordaRecheada || false,
      quantidadeBebidas: d.quantidadeBebidas || 0,
      sobremesa: d.sobremesa || 'N/A',
      quantidadeSobremesa: d.quantidadeSobremesa || 0,
      precoItemExtra: d.precoItemExtra
    });

    const newPedidoDados = {
      cliente: d.cliente,
      telefone: d.telefone,
      enderecoEntrega: d.enderecoEntrega,
      formaPagamento: d.formaPagamento,
      cpfNota: d.cpfNota, // Importante passar o CPF

      pedidoPizza: d.pedidoPizza || 'N/A',
      tamanhoPizza: d.tamanhoPizza || 'Média',
      quantidadePizza: d.quantidadePizza || 0,
      bordaRecheada: d.bordaRecheada || false,

      pedidoBebida: d.pedidoBebida || 'N/A',
      quantidadeBebidas: d.quantidadeBebidas || 0,

      sobremesa: d.sobremesa || 'N/A',
      quantidadeSobremesa: d.quantidadeSobremesa || 0,

      itemExtra: d.itemExtra || undefined,
      precoItemExtra: d.precoItemExtra || 0,

      precoTotal: precoCalculado
    };

    const saved = await db.insertPedido(newPedidoDados);
    await appendToCsv(ARQ.ativos, entradaToCsv(saved));
    res.status(201).json(saved);

  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// GET: Listar pedidos
app.get('/api/pedidos', async (_req, res) => {
  try {
    const pedidos = await db.getAllPedidos();
    res.json(pedidos);
  } catch (err) {
    console.error('Erro ao listar pedidos:', err);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

// POST: Emitir NFe (ADICIONADO AQUI NO SERVIDOR)
app.post('/api/pedidos/:id/nfe', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Chama o serviço de NFe que você importou
    const resultado = await nfeService.emitirNfe(id);
    res.json(resultado);
  } catch (err) {
    console.error('Erro NFe:', err);
    res.status(500).json({ error: 'Erro ao emitir nota' });
  }
});

// DELETE: Finalizar pedido
app.delete('/api/pedidos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pedido = await db.getPedidoById(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    await db.deletePedido(id);

    if (fs.existsSync(ARQ.ativos)) {
      const content = await fs.promises.readFile(ARQ.ativos, 'utf8');
      const linhas = content.split('\n').filter(l => {
        if (!l.trim()) return false;
        return !l.startsWith(`${id},`) && !l.startsWith(`"${id}",`);
      });
      await fs.promises.writeFile(ARQ.ativos, linhas.join('\n') + '\n', 'utf8');
    }

    const horaSaida = new Date().toISOString();
    await appendToCsv(ARQ.historico, entradaToCsv({ ...pedido, horaSaida }));

    res.json({ message: 'Pedido finalizado', idPedido: id });

  } catch (err) {
    console.error('Erro ao finalizar pedido:', err);
    res.status(500).json({ error: 'Erro ao finalizar pedido' });
  }
});

// -----------------------------------------
// INICIAR SERVIDOR
// -----------------------------------------
db.initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend iniciado em http://localhost:${PORT}`);
      console.log(`Dados CSV salvos em: ${CSV_DIR}`);
    });
  })
  .catch(err => {
    console.error('Erro fatal ao iniciar servidor:', err);
  });