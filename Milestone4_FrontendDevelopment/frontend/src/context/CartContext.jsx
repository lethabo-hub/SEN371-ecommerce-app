import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { productId, quantity });
    setCart(res.data.data);
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/${productId}`, { quantity });
    setCart(res.data.data);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCart(res.data.data);
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const totalPrice = cart.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, removeFromCart, refreshCart, itemCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
