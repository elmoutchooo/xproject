"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/app/[locale]/booking/review-action";
import type { Dict, Locale } from "@/lib/i18n";
import { StarIcon } from "./Icons";

export default function ReviewForm({ id, locale, t, defaultName }: { id: string; locale: Locale; t: Dict["review"]; defaultName: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  if (state.ok) {
    return (
      <div className="card mt-8 bg-emerald-50/60 p-6 text-center">
        <div className="flex justify-center gap-1 text-coral-500">{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} className={`h-7 w-7 ${i <= rating ? "" : "opacity-20"}`} />)}</div>
        <p className="mt-3 text-lg font-semibold text-ink-900">{t.thanks}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card no-print mt-8 space-y-5 p-6">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div>
        <h2 className="text-xl font-semibold text-ink-900">{t.title}</h2>
        <p className="mt-1 text-sm text-ink-500">{t.text}</p>
      </div>
      <div>
        <p className="label">{t.rating}</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1" role="radiogroup" aria-label={t.rating} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} — ${t.stars[i - 1]}`}
                onMouseEnter={() => setHover(i)} onClick={() => setRating(i)}
                className={`rounded-lg p-1 transition hover:scale-110 ${i <= shown ? "text-coral-500" : "text-ink-200"}`}>
                <StarIcon className="h-9 w-9" />
              </button>
            ))}
          </div>
          {shown > 0 && <span className="text-sm font-semibold text-ink-700">{t.stars[shown - 1]}</span>}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="comment">{t.comment}</label>
        <textarea id="comment" name="comment" rows={3} placeholder={t.commentHint} className="input" maxLength={1000} />
      </div>
      <div>
        <label className="label" htmlFor="name">{t.name}</label>
        <input id="name" name="name" defaultValue={defaultName} maxLength={40} className="input" />
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{state.error}</p>}
      <button disabled={pending || !rating} className="btn-primary w-full sm:w-auto">{t.submit}</button>
    </form>
  );
}
