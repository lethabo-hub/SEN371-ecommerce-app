import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const loadProduct = () => api.get(`/products/${id}`).then((res) => setProduct(res.data.data));
  const loadReviews = () => api.get(`/products/${id}/reviews`).then((res) => setReviews(res.data.data));

  const loadRelated = async () => {
    const productRes = await api.get(`/products/${id}`);
    const category = productRes.data.data.category;
    const res = await api.get('/products', { params: { category } });
    setRelated(res.data.data.filter((p) => p._id !== id).slice(0, 4));
  };

  useEffect(() => {
    setQuantity(1);
    loadProduct();
    loadReviews();
    loadRelated();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error');
      return;
    }
    try {
      await addToCart(id, quantity);
      showToast('Added to cart!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      showToast('Log in to save items to your wishlist', 'error');
      return;
    }
    const added = await toggleWishlist(id);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      await loadProduct();
      await loadReviews();
      showToast('Review posted — thanks for the feedback!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    }
  };

  if (!product) return <div className="spinner" />;

  const wishlisted = user && isWishlisted(id);
  const alreadyReviewed = user && reviews.some((r) => r.user === user._id);

  return (
    <div className="page">
      <div className="product-detail">
        <div className="thumb-wrap">
          <img src={product.imageUrl} alt={product.name} />
        </div>
        <div>
          <p className="category">{product.category}</p>
          <h1>{product.name}</h1>
          {product.numReviews > 0 && <StarRating rating={product.averageRating} count={product.numReviews} />}
          <p className="price">{formatPrice(product.price)}</p>
          <span className={`stock-badge ${product.stock > 0 ? 'in' : 'out'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{product.description}</p>

          <div className="qty-row">
            <div className="qty-stepper">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn-primary" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </button>
            <button className="btn-secondary" onClick={handleWishlist}>
              {wishlisted ? '♥ Saved' : '♡ Save for later'}
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews ({reviews.length})</h2>
        {reviews.length === 0 && <p className="helper-text">No reviews yet — be the first to share your thoughts.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="review-card">
            <div className="review-head">
              <span className="review-name">{r.name}</span>
              <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <StarRating rating={r.rating} />
            <p>{r.comment}</p>
          </div>
        ))}

        {user && !alreadyReviewed && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>Write a review</h3>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setReviewRating(n)}
                  style={{ color: n <= reviewRating ? '#f59e0b' : 'var(--border)' }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            />
            {reviewError && <p className="error">{reviewError}</p>}
            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
        )}
        {!user && <p className="helper-text">Log in to leave a review.</p>}
      </div>

      {related.length > 0 && (
        <div className="related-section">
          <h2>You may also like</h2>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
