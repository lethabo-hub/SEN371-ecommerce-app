import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/subscribe', { email });
      showToast(res.data.message || 'Subscribed!');
      setEmail('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not subscribe right now', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="brand">🏔️ ShopWave</div>
          <p>Outfitters for the trail. Gear that's been tested outdoors, not just in a warehouse.</p>
        </div>

        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <p className="newsletter-label">Get first access to new gear drops</p>
          <div className="newsletter-row">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>{submitting ? '...' : 'Subscribe'}</button>
          </div>
        </form>
      </div>

      <div className="footer-bottom">
        <div className="footer-links">
          <Link to="/">Shop</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/orders">Orders</Link>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} ShopWave. Built for people who'd rather be outside.</span>
      </div>
    </footer>
  );
};

export default Footer;
