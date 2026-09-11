import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page not-found">
    <h1>404</h1>
    <h2>This page wandered off the shelf</h2>
    <p className="helper-text">The page you're looking for doesn't exist or may have moved.</p>
    <br />
    <Link to="/" className="btn-primary">Back to Shop</Link>
  </div>
);

export default NotFound;
