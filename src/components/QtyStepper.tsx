"use client";

export default function QtyStepper({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "h-8 w-8 text-base" : "h-11 w-11 text-lg";
  const num = size === "sm" ? "w-8 text-sm" : "w-12 text-base";
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-paper">
      <button
        type="button"
        aria-label="수량 빼기"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={`${btn} rounded-full text-ink-soft hover:text-ink disabled:opacity-30`}
      >
        −
      </button>
      <span className={`${num} text-center font-semibold tabular-nums`}>{value}</span>
      <button
        type="button"
        aria-label="수량 더하기"
        disabled={value >= 50}
        onClick={() => onChange(value + 1)}
        className={`${btn} rounded-full text-ink-soft hover:text-ink disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}
