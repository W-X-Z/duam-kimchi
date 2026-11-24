"use client";

import { useActionState } from "react";
import { saveSettings, type FormState } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";
import ImageInput from "./ImageInput";
import { Card, Field, inputCls } from "./fields";

export default function SettingsForm({ settings: s }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, {});

  return (
    <form action={action} className="space-y-4 pb-24">
      <Card title="소개">
        <Field label="가게 이름">
          <input name="shop_name" defaultValue={s.shop_name} required className={inputCls} />
        </Field>
        <Field label="대표 문구">
          <input name="tagline" defaultValue={s.tagline} className={inputCls} />
        </Field>
        <Field label="소개글">
          <textarea name="intro" defaultValue={s.intro} rows={3} className={inputCls} />
        </Field>
        <Field label="대표 사진">
          <ImageInput name="hero_image" removeName="remove_hero_image" current={s.hero_image_url} aspect="aspect-[4/5]" />
        </Field>
      </Card>

      <Card title="연락처">
        <Field label="전화번호">
          <input name="phone" defaultValue={s.phone} inputMode="tel" placeholder="010-0000-0000" className={inputCls} />
        </Field>
        <Field label="카카오톡 채널 링크">
          <input name="kakao_url" defaultValue={s.kakao_url} placeholder="https://pf.kakao.com/..." className={inputCls} />
        </Field>
        <Field label="인스타그램 링크">
          <input name="instagram_url" defaultValue={s.instagram_url} className={inputCls} />
        </Field>
        <Field label="주소">
          <input name="address" defaultValue={s.address} className={inputCls} />
        </Field>
      </Card>

      <Card title="입금 계좌">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Field label="은행">
            <input name="bank_name" defaultValue={s.bank_name} className={inputCls} />
          </Field>
          <Field label="계좌번호">
            <input name="account_number" defaultValue={s.account_number} className={inputCls} />
          </Field>
        </div>
        <Field label="예금주">
          <input name="account_holder" defaultValue={s.account_holder} className={inputCls} />
        </Field>
      </Card>

      <Card title="주문 · 배송">
        <Field label="주문 방법 (한 줄에 한 단계)">
          <textarea name="order_guide" defaultValue={s.order_guide} rows={5} className={inputCls} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="택배비 (원)">
            <input
              name="shipping_fee_amount"
              defaultValue={s.shipping_fee_amount}
              inputMode="numeric"
              placeholder="4000"
              className={inputCls}
            />
          </Field>
          <Field label="무료 배송 기준 (원)">
            <input
              name="free_shipping_over"
              defaultValue={s.free_shipping_over ?? ""}
              inputMode="numeric"
              placeholder="50000"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="배송 안내 (한 줄에 하나)">
          <textarea name="shipping_guide" defaultValue={s.shipping_guide} rows={4} className={inputCls} />
        </Field>
      </Card>

      <Card title="사업자 정보">
        <Field label="하단 표시 (한 줄에 하나)">
          <textarea
            name="business_info"
            defaultValue={s.business_info}
            rows={5}
            placeholder={"상호 두암시장김치\n대표 홍길동\n사업자등록번호 000-00-00000\n통신판매업 신고 제0000-광주북구-0000호"}
            className={inputCls}
          />
        </Field>
      </Card>

      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <p className="flex-1 text-sm">
            {state.error ? (
              <span className="text-chili">{state.error}</span>
            ) : state.ok ? (
              <span className="text-cabbage">저장됨</span>
            ) : null}
          </p>
          <button disabled={pending} className="rounded-xl bg-ink px-8 py-3 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "저장 중" : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
