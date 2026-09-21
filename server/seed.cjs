const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/compara_mercado';

const MercadoSchema = new mongoose.Schema({ nome: String, endereco: String, lat: Number, lng: Number });
const ProdutoSchema = new mongoose.Schema({ nome: String, categoria: String });
const PrecoSchema = new mongoose.Schema({ produtoId: mongoose.Schema.Types.ObjectId, mercadoId: mongoose.Schema.Types.ObjectId, precoBase: Number });

const Mercado = mongoose.model('Mercado', MercadoSchema);
const Produto = mongoose.model('Produto', ProdutoSchema);
const Preco = mongoose.model('Preco', PrecoSchema);

async function povoarBanco() {
  await mongoose.connect(MONGO_URI);
  console.log('Limpando coleções antigas...');

  await Mercado.deleteMany({});
  await Produto.deleteMany({});
  await Preco.deleteMany({});

  console.log('Inserindo Supermercados...');
  const mercados = await Mercado.insertMany([
    { nome: 'Supermercado Central', endereco: 'Centro, Conceição do Jacuípe - BA', lat: -12.3267, lng: -38.7661 },
    { nome: 'Hiper Preço', endereco: 'Av. Getúlio Vargas, Feira de Santana - BA', lat: -12.2570, lng: -38.9598 },
    { nome: 'Mercado Econômico', endereco: 'Praça Principal, Serrinha - BA', lat: -11.6625, lng: -39.0078 }
  ]);

  console.log('Inserindo Produtos...');
  const produtos = await Produto.insertMany([
    { nome: 'Arroz Integral 1 kg', categoria: 'MERCEARIA' },
    { nome: 'Leite UHT 1L', categoria: 'LACTICÍNIOS' },
    { nome: 'Café Moído 250g', categoria: 'MERCEARIA' },
    { nome: 'Azeite Extra Virgem 500ml', categoria: 'MERCEARIA' }
  ]);

  console.log('Inserindo Preços...');
  await Preco.insertMany([
    { produtoId: produtos[0]._id, mercadoId: mercados[0]._id, precoBase: 5.50 },
    { produtoId: produtos[0]._id, mercadoId: mercados[1]._id, precoBase: 5.20 },
    { produtoId: produtos[1]._id, mercadoId: mercados[0]._id, precoBase: 4.20 },
    { produtoId: produtos[1]._id, mercadoId: mercados[2]._id, precoBase: 3.99 },
    { produtoId: produtos[2]._id, mercadoId: mercados[0]._id, precoBase: 8.90 },
    { produtoId: produtos[2]._id, mercadoId: mercados[1]._id, precoBase: 8.50 },
    { produtoId: produtos[3]._id, mercadoId: mercados[0]._id, precoBase: 22.50 },
    { produtoId: produtos[3]._id, mercadoId: mercados[2]._id, precoBase: 21.00 }
  ]);

  console.log('Banco de dados povoado com sucesso!');
  process.exit();
}

povoarBanco().catch((err) => {
  console.error(err);
  process.exit(1);
});