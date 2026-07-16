export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  seller: string;
  sellerId: string;
  rating: number;
  image: string;
  description?: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Accepted' | 'Processing' | 'Shipped' | 'Delivered' | 'Rejected';
  customerId: string;
  sellerId: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
}
