import { useState } from "react";
import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import ModalShell from "./ModalShell.jsx";
import VerifiedSeal from "./VerifiedSeal.jsx";

const labels = ["", "Poor", "Fair", "Good", "Very good", "Great"];

export default function RatingModal({ seller, initials, orderRef, subtitle, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <ModalShell
      open
      onClose={onClose}
      label="Rate your seller"
      panelClassName="w-full max-w-[500px] rounded-2xl border border-[#E2E8F0] bg-white p-6 text-slate-800 shadow-lg"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight text-[#0F172A]">Rate your seller</h2>
        <button type="button" aria-label="Close" onClick={onClose} className="-mr-1 p-1 text-slate-400 transition-colors hover:text-slate-600">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold leading-tight text-[#0F172A]">{seller}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              <VerifiedSeal className="h-3.5 w-3.5" />
              Verified QCU
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#64748B]">{subtitle ?? `Order ${orderRef}`}</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F172A]">Your rating</label>
          {rating === 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-red-500">
              <Icon name="info" className="h-3.5 w-3.5" />
              Select a rating to continue
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#FFD444]">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating >= n}
              onClick={() => setRating(n)}
              className={`transition-transform hover:scale-110 ${rating >= n ? "" : "text-slate-300"}`}
            >
              <Icon name="star" className="h-6 w-6" fill />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="mt-1.5 text-xs font-medium text-[#64748B]">{labels[rating]}</p>}
      </div>

      <div className="mb-5">
        <label htmlFor="comment-box" className="mb-1.5 block text-xs font-bold text-[#0F172A]">Comment (optional)</label>
        <textarea
          id="comment-box"
          rows={3}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell other students about your experience"
          className="w-full resize-none rounded-xl border border-[#E2E8F0] p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <div className="mt-1 flex justify-end">
          <span className="text-[11px] text-[#64748B]">{comment.length}/500</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onClose} className="px-2 py-2 text-xs font-semibold text-[#0F172A] transition-colors hover:text-slate-600">
          Cancel
        </button>
        <Button disabled={rating === 0} onClick={() => onSubmit({ rating, comment })}>
          Submit rating
        </Button>
      </div>
    </ModalShell>
  );
}
