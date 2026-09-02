export function RatingStars({ rating, className }: { rating: number | null; className?: string }) {
  if (!rating) return null;
  return (
    <span className={className} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
