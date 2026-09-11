import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

const Checkout = () => {
  const [address, setAddress] = useState({ street: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { refreshCart, totalPrice } = useCart();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/orders', { shippingAddress: address });
      await refreshCart();
      showToast('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <h1>Checkout</h1>
      <p className="helper-text" style={{ marginBottom: '0.4rem' }}>Order total: <strong>{formatPrice(totalPrice)}</strong></p>
      <p className="helper-text" style={{ marginBottom: '1.25rem', fontSize: '0.8rem' }}>Prices are shown converted for reference — your order is processed in South African Rand (ZAR).</p>
      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <input name="street" placeholder="Street address" value={address.street} onChange={handleChange} required />
          <input name="city" placeholder="City" value={address.city} onChange={handleChange} required />
          <input name="postalCode" placeholder="Postal code" value={address.postalCode} onChange={handleChange} required />
          <input name="country" placeholder="Country" value={address.country} onChange={handleChange} required />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? 'Placing order...' : 'Place Order'}</button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
