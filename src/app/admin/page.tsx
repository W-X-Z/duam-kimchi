import { requireAdmin } from "@/lib/auth";
import { adminGetMenu } from "@/lib/data";
import AdminShell from "@/components/admin/AdminShell";
import MenuBoard from "@/components/admin/MenuBoard";

export default async function AdminMenuPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const [menu, sp] = await Promise.all([adminGetMenu(), searchParams]);
  return (
    <AdminShell active="menu">
      <MenuBoard key={menu.map((m) => m.id + m.sort_order).join()} menu={menu} saved={sp.saved === "1"} />
    </AdminShell>
  );
}
