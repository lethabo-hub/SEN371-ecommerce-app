import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useCurrency } from '../context/CurrencyContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/orders/myorders').then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="spinner" />;

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>My Orders</h1>
        <div className="empty-state">
          <span className="emoji">📦</span>
          <p>You haven't placed any orders yet. <Link to="/">Start shopping</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Orders</h1>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-head">
            <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
            <span className={`status-pill status-${order.status}`}>{order.status}</span>
          </div>
          <ul>
            {order.items.map((item) => (
              <li key={item.product}>{item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}</li>
            ))}
          </ul>
          <p><strong>Total: {formatPrice(order.totalPrice)}</strong></p>
          <p className="helper-text">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
