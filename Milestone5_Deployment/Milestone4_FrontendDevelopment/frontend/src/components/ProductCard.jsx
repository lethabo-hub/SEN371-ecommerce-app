import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const wishlisted = user && isWishlisted(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Log in to save items to your wishlist', 'error');
      return;
    }
    const added = await toggleWishlist(product._id);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Log in to add items to your cart', 'error');
      return;
    }
    try {
      await addToCart(product._id, 1);
      showToast(`${product.name} added to cart`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="thumb-wrap">
        {product.stock === 0 && <span className="badge-outofstock">Sold out</span>}
        <button
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
        >
          {wishlisted ? '♥' : '♡'}
        </button>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.stock > 0 && (
          <button className="quick-add-btn" onClick={handleQuickAdd} aria-label="Quick add to cart">
            + Add to Cart
          </button>
        )}
      </div>
      <p className="category">{product.category}</p>
      <h3>{product.name}</h3>
      {product.numReviews > 0 && <StarRating rating={product.averageRating} count={product.numReviews} />}
      <p className="price">{formatPrice(product.price)}</p>
    </Link>
  );
};

export default ProductCard;
