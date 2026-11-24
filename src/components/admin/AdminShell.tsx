import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminShell({
  active,
  children,
}: {
  active: "menu" | "settings";
  children: React.ReactNode;
}) {
  const tab = (key: string) =>
    `rounded-lg px-3 py-1.5 text-sm ${
      active === key ? "bg-ink text-white" : "text-ink-soft hover:bg-black/5"
    }`;
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <nav className="flex items-center gap-1">
            <Link href="/admin" className={tab("menu")}>메뉴</Link>
            <Link href="/admin/settings" className={tab("settings")}>가게 정보</Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <a href="/" target="_blank" className="text-ink-soft hover:text-ink">사이트 보기</a>
            <form action={logout}>
              <button className="text-ink-soft hover:text-ink">로그아웃</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </>
  );
}
