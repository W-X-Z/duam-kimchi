import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminCountOrders, adminGetOrders } from "@/lib/data";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import OrderCard from "@/components/admin/OrderCard";

const TABS: (OrderStatus | "all")[] = ["pending", "paid", "shipped", "cancelled", "all"];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const raw = typeof sp.status === "string" ? sp.status : "pending";
  const status = (TABS.includes(raw as OrderStatus) ? raw : "pending") as OrderStatus | "all";
  const [orders, counts] = await Promise.all([
    adminGetOrders(status === "all" ? undefined : status),
    adminCountOrders(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <AdminShell active="orders">
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const on = t === status;
          const n = t === "all" ? total : counts[t];
          return (
            <Link
              key={t}
              href={`/admin/orders?status=${t}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                on ? "bg-ink text-white" : "bg-white text-ink-soft hover:text-ink"
              }`}
            >
              {t === "all" ? "전체" : ORDER_STATUS_LABEL[t]} <span className="tabular-nums opacity-70">{n}</span>
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-ink-soft">주문이 없습니다</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
