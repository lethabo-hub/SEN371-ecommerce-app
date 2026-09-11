import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

const FREE_SHIPPING_THRESHOLD = 1500; // in ZAR, matches the figure shown in the promo band

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleRemove = async (productId, name) => {
    await removeFromCart(productId);
    showToast(`Removed ${name} from cart`);
  };

  const step = (productId, currentQty, change) => {
    const next = currentQty + change;
    if (next < 1) return;
    updateQuantity(productId, next);
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <div className="empty-state">
          <span className="emoji">🛍️</span>
          <p>Your cart is empty. <Link to="/">Continue shopping</Link></p>
        </div>
      </div>
    );
  }

  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;
  const progress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="page">
      <h1>Your Cart</h1>

      <div className="shipping-bar">
        {remaining > 0 ? (
          <p>Add <strong>{formatPrice(remaining)}</strong> more for free shipping</p>
        ) : (
          <p>🎉 You've unlocked free shipping</p>
        )}
        <div className="shipping-track">
          <div className="shipping-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <table className="cart-table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.product._id}>
              <td>{item.product.name}</td>
              <td>{formatPrice(item.product.price)}</td>
              <td>
                <div className="qty-stepper">
                  <button type="button" onClick={() => step(item.product._id, item.quantity, -1)} aria-label="Decrease quantity">−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => step(item.product._id, item.quantity, 1)} aria-label="Increase quantity">+</button>
                </div>
              </td>
              <td>{formatPrice(item.product.price * item.quantity)}</td>
              <td><button className="btn-link" onClick={() => handleRemove(item.product._id, item.product.name)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <div className="total-row"><span>Total</span><span>{formatPrice(totalPrice)}</span></div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
