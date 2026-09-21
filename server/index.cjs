const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão ao MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/compara_mercado';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado com sucesso.'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// --- SCHEMAS E MODELOS ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  plano: { type: String, default: 'Gratuito' },
  criadoEm: { type: Date, default: Date.now }
});

const MercadoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  endereco: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  categoria: { type: String, required: true },
  imagemUrl: { type: String, default: '' }
});

const PrecoSchema = new mongoose.Schema({
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
  mercadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mercado', required: true },
  precoBase: { type: Number, required: true },
  atualizadoEm: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Mercado = mongoose.model('Mercado', MercadoSchema);
const Produto = mongoose.model('Produto', ProdutoSchema);
const Preco = mongoose.model('Preco', PrecoSchema);

// --- ENDPOINTS / ROTAS ---

// Autenticação
app.post('/api/register', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const user = new User({ email, senha, plano: 'Gratuito' });
    await user.save();
    res.status(201).json({ user: { id: user._id, email: user.email, plano: user.plano } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar utilizador.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email, senha });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    res.json({ user: { id: user._id, email: user.email, plano: user.plano } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// Mercados
app.get('/api/mercados', async (req, res) => {
  try {
    const mercados = await Mercado.find();
    res.json(mercados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar supermercados.' });
  }
});

// Catálogo Geral
app.get('/api/produtos', async (req, res) => {
  try {
    const precos = await Preco.find().populate('produtoId').populate('mercadoId');
    
    const listaProdutosUnificados = precos.map((p) => ({
      _id: `${p.produtoId._id}_${p.mercadoId._id}`,
      produtoId: p.produtoId._id,
      nome: p.produtoId.nome,
      categoria: p.produtoId.categoria,
      supermercado: p.mercadoId.nome,
      precoBase: p.precoBase,
      lat: p.mercadoId.lat,
      lng: p.mercadoId.lng,
      endereco: p.mercadoId.endereco
    }));

    res.json(listaProdutosUnificados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar catálogo completo.' });
  }
});

const PORT = process.env.PORT || 5000;

// O parâmetro '0.0.0.0' permite que qualquer dispositivo da sua rede local (como o telemóvel) aceda ao servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Backend a rodar na porta ${PORT} para toda a rede!`);
});