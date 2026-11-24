# 두암시장김치

메뉴·가격 소개 사이트 + 관리자 페이지 (`/admin`).

- Next.js 16 (App Router, Cache Components) · Tailwind CSS 4
- Supabase: `site_settings`(가게 정보 1행), `menu_items`, Storage `images` 버킷
- 관리자 인증: 공용 비밀번호(`ADMIN_PASSWORD`) → 서명된 httpOnly 쿠키(14일)
- 공개 페이지는 캐시되며, 관리자에서 저장하면 즉시 갱신됨

## 환경변수

| 이름 | 값 |
| --- | --- |
| `SUPABASE_URL` | `https://dibjcwobgxzskjemwhxi.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret key (서버 전용) |
| `ADMIN_PASSWORD` | 관리자 비밀번호 (바꾸면 기존 로그인 모두 해제) |

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

DB 스키마: `supabase/migrations/`
