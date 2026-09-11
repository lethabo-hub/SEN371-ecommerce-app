import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const res = await api.get('/wishlist');
    setWishlist(res.data.data);
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = (productId) => wishlist.some((p) => p._id === productId);

  const toggleWishlist = async (productId) => {
    if (isWishlisted(productId)) {
      const res = await api.delete(`/wishlist/${productId}`);
      setWishlist(res.data.data);
      return false;
    }
    const res = await api.post(`/wishlist/${productId}`);
    setWishlist(res.data.data);
    return true;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
