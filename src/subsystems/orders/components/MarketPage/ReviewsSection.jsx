import Icon from "../../../../components/Icon.jsx";
import { useRatings } from "../../../../lib/RatingContext.jsx";

function Stars({ value }) {
  return (
    <span className="inline-flex text-[#FFD444]" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" fill className={`h-3.5 w-3.5 ${value >= n ? "" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

export default function ReviewsSection({ storeName }) {
  const { getRating, getReviews } = useRatings();
  const { avg, count } = getRating(storeName);
  const reviews = getReviews(storeName);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Reviews</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">From customers who completed an order</p>
        </div>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} />
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{avg.toFixed(1)}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">({count} {count === 1 ? "review" : "reviews"})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No reviews yet. Reviews appear here after a customer rates a completed order.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {reviews.map((r, idx) => (
            <li key={r.id} className="cascade py-4 first:pt-0 last:pb-0" style={{ "--d": `${Math.min(idx, 6) * 60}ms` }}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  {r.author.split(" ").map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.author}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{r.date}</span>
                  </div>
                  <div className="mt-0.5"><Stars value={r.rating} /></div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {r.comment || "Rated without a comment."}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
