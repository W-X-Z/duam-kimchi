"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";

const MAX_SIDE = 1600;

async function resize(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

/** Whole area is tappable; the chosen photo is shrunk in the browser before upload. */
export default function ImageInput({
  name,
  removeName,
  current,
  aspect = "aspect-[4/3]",
}: {
  name: string;
  removeName: string;
  current: string | null;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const has = preview && !removed;

  return (
    <div>
      <label className={`relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-paper-2 ${aspect}`}>
        {has ? (
          <img src={preview!} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-ink-soft">
            <span className="text-4xl leading-none">＋</span>
            <span className="text-[17px] font-medium">{busy ? "사진 준비 중" : "사진 넣기"}</span>
          </span>
        )}
        {has && (
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/80 px-4 py-2 text-[15px] font-medium text-white">
            {busy ? "사진 준비 중" : "사진 바꾸기"}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            const small = await resize(f);
            const dt = new DataTransfer();
            dt.items.add(small);
            e.target.files = dt.files;
            setPreview(URL.createObjectURL(small));
            setRemoved(false);
            setBusy(false);
          }}
        />
      </label>
      {has && (
        <button
          type="button"
          onClick={() => {
            setRemoved(true);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-2 px-1 py-2 text-[15px] text-ink-soft underline underline-offset-2"
        >
          사진 빼기
        </button>
      )}
      <input type="checkbox" name={removeName} checked={removed} readOnly hidden />
    </div>
  );
}
