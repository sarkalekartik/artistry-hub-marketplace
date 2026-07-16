import { create } from 'zustand';
import { CartItem, Product, User } from './types';
import { io, Socket } from 'socket.io-client';

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  userRole: 'customer' | 'seller' | 'admin' | null;
  user: User | null;
  token: string | null;
  socket: Socket | null;
  setAuth: (role: 'customer' | 'seller' | 'admin' | null, user: User | null, token: string | null) => void;
  initializeSocket: (token: string) => void;
  disconnectSocket: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return state;
      return {
        cart: state.cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    if (product.stock <= 0) return state;
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) };
      }
      return item;
    })
  })),
  clearCart: () => set({ cart: [] }),
  userRole: 'customer',
  user: null,
  token: null,
  socket: null,
  setAuth: (role, user, token) => {
    set({ userRole: role, user, token });
    if (token) {
      get().initializeSocket(token);
    } else {
      get().disconnectSocket();
    }
  },
  initializeSocket: (token) => {
    const socket = io();
    const { user } = get();
    socket.on('connect', () => {
      if (user) {
        socket.emit('authenticate', user);
      }
    });
    set({ socket });
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
