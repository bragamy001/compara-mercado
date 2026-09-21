import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Share2, 
  ListPlus, 
  Check, 
  LogOut, 
  Store, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Calculator,
  Crown,
  Zap,
  Lock,
  ShieldCheck,
  X,
  Calendar,
  MapPin,
  Navigation,
  Compass,
  Map as MapIcon,
  ArrowUpDown,
  CreditCard,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import './App.css';

// Configuração do IP da sua máquina na rede local
const API_URL = `http://${window.location.hostname}:5000`;

// Coordenadas padrão de fallback
const LOCALIZACAO_PADRAO = { lat: -11.6625, lng: -39.0078, nome: 'Serrinha, BA' };

const MERCADOS_MOCK = [
  { id: '1', nome: 'Supermercado Central', lat: -11.6610, lng: -39.0060, endereco: 'Centro, Serrinha - BA' },
  { id: '2', nome: 'Hiper Preço', lat: -11.6650, lng: -39.0100, endereco: 'Av. Araci, Serrinha - BA' },
  { id: '3', nome: 'Mercado Econômico', lat: -11.6580, lng: -39.0020, endereco: 'Praça Morena Bela, Serrinha - BA' },
  { id: '4', nome: 'TESTE DE MYLLE', lat: -11.6700, lng: -39.0150, endereco: 'Bairro Novo, Serrinha - BA' }
];

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [authErro, setAuthErro] = useState('');

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Busca, Categoria e Ordenação
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [ordenacao, setOrdenacao] = useState('menor-preco');

  // Geolocalização
  const [minhaLocalizacao, setMinhaLocalizacao] = useState(null);
  const [nomeLocalizacao, setNomeLocalizacao] = useState('Detectando...');
  const [erroLocalizacao, setErroLocalizacao] = useState('');
  const [buscandoGPS, setBuscandoGPS] = useState(false);
  const [raioMaximoKm, setRaioMaximoKm] = useState(15);
  const [exibirFiltroLocal, setExibirFiltroLocal] = useState(false);
  const [exibirMapa, setExibirMapa] = useState(false);

  // Listas
  const [listas, setListas] = useState([
    { id: 1, nome: 'Compras da Semana', itens: [] },
    { id: 2, nome: 'Churrasco de Fim de Semana', itens: [] }
  ]);
  const [listaAtivaId, setListaAtivaId] = useState(1);
  const [novaListaNome, setNovaListaNome] = useState('');
  const [exibirModalListas, setExibirModalListas] = useState(false);

  // Planos e Checkout
  const [exibirModalPlanos, setExibirModalPlanos] = useState(false);
  const [planoSelecionadoCheckout, setPlanoSelecionadoCheckout] = useState(null);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [pagamentoConcluido, setPagamentoConcluido] = useState(false);

  // Memória de cálculo expansível
  const [mercadoExpandido, setMercadoExpandido] = useState(null);

  const listaAtiva = listas.find((l) => l.id === listaAtivaId) || listas[0];

  const carregarProdutos = () => {
    setLoading(true);
    fetch(`${API_URL}/api/produtos`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar os produtos.');
        return res.json();
      })
      .then((data) => {
        setProdutos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErro('Não foi possível conectar ao servidor backend.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      carregarProdutos();
      obterGeolocalizacaoComFallback();
    }
  }, [user]);

  const obterGeolocalizacaoComFallback = () => {
    setBuscandoGPS(true);
    setErroLocalizacao('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          setMinhaLocalizacao({
            lat: posicao.coords.latitude,
            lng: posicao.coords.longitude
          });
          setNomeLocalizacao('Sua Posição Exata (GPS)');
          setBuscandoGPS(false);
        },
        () => {
          obterLocalizacaoPorIP();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      obterLocalizacaoPorIP();
    }
  };

  const obterLocalizacaoPorIP = () => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data.latitude && data.longitude) {
          setMinhaLocalizacao({
            lat: data.latitude,
            lng: data.longitude
          });
          setNomeLocalizacao(`${data.city || 'Sua Região'}, ${data.region_code || ''} (via IP)`);
        } else {
          throw new Error('Falha no IP');
        }
        setBuscandoGPS(false);
      })
      .catch(() => {
        setMinhaLocalizacao({ lat: LOCALIZACAO_PADRAO.lat, lng: LOCALIZACAO_PADRAO.lng });
        setNomeLocalizacao(LOCALIZACAO_PADRAO.nome);
        setBuscandoGPS(false);
      });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthErro('');

    const endpoint = isRegistering ? `${API_URL}/api/register` : `${API_URL}/api/login`;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, senha: senhaInput })
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200 && status !== 201) {
          throw new Error(data.error || 'Erro na autenticação');
        }
        setUser(data.user);
        setEmailInput('');
        setSenhaInput('');
      })
      .catch((err) => setAuthErro(err.message));
  };

  const iniciarCheckout = (plano) => {
    if (plano === 'Gratuito') {
      setUser({ ...user, plano: 'Gratuito' });
      setExibirModalPlanos(false);
      return;
    }
    setPlanoSelecionadoCheckout(plano);
    setPagamentoConcluido(false);
  };

  const confirmarPagamento = (e) => {
    e.preventDefault();
    setPagamentoConcluido(true);
    setTimeout(() => {
      setUser({ ...user, plano: planoSelecionadoCheckout });
      setPlanoSelecionadoCheckout(null);
      setExibirModalPlanos(false);
      setPagamentoConcluido(false);
    }, 1500);
  };

  // Operações de Carrinho e Listas
  const adicionarAoCarrinho = (produto) => {
    setListas((prevListas) =>
      prevListas.map((lista) => {
        if (lista.id === listaAtivaId) {
          const existe = lista.itens.find((item) => item._id === produto._id);
          const novosItens = existe
            ? lista.itens.map((item) =>
                item._id === produto._id ? { ...item, quantidade: item.quantidade + 1 } : item
              )
            : [...lista.itens, { ...produto, quantidade: 1 }];
          return { ...lista, itens: novosItens };
        }
        return lista;
      })
    );
  };

  const alterarQuantidade = (id, delta) => {
    setListas((prevListas) =>
      prevListas.map((lista) => {
        if (lista.id === listaAtivaId) {
          const novosItens = lista.itens
            .map((item) => {
              if (item._id === id) {
                const novaQtd = item.quantidade + delta;
                return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
              }
              return item;
            })
            .filter(Boolean);
          return { ...lista, itens: novosItens };
        }
        return lista;
      })
    );
  };

  const limparCarrinho = () => {
    setListas((prevListas) =>
      prevListas.map((lista) =>
        lista.id === listaAtivaId ? { ...lista, itens: [] } : lista
      )
    );
  };

  const criarNovaLista = (e) => {
    e.preventDefault();
    if (!novaListaNome.trim()) return;

    const nova = { id: Date.now(), nome: novaListaNome.trim(), itens: [] };
    setListas([...listas, nova]);
    setListaAtivaId(nova.id);
    setNovaListaNome('');
  };

  const removerLista = (id) => {
    if (listas.length === 1) return;
    const novas = listas.filter((l) => l.id !== id);
    setListas(novas);
    if (listaAtivaId === id) setListaAtivaId(novas[0].id);
  };

  const categorias = ['Todas', ...new Set(produtos.map((p) => p.categoria))];

  const obterMenorPreco = (nomeProduto) => {
    const iguais = produtos.filter((p) => p.nome.toLowerCase() === nomeProduto.toLowerCase());
    if (iguais.length === 0) return 0;
    return Math.min(...iguais.map((p) => p.precoBase));
  };

  // Produtos Filtrados e Ordenados
  const produtosFiltrados = produtos
    .filter((p) => {
      const matchBusca = p.nome.toLowerCase().includes(termoBusca.toLowerCase());
      const matchCat = categoriaAtiva === 'Todas' || p.categoria === categoriaAtiva;
      return matchBusca && matchCat;
    })
    .sort((a, b) => {
      if (ordenacao === 'menor-preco') return obterMenorPreco(a.nome) - obterMenorPreco(b.nome);
      if (ordenacao === 'maior-preco') return obterMenorPreco(b.nome) - obterMenorPreco(a.nome);
      if (ordenacao === 'nome-az') return a.nome.localeCompare(b.nome);
      return 0;
    });

  // Comparativo por Supermercado
  const supermercadosUnicos = [...new Set(produtos.map((p) => p.supermercado))];
  const comparativoSupermercados = supermercadosUnicos.map((mercadoNome) => {
    let total = 0;
    const detalhamento = listaAtiva.itens.map((itemCarrinho) => {
      const prodNoMercado = produtos.find(
        (p) => p.nome.toLowerCase() === itemCarrinho.nome.toLowerCase() && p.supermercado === mercadoNome
      );
      const precoUnitario = prodNoMercado ? prodNoMercado.precoBase : itemCarrinho.precoBase;
      const subtotal = precoUnitario * itemCarrinho.quantidade;
      total += subtotal;

      return {
        nome: itemCarrinho.nome,
        quantidade: itemCarrinho.quantidade,
        precoUnitario,
        subtotal
      };
    });

    const infoMercado = MERCADOS_MOCK.find((m) => m.nome.toLowerCase() === mercadoNome.toLowerCase());
    let distanciaKm = null;

    if (minhaLocalizacao && infoMercado) {
      distanciaKm = calcularDistanciaKm(
        minhaLocalizacao.lat,
        minhaLocalizacao.lng,
        infoMercado.lat,
        infoMercado.lng
      );
    }

    return { 
      mercado: mercadoNome, 
      total, 
      detalhamento, 
      distanciaKm,
      endereco: infoMercado?.endereco || 'Endereço Comercial Registrado'
    };
  })
  .filter((item) => {
    if (exibirFiltroLocal && item.distanciaKm !== null) {
      return item.distanciaKm <= raioMaximoKm;
    }
    return true;
  })
  .sort((a, b) => a.total - b.total);

  const toggleMercado = (mercado) => {
    setMercadoExpandido(mercadoExpandido === mercado ? null : mercado);
  };

  const enviarWhatsApp = () => {
    if (listaAtiva.itens.length === 0) return;
    let texto = `🛒 *Minha Lista: ${listaAtiva.nome}*\n\n`;
    listaAtiva.itens.forEach((item) => {
      texto += `- ${item.quantidade}x ${item.nome}\n`;
    });
    if (comparativoSupermercados.length > 0 && !ehGratuito) {
      texto += `\n🏷️ *Opção Mais Econômica:* ${comparativoSupermercados[0].mercado} (R$ ${comparativoSupermercados[0].total.toFixed(2)})`;
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-icon-wrapper">
            <ShoppingCart size={36} color="#d84315" />
          </div>
          <h2>Compara Mercado</h2>
          <p className="auth-subtitle">
            {isRegistering ? 'Crie a sua conta de comprador' : 'Economia inteligente nas suas compras'}
          </p>

          {authErro && <div className="auth-error">{authErro}</div>}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Palavra-passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-button">
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <span
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthErro('');
              }}
            >
              {isRegistering ? 'Faça login' : 'Registe-se'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const ehGratuito = !user.plano || user.plano.toLowerCase() === 'gratuito' || user.plano.toLowerCase() === 'grátis';

  // URL para iframe de Mapa Interativo
  const mapCenterLat = minhaLocalizacao ? minhaLocalizacao.lat : LOCALIZACAO_PADRAO.lat;
  const mapCenterLng = minhaLocalizacao ? minhaLocalizacao.lng : LOCALIZACAO_PADRAO.lng;
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenterLng - 0.05}%2C${mapCenterLat - 0.05}%2C${mapCenterLng + 0.05}%2C${mapCenterLat + 0.05}&layer=mapnik&marker=${mapCenterLat}%2C${mapCenterLng}`;

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon-box">
            <ShoppingCart size={22} color="#ffffff" />
          </div>
          <div>
            <h1>Compara Mercado</h1>
            <p>Economia inteligente nas suas compras</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="nav-btn active">
            <ShoppingCart size={16} /> Comprar Produtos
          </button>
          <button
            className="nav-btn secondary"
            onClick={() => setExibirModalListas(!exibirModalListas)}
          >
            <Layers size={16} /> Minhas Listas ({listas.length})
          </button>
          
          <button
            className={`plan-badge-btn ${ehGratuito ? 'free' : 'pro'}`}
            onClick={() => setExibirModalPlanos(true)}
            title="Clique para gerir a sua assinatura"
          >
            <Crown size={14} />
            <span>Plano: {user.plano || 'Gratuito'}</span>
          </button>

          <span className="user-email-badge">{user.email}</span>
          <button onClick={() => setUser(null)} className="logout-btn" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Modal de Planos e Checkout */}
      {exibirModalPlanos && (
        <div className="plans-modal-overlay" onClick={() => setExibirModalPlanos(false)}>
          <div className="plans-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-plans-modal" onClick={() => setExibirModalPlanos(false)}>
              <X size={20} />
            </button>

            {!planoSelecionadoCheckout ? (
              <>
                <div className="plans-modal-header">
                  <Crown size={36} color="#f57c00" />
                  <h2>Assine o Compara Mercado</h2>
                  <p>Desbloqueie os preços em tempo real e saiba exatamente em qual supermercado economiza mais.</p>
                </div>

                <div className="plans-grid">
                  <div className={`plan-card ${ehGratuito ? 'current' : ''}`}>
                    <div className="plan-tag">Básico</div>
                    <h3>Gratuito</h3>
                    <div className="plan-price">
                      <span className="amount">R$ 0</span>
                    </div>
                    <ul className="plan-features">
                      <li><Check size={16} color="#2e7d32" /> Criar e gerir listas de compras</li>
                      <li><Check size={16} color="#2e7d32" /> Adicionar e remover itens</li>
                      <li className="disabled"><Lock size={16} color="#c62828" /> Comparativo de supermercados</li>
                      <li className="disabled"><Lock size={16} color="#c62828" /> Visualização dos preços</li>
                    </ul>
                    <button
                      className="plan-action-btn secondary"
                      onClick={() => iniciarCheckout('Gratuito')}
                      disabled={ehGratuito}
                    >
                      {ehGratuito ? 'Plano Atual' : 'Manter Gratuito'}
                    </button>
                  </div>

                  <div className={`plan-card featured ${user.plano === 'Premium Mensal' ? 'current' : ''}`}>
                    <div className="plan-tag popular"><Zap size={12} /> Flexível</div>
                    <h3>Premium Mensal</h3>
                    <div className="plan-price">
                      <span className="amount">R$ 9,90</span>
                      <span className="period">/mês</span>
                    </div>
                    <ul className="plan-features">
                      <li><Check size={16} color="#2e7d32" /> <strong>Acesso total a todos os preços</strong></li>
                      <li><Check size={16} color="#2e7d32" /> <strong>Descubra o mercado mais barato</strong></li>
                      <li><Check size={16} color="#2e7d32" /> Geolocalização de mercados</li>
                      <li><Check size={16} color="#2e7d32" /> Memória de cálculo detalhada</li>
                    </ul>
                    <button
                      className="plan-action-btn primary"
                      onClick={() => iniciarCheckout('Premium Mensal')}
                    >
                      {user.plano === 'Premium Mensal' ? 'Plano Atual' : 'Assinar Mensal'}
                    </button>
                  </div>

                  <div className={`plan-card ${user.plano === 'Premium Anual' ? 'current' : ''}`}>
                    <div className="plan-tag discount"><Calendar size={12} /> Melhor Valor</div>
                    <h3>Premium Anual</h3>
                    <div className="plan-price">
                      <span className="amount">R$ 89,90</span>
                      <span className="period">/ano (cobrado valor único)</span>
                    </div>
                    <ul className="plan-features">
                      <li><Check size={16} color="#2e7d32" /> <strong>Economize R$ 28,90 por ano</strong></li>
                      <li><Check size={16} color="#2e7d32" /> Acesso total a todos os preços</li>
                      <li><Check size={16} color="#2e7d32" /> Geolocalização de mercados</li>
                      <li><Check size={16} color="#2e7d32" /> Memória de cálculo detalhada</li>
                    </ul>
                    <button
                      className="plan-action-btn primary"
                      onClick={() => iniciarCheckout('Premium Anual')}
                    >
                      {user.plano === 'Premium Anual' ? 'Plano Atual' : 'Assinar Anual (R$ 89,90)'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="checkout-box">
                <button className="back-to-plans" onClick={() => setPlanoSelecionadoCheckout(null)}>
                  ← Voltar para opções de planos
                </button>

                {pagamentoConcluido ? (
                  <div className="success-checkout">
                    <CheckCircle2 size={54} color="#2e7d32" />
                    <h3>Pagamento Aprovado com Sucesso!</h3>
                    <p>O seu plano <strong>{planoSelecionadoCheckout}</strong> foi ativado instantaneamente.</p>
                  </div>
                ) : (
                  <>
                    <h3>Finalizar Assinatura: {planoSelecionadoCheckout}</h3>
                    <p className="checkout-sub">Escolha a forma de pagamento simulada:</p>

                    <div className="payment-methods">
                      <button
                        type="button"
                        className={`method-btn ${metodoPagamento === 'pix' ? 'active' : ''}`}
                        onClick={() => setMetodoPagamento('pix')}
                      >
                        <QrCode size={18} /> PIX / Multibanco
                      </button>
                      <button
                        type="button"
                        className={`method-btn ${metodoPagamento === 'card' ? 'active' : ''}`}
                        onClick={() => setMetodoPagamento('card')}
                      >
                        <CreditCard size={18} /> Cartão de Crédito
                      </button>
                    </div>

                    <form onSubmit={confirmarPagamento} className="checkout-form">
                      {metodoPagamento === 'card' ? (
                        <>
                          <input type="text" placeholder="Número do Cartão (0000 0000 0000 0000)" required />
                          <div className="form-row-2">
                            <input type="text" placeholder="MM/AA" required />
                            <input type="text" placeholder="CVV" required />
                          </div>
                        </>
                      ) : (
                        <div className="pix-box">
                          <p>Copie a chave simulada abaixo para pagar no seu banco:</p>
                          <code>00020126580014BR.GOV.BCB.PIX0136compara-mercado-premium-key</code>
                        </div>
                      )}

                      <button type="submit" className="confirm-pay-btn">
                        Confirmar e Ativar {planoSelecionadoCheckout === 'Premium Mensal' ? 'R$ 9,90' : 'R$ 89,90'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            <div className="plans-modal-footer">
              <ShieldCheck size={18} color="#2e7d32" />
              <span>Ambiente de pagamento seguro. Acesso liberado no mesmo instante.</span>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="app-body">
        <main className="main-content">
          
          {/* Card de Localização / GPS */}
          <div className="location-bar-card">
            <div className="location-info">
              <div className="location-icon-wrapper">
                <MapPin size={20} color="#f57c00" />
              </div>
              <div>
                <strong>Localização para Cotações</strong>
                <p className="loc-status success">📍 {nomeLocalizacao}</p>
              </div>
            </div>

            <div className="location-controls">
              <button
                className={`gps-refresh-btn ${buscandoGPS ? 'loading' : ''}`}
                onClick={obterGeolocalizacaoComFallback}
                disabled={buscandoGPS}
              >
                <Navigation size={14} /> {buscandoGPS ? 'Procurando...' : 'Obter GPS'}
              </button>

              <button
                className={`filter-distance-toggle ${exibirFiltroLocal ? 'active' : ''}`}
                onClick={() => setExibirFiltroLocal(!exibirFiltroLocal)}
              >
                <Compass size={14} /> {exibirFiltroLocal ? 'Raio Ativo' : 'Filtrar Raio'}
              </button>

              <button
                className={`map-toggle-btn ${exibirMapa ? 'active' : ''}`}
                onClick={() => setExibirMapa(!exibirMapa)}
              >
                <MapIcon size={14} /> {exibirMapa ? 'Ocultar Mapa' : 'Ver no Mapa'}
              </button>
            </div>
          </div>

          {/* Slider de Raio */}
          {exibirFiltroLocal && (
            <div className="distance-slider-box">
              <div className="slider-header">
                <label>Mostrar mercados a até <strong>{raioMaximoKm} km</strong> de distância</label>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={raioMaximoKm}
                onChange={(e) => setRaioMaximoKm(Number(e.target.value))}
                className="radius-slider"
              />
            </div>
          )}

          {/* Componente de Mapa Interativo Embed */}
          {exibirMapa && (
            <div className="interactive-map-container">
              <div className="map-header">
                <MapIcon size={16} />
                <span>Mapa em Tempo Real da Sua Região e Supermercados Registados</span>
              </div>
              <iframe
                title="Mapa de Supermercados"
                width="100%"
                height="280"
                frameBorder="0"
                scrolling="no"
                src={mapIframeUrl}
                className="embedded-map"
              ></iframe>
            </div>
          )}

          {/* Barra de Pesquisa e Ordenação */}
          <div className="search-and-sort-row">
            <div className="search-bar-container">
              <Search className="search-icon" size={18} color="#8d6e63" />
              <input
                type="text"
                placeholder="Pesquisar produto por nome..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>

            <div className="sort-box">
              <ArrowUpDown size={16} color="#8d6e63" />
              <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="menor-preco">Menor Preço</option>
                <option value="maior-preco">Maior Preço</option>
                <option value="nome-az">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filtros de Categoria */}
          <div className="categories-pill-list">
            {categorias.map((cat, index) => (
              <button
                key={index}
                className={`pill-btn ${categoriaAtiva === cat ? 'active' : ''}`}
                onClick={() => setCategoriaAtiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gerenciador de Listas */}
          {exibirModalListas && (
            <div className="lists-manager-box">
              <div className="lists-manager-header">
                <h3><Layers size={18} /> Gerenciar Minhas Listas</h3>
                <button onClick={() => setExibirModalListas(false)} className="close-manager">✕</button>
              </div>

              <form onSubmit={criarNovaLista} className="create-list-form">
                <input
                  type="text"
                  placeholder="Nome da nova lista (ex: Feira Mensal)..."
                  value={novaListaNome}
                  onChange={(e) => setNovaListaNome(e.target.value)}
                />
                <button type="submit">
                  <ListPlus size={16} /> Criar Lista
                </button>
              </form>

              <div className="lists-cards-grid">
                {listas.map((l) => (
                  <div
                    key={l.id}
                    className={`list-card-item ${l.id === listaAtivaId ? 'active' : ''}`}
                    onClick={() => setListaAtivaId(l.id)}
                  >
                    <div className="list-card-info">
                      <strong>{l.nome}</strong>
                      <span>{l.itens.reduce((acc, i) => acc + i.quantidade, 0)} itens</span>
                    </div>
                    <div className="list-card-actions">
                      {l.id === listaAtivaId && <span className="active-badge"><Check size={12} /> Ativa</span>}
                      {listas.length > 1 && (
                        <button
                          className="delete-list-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerLista(l.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-title-row">
            <h2>Produtos Disponíveis ({produtosFiltrados.length})</h2>
            <span className="active-list-tag">
              Lista Ativa: <strong>{listaAtiva.nome}</strong>
            </span>
          </div>

          {loading && <p className="status-msg">A carregar produtos...</p>}
          {erro && <p className="error-msg">{erro}</p>}

          {!loading && !erro && (
            <div className="products-grid">
              {produtosFiltrados.map((produto) => {
                const itemNoCarrinho = listaAtiva.itens.find((i) => i._id === produto._id);
                const menorPreco = obterMenorPreco(produto.nome);

                return (
                  <div key={produto._id} className="product-card">
                    <span className="badge-category">{produto.categoria}</span>
                    <h3 className="product-name">{produto.nome}</h3>
                    
                    <div className="price-row">
                      <span className="price-label">A partir de:</span>
                      {ehGratuito ? (
                        <span className="price-locked" onClick={() => setExibirModalPlanos(true)}>
                          <Lock size={12} /> Bloqueado (Plano Free)
                        </span>
                      ) : (
                        <span className="price-val">R$ {menorPreco.toFixed(2)}</span>
                      )}
                    </div>

                    {itemNoCarrinho ? (
                      <div className="quantity-controls">
                        <button type="button" onClick={() => alterarQuantidade(produto._id, -1)}>
                          <Minus size={14} />
                        </button>
                        <span className="qtd-num">{itemNoCarrinho.quantidade}</span>
                        <button type="button" onClick={() => alterarQuantidade(produto._id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button className="add-btn" onClick={() => adicionarAoCarrinho(produto)}>
                        <Plus size={16} /> Adicionar à Lista
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Sidebar Lateral de Compras */}
        <aside className="sidebar-cart">
          <div className="cart-header">
            <h3><ShoppingCart size={18} /> {listaAtiva.nome}</h3>
            {listaAtiva.itens.length > 0 && (
              <button className="clear-btn" onClick={limparCarrinho} title="Esvaziar Lista">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {listaAtiva.itens.length === 0 ? (
            <div className="empty-cart-msg">
              <p>Esta lista está vazia.</p>
              <span>Clique em "+ Adicionar" nos produtos para compor sua lista.</span>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {listaAtiva.itens.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-title">{item.nome}</span>
                    </div>
                    <div className="cart-item-actions">
                      <button type="button" onClick={() => alterarQuantidade(item._id, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qtd-num">{item.quantidade}</span>
                      <button type="button" onClick={() => alterarQuantidade(item._id, 1)}>
                        <Plus size={12} />
                      </button>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => alterarQuantidade(item._id, -item.quantidade)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-share" onClick={enviarWhatsApp}>
                <Share2 size={18} /> Compartilhar Lista
              </button>

              <div className="comparison-box">
                <h4><Store size={16} /> Comparativo por Supermercado</h4>
                
                {ehGratuito ? (
                  <div className="locked-comparison-banner" onClick={() => setExibirModalPlanos(true)}>
                    <Lock size={28} color="#f57c00" />
                    <strong>Comparativo de Preços Bloqueado</strong>
                    <p>Assine o plano Premium para ver em qual supermercado a sua lista sai mais barata.</p>
                    <button className="unlock-btn">
                      <Crown size={14} /> Ver Preços e Economizar
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="hint-calc-text">Clique no mercado para abrir a memória de cálculo</p>
                    <div className="market-list">
                      {comparativoSupermercados.length === 0 ? (
                        <p className="no-markets-msg">Nenhum supermercado encontrado no raio configurado.</p>
                      ) : (
                        comparativoSupermercados.map((item, idx) => {
                          const isExpanded = mercadoExpandido === item.mercado;
                          return (
                            <div
                              key={idx}
                              className={`market-card-wrapper ${idx === 0 ? 'cheapest' : ''}`}
                            >
                              <div
                                className="market-card-header"
                                onClick={() => toggleMercado(item.mercado)}
                              >
                                <div className="market-info">
                                  <div className="market-title-row">
                                    <strong>{item.mercado}</strong>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </div>
                                  
                                  <span className="market-distance-tag">
                                    <MapPin size={10} />
                                    {item.distanciaKm !== null
                                      ? `${item.distanciaKm < 1 ? (item.distanciaKm * 1000).toFixed(0) + ' m' : item.distanciaKm.toFixed(1) + ' km'} de distância`
                                      : 'Distância estimada'}
                                  </span>

                                  {idx === 0 && (
                                    <span className="tag-cheapest">
                                      <Sparkles size={11} /> Mais Barato
                                    </span>
                                  )}
                                </div>
                                <span className="market-price">R$ {item.total.toFixed(2)}</span>
                              </div>

                              {isExpanded && (
                                <div className="calc-memory-panel">
                                  <div className="calc-header">
                                    <Calculator size={13} /> Memória de Cálculo
                                  </div>
                                  <p className="market-address-text">{item.endereco}</p>
                                  <table className="calc-table">
                                    <thead>
                                      <tr>
                                        <th>Item</th>
                                        <th>Qtd</th>
                                        <th>Un.</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.detalhamento.map((d, i) => (
                                        <tr key={i}>
                                          <td className="calc-item-name">{d.nome}</td>
                                          <td>{d.quantidade}</td>
                                          <td>R$ {d.precoUnitario.toFixed(2)}</td>
                                          <td>R$ {d.subtotal.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;