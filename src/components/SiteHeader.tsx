import Link from "next/link";
import CartLink from "./cart/CartLink";

export default function SiteHeader({ shopName, home = false }: { shopName: string; home?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          {shopName}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-soft">
          <Link href={home ? "#menu" : "/#menu"} className="hidden hover:text-ink sm:inline">메뉴</Link>
          <Link href={home ? "#order" : "/#order"} className="hidden hover:text-ink sm:inline">주문 안내</Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
