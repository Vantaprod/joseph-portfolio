"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUpload } from "./MediaUpload";

type SoftwareData = {
  id?: string;
  title: string;
  description: string;
  type: string;
  techStack: string;
  url: string;
  repoUrl: string;
  thumbnail: string;
  gallery: string;
  featured: boolean;
  published: boolean;
  order: number;
};

const TYPES = ["Web App", "Website", "AI Model", "Hardware", "Mobile App", "Other"];

export function SoftwareForm({ initial }: { initial?: Partial<SoftwareData> }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<SoftwareData>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    type: initial?.type ?? "Web App",
    techStack: initial?.techStack ?? "",
    url: initial?.url ?? "",
    repoUrl: initial?.repoUrl ?? "",
    thumbnail: initial?.thumbnail ?? "",
    gallery: initial?.gallery ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
    order: initial?.order ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof SoftwareData>(key: K, value: SoftwareData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit
      ? "/api/admin/software/" + initial!.id
      : "/api/admin/software";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Save failed.");
      return;
    }

    router.push("/admin/software");
    router.refresh();
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-base border border-base outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(232,122,45,0.15)] transition-all text-sm";
  const labelCls =
    "block text-[11px] uppercase tracking-widest text-muted mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelCls}>Title *</label>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Description *</label>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputCls + " resize-y"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Type *</label>
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className={inputCls}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tech Stack (comma separated)</label>
          <input
            value={form.techStack}
            onChange={(e) => update("techStack", e.target.value)}
            className={inputCls}
            placeholder="React, Node, Python"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Live URL</label>
          <input
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            className={inputCls}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={labelCls}>Repository URL</label>
          <input
            value={form.repoUrl}
            onChange={(e) => update("repoUrl", e.target.value)}
            className={inputCls}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <MediaUpload
        kind="image"
        label="Screenshot / Thumbnail"
        value={form.thumbnail}
        onChange={(url) => update("thumbnail", url)}
      />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Order</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => update("order", Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer pt-6">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="w-5 h-5 accent-[var(--color-primary)]"
          />
          <span className="text-sm">Featured</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer pt-6">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            className="w-5 h-5 accent-[var(--color-primary)]"
          />
          <span className="text-sm">Published</span>
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded-full disabled:opacity-50 text-sm"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Entry"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-base px-6 py-2.5 rounded-full hover:bg-surface text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}