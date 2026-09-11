const ProductCardSkeleton = () => (
  <div className="product-card" style={{ pointerEvents: 'none' }}>
    <div className="skeleton skeleton-card" />
    <div className="skeleton skeleton-line short" />
    <div className="skeleton skeleton-line" />
  </div>
);

export default ProductCardSkeleton;
