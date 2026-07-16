import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let products = [
    { id: '1', name: 'Handcrafted Wooden Vase', category: 'Wooden Craft', price: 1200, seller: 'Ramesh Woodworks', sellerId: 'seller1', rating: 4.8, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800', stock: 10 },
    { id: '2', name: 'Terracotta Clay Pots', category: 'Clay Art', price: 850, seller: 'Anita Clay Arts', sellerId: 'seller2', rating: 4.5, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800', stock: 5 },
    { id: '3', name: 'Bamboo Woven Basket', category: 'Bamboo Products', price: 450, seller: 'Northeast Crafts', sellerId: 'seller3', rating: 4.9, image: 'https://images.unsplash.com/photo-1596489379685-613d9646b9a8?auto=format&fit=crop&q=80&w=800', stock: 15 },
    { id: '4', name: 'Warli Painting', category: 'Paintings', price: 2500, seller: 'Tribal Arts Co.', sellerId: 'seller4', rating: 5.0, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800', stock: 2 },
  ];

  let orders: any[] = [];
  
  // Real-time tracking
  const activeUsers = new Map<string, any>();
  let totalVisitorsOnline = 0;

  // API Routes
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'hackerin30@gmail.com' && password === 'hackerin3011') {
      res.json({ success: true, role: 'admin', user: { id: 'admin1', name: 'Admin', email } });
    } else if (email === 'seller@artistryhub.com' && password === 'seller123') {
      res.json({ success: true, role: 'seller', user: { id: 'seller1', name: 'Ramesh Woodworks', email } });
    } else if (email === 'customer@example.com' && password === 'password') {
      res.json({ success: true, role: 'customer', user: { id: 'cust1', name: 'Priya Sharma', email } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.post('/api/orders', (req, res) => {
    const { items, total, customerId } = req.body;
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    
    // Create an order for each seller
    const ordersBySeller: Record<string, any> = {};
    
    items.forEach((item: any) => {
      if (!ordersBySeller[item.seller]) {
        ordersBySeller[item.seller] = {
          id: `${orderId}-${item.seller.replace(/\s+/g, '')}`,
          items: [],
          total: 0,
          status: 'Pending',
          customerId,
          sellerId: item.seller,
          date: new Date().toISOString()
        };
      }
      ordersBySeller[item.seller].items.push(item);
      ordersBySeller[item.seller].total += item.price * item.quantity;
      
      // Decrease stock
      const productIndex = products.findIndex(p => p.id === item.id);
      if (productIndex !== -1) {
        products[productIndex].stock = Math.max(0, products[productIndex].stock - item.quantity);
        io.emit('product_updated', products[productIndex]);
      }
    });

    const newOrders = Object.values(ordersBySeller);
    orders = [...newOrders, ...orders];
    
    // Emit socket events
    newOrders.forEach(o => {
      io.emit('new_order', o);
    });

    res.json({ success: true, orders: newOrders });
  });

  app.get('/api/orders', (req, res) => {
    const { role, userId, sellerId } = req.query;
    let result = [...orders];
    
    if (role === 'customer' && userId) {
      result = result.filter(o => o.customerId === userId);
    } else if (role === 'seller' && sellerId) {
      result = result.filter(o => o.sellerId === sellerId);
    }
    
    res.json(result);
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const orderIndex = orders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      io.emit('order_status_update', orders[orderIndex]);
      res.json({ success: true, order: orders[orderIndex] });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  });

  app.post('/api/products', (req, res) => {
    const { name, category, price, seller, sellerId, image, description, stock } = req.body;
    
    if (!name || !price || !seller || !sellerId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newProduct = {
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      category: category || 'Uncategorized',
      price: Number(price),
      seller,
      sellerId,
      rating: 0,
      image: image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      description: description || '',
      stock: Number(stock) || 0
    };

    products.push(newProduct);
    io.emit('product_added', newProduct);

    res.json({ success: true, product: newProduct });
  });

  app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let result = [...products];
    if (category) {
      result = result.filter(p => p.category === category);
    }
    if (search) {
      const s = String(search).toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.seller.toLowerCase().includes(s));
    }
    res.json(result);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // AI Chat Route
  let aiClient: GoogleGenAI | null = null;
  app.post('/api/ai/chat', async (req, res) => {
    try {
      if (!aiClient) {
        if (!process.env.GEMINI_API_KEY) {
          return res.status(500).json({ reply: 'AI is not configured (missing API key).' });
        }
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }

      const { message } = req.body;
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `You are an AI assistant for Artistry Hub, an Indian marketplace for handmade crafts and rural artisans. Be helpful, concise, and friendly. Answer the user: ${message}` }] }
        ]
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error('AI Error:', error);
      res.status(500).json({ reply: 'I am having trouble thinking right now. Please try again later.' });
    }
  });

  // Socket.io for Real-Time Features
  io.on('connection', (socket) => {
    totalVisitorsOnline++;
    io.emit('visitor_update', { active: activeUsers.size, total: totalVisitorsOnline });

    socket.on('authenticate', (data) => {
      activeUsers.set(socket.id, data);
      io.emit('visitor_update', { active: activeUsers.size, total: totalVisitorsOnline });
    });

    socket.on('join_chat', (data) => {
      socket.join(data.room);
    });

    socket.on('send_message', (data) => {
      io.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      totalVisitorsOnline = Math.max(0, totalVisitorsOnline - 1);
      activeUsers.delete(socket.id);
      io.emit('visitor_update', { active: activeUsers.size, total: totalVisitorsOnline });
    });
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
