import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useRegion } from '../context/RegionContext';
import PromoBand from './PromoBand';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const { regionCode, setRegionCode, regions } = useRegion();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <PromoBand />
          <div className="topbar-selectors">
            <select
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              aria-label="Shopping region"
            >
              {Object.entries(regions).map(([code, r]) => (
                <option key={code} value={code}>📍 {r.label}</option>
              ))}
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
            >
              {Object.entries(currencies).map(([code, c]) => (
                <option key={code} value={code}>{code} — {c.symbol}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <Link to="/" className="brand">🏔️ ShopWave</Link>

        <div className="nav-links">
          <NavLink to="/" className={linkClass} end>Shop</NavLink>
          {user && <NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink>}
          <NavLink to="/cart" className={linkClass}>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</NavLink>
          {user ? (
            <>
              <NavLink to="/orders" className={linkClass}>My Orders</NavLink>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-link">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Register</NavLink>
            </>
          )}
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Shop</Link>
        {user && <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
        <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Link>
        {user ? (
          <>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
            <button onClick={handleLogout} className="btn-link" style={{ textAlign: 'left' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" style={{ alignSelf: 'flex-start' }}>
          {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
        </button>
      </div>
    </>
  );
};

export default Navbar;
