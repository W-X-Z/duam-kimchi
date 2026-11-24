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

  return (
    <div>
      <div className={`relative w-full max-w-xs overflow-hidden rounded-xl bg-paper-2 ${aspect}`}>
        {preview && !removed ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">사진 없음</div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <label className="cursor-pointer rounded-lg border border-black/15 bg-white px-3 py-1.5 hover:bg-black/5">
          {busy ? "처리 중" : "사진 선택"}
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
        {preview && !removed && (
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-lg px-3 py-1.5 text-ink-soft hover:bg-black/5"
          >
            삭제
          </button>
        )}
        <input type="checkbox" name={removeName} checked={removed} readOnly hidden />
      </div>
    </div>
  );
}
