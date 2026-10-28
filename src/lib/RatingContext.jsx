import { createContext, useContext, useMemo, useState } from "react";

const RatingContext = createContext(null);

// Ratings and reviews come only from customers who completed an order and rated it.
export function RatingProvider({ children }) {
  const [data, setData] = useState({ totals: {}, reviews: {} });

  const value = useMemo(() => {
    const getRating = (name) => {
      const t = data.totals[name];
      if (!t || t.count === 0) return { avg: null, count: 0 };
      return { avg: t.sum / t.count, count: t.count };
    };
    const getReviews = (name) => data.reviews[name] ?? [];
    const addRating = (name, rating, comment = "") =>
      setData((prev) => {
        const t = prev.totals[name] ?? { sum: 0, count: 0 };
        const review = {
          id: Date.now(),
          author: "Juan B.",
          rating,
          comment: comment.trim(),
          date: new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
        };
        return {
          totals: { ...prev.totals, [name]: { sum: t.sum + rating, count: t.count + 1 } },
          reviews: { ...prev.reviews, [name]: [review, ...(prev.reviews[name] ?? [])] },
        };
      });
    return { getRating, getReviews, addRating };
  }, [data]);

  return <RatingContext.Provider value={value}>{children}</RatingContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingContext);
  if (!ctx) throw new Error("useRatings must be used inside RatingProvider");
  return ctx;
}
