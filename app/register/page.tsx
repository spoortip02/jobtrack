"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function extractErrorMessage(data: any): string {
    // Zod flatten() format: { formErrors: string[], fieldErrors: Record<string, string[]> }
    const formErr = data?.error?.formErrors?.[0];

    const fieldErrors = data?.error?.fieldErrors;
    const firstFieldErr =
      fieldErrors && typeof fieldErrors === "object"
        ? (Object.values(fieldErrors).flat() as any[])[0]
        : null;

    // Some APIs return { error: "message" }
    const plainErr = typeof data?.error === "string" ? data.error : null;

    return formErr || firstFieldErr || plainErr || "Failed to register";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(extractErrorMessage(data));
        return;
      }

      router.push("/login");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Create account</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          disabled={loading}
          className="w-full rounded bg-black text-white px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </main>
  );
}
