import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="page">
        <h1>Your Wishlist</h1>
        <div className="empty-state">
          <span className="emoji">🤍</span>
          <p>Nothing saved yet. <Link to="/">Browse products</Link> and tap the heart to save items here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Wishlist</h1>
      <div className="product-grid">
        {wishlist.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
};

export default Wishlist;
