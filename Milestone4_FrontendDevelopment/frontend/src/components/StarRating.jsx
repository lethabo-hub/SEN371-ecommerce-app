// Renders a compact, read-only star rating (supports half-star rounding)
const StarRating = ({ rating = 0, count }) => {
  const full = Math.round(rating);
  const stars = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);

  return (
    <span className="rating-row">
      <span className="star-rating">{stars}</span>
      {typeof count === 'number' && <span>({count})</span>}
    </span>
  );
};

export default StarRating;
