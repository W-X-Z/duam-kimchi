import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminGetMenuItem } from "@/lib/data";
import AdminShell from "@/components/admin/AdminShell";
import MenuEditor from "@/components/admin/MenuEditor";

export default async function MenuEditPage({ params }: PageProps<"/admin/menu/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const item = id === "new" ? null : await adminGetMenuItem(id);
  if (id !== "new" && !item) notFound();

  return (
    <AdminShell active="menu">
      <h1 className="mb-5 text-xl font-bold">{item ? item.name : "메뉴 추가"}</h1>
      <MenuEditor item={item} />
    </AdminShell>
  );
}
