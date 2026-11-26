import Link from "next/link";
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
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin" aria-label="메뉴판으로" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl">
          ‹
        </Link>
        <h1 className="text-[22px] font-bold">{item ? item.name : "김치 추가"}</h1>
      </div>
      <MenuEditor item={item} />
    </AdminShell>
  );
}
