export const inputCls =
  "w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 outline-none focus:border-ink";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5">
      {title && <h2 className="font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
