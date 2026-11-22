import { StarIcon } from "@/components/Icons";

export default function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex text-coral-500" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} className={`${size} ${i <= Math.round(value) ? "" : "opacity-20"}`} />)}
    </span>
  );
}
