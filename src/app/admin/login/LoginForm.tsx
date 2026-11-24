"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <input
        type="password"
        name="password"
        placeholder="비밀번호"
        autoFocus
        required
        className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-ink"
      />
      {state.error && <p className="text-sm text-chili">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-ink py-3 font-medium text-white disabled:opacity-50"
      >
        {pending ? "확인 중" : "로그인"}
      </button>
    </form>
  );
}
