import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      showToast('Account created — welcome to ShopWave!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <h1>Create an account</h1>
      <p className="helper-text" style={{ marginBottom: '1.25rem' }}>Join ShopWave to save items, track orders, and check out faster.</p>
      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 chars, 1 number)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Register'}</button>
        </form>
      </div>
      <p className="helper-text">Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default Register;
