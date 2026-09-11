import { useEffect, useState } from 'react';
import api from '../api/api';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useRegion } from '../context/RegionContext';

const CATEGORIES = ['All', 'Backpacks', 'Footwear', 'Shelter', 'Accessories'];

const SEASON_COPY = {
  Spring: { emoji: '🌱', line: 'the trails are drying out and the days are stretching longer' },
  Summer: { emoji: '☀️', line: 'long light and warm evenings mean it is time to move' },
  Autumn: { emoji: '🍂', line: 'cool mornings and gold trails make for the best light of the year' },
  Winter: { emoji: '❄️', line: 'short days call for gear that keeps you warm and moving' },
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { region, season, seasonalCategories } = useRegion();

  const fetchProducts = async (searchKeyword = keyword, searchCategory = category) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products', {
        params: {
          keyword: searchKeyword || undefined,
          category: searchCategory === 'All' ? undefined : searchCategory,
        },
      });
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleChip = (cat) => {
    setCategory(cat);
    fetchProducts(keyword, cat);
  };

  const seasonInfo = SEASON_COPY[season] || SEASON_COPY.Spring;
  const seasonalPicks = products.filter((p) => seasonalCategories.includes(p.category)).slice(0, 4);

  // sorts a copy of the product list so the original fetch order stays untouched
  const sortProducts = (list) => {
    const sorted = [...list];
    if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') sorted.sort((a, b) => b.averageRating - a.averageRating);
    return sorted;
  };
  const sortedProducts = sortProducts(products);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Outfitters for the trail since day one</span>
          <h1>Gear that gets you further from the trailhead.</h1>
          <p>We stock one thing: equipment built for people who would rather be outside. Every product on this shelf has been carried up a mountain by someone on our team.</p>
          <button className="btn-primary" onClick={() => document.getElementById('catalogue').scrollIntoView({ behavior: 'smooth' })}>
            Browse the Gear
          </button>
          <div className="hero-stats">
            <div><strong>{products.length || '7'}+</strong><span>Products in rotation</span></div>
            <div><strong>4.8★</strong><span>Avg. customer rating</span></div>
            <div><strong>3</strong><span>Focused gear categories</span></div>
          </div>
        </div>
      </section>

      <section className="season-banner">
        <span className="season-emoji">{seasonInfo.emoji}</span>
        <div>
          <strong>It's {season} in {region.label}</strong>
          <p>Right now, {seasonInfo.line}. Here's what our guides are packing for it.</p>
        </div>
      </section>

      {seasonalPicks.length > 0 && (
        <div className="product-grid" style={{ marginBottom: '2.5rem' }}>
          {seasonalPicks.map((p) => <ProductCard key={`seasonal-${p._id}`} product={p} />)}
        </div>
      )}

      <div id="catalogue">
        <h2>Full Catalogue</h2>
        <form className="filters" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search gear..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit">Search</button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort products">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </form>

        <div className="category-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => handleChip(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : sortedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>

        {!loading && products.length === 0 && (
          <div className="empty-state">
            <span className="emoji">🔍</span>
            <p>No gear matched your search. Try a different keyword or category.</p>
          </div>
        )}
      </div>

      <section className="story-section">
        <div className="story-text">
          <span className="hero-eyebrow" style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}>Our story</span>
          <h2>We only sell what we'd carry ourselves.</h2>
          <p>ShopWave started as a gear closet shared between three hiking friends who were tired of buying equipment that fell apart on the second trip. We test every product on real trails before it earns a place on this site — no filler categories, no gear we haven't broken in ourselves.</p>
          <div className="trust-row">
            <div><strong>Field-tested</strong><span>Every product trialled outdoors before listing</span></div>
            <div><strong>Free returns</strong><span>30 days, no questions, no fine print</span></div>
            <div><strong>Small catalogue</strong><span>We'd rather stock 7 great things than 700 average ones</span></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
