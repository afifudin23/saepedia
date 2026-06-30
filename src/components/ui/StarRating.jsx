// Star rating. Read-only by default; pass onChange to make it interactive.
export default function StarRating({ value = 0, onChange, max = 5 }) {
  const interactive = typeof onChange === "function";
  return (
    <span className={`stars ${interactive ? "input" : ""}`}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        return (
          <span
            key={n}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? `${n} bintang` : undefined}
            onClick={interactive ? () => onChange(n) : undefined}
          >
            {n <= value ? "★" : "☆"}
          </span>
        );
      })}
    </span>
  );
}
