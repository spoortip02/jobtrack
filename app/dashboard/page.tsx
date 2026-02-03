"use client";

import { useEffect, useMemo, useState } from "react";

type Status =
  | "SAVED"
  | "APPLIED"
  | "OA"
  | "PHONE"
  | "ONSITE"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

type AppItem = {
  id: string;
  company: string;
  roleTitle: string;
  location: string | null;
  status: Status;
  appliedAt: string | null;
  url: string | null;
  salaryRange: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusOptions: Status[] = [
  "SAVED",
  "APPLIED",
  "OA",
  "PHONE",
  "ONSITE",
  "OFFER",
  "REJECTED",
  "GHOSTED",
];

export default function DashboardPage() {
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [form, setForm] = useState({
    company: "",
    roleTitle: "",
    location: "",
    url: "",
    salaryRange: "",
    notes: "",
    status: "SAVED" as Status,
  });

  const filtered = useMemo(() => {
    if (filter === "ALL") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  async function loadApps() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/applications", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load applications");
      setApplications(data.applications || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function createApp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const payload = {
      company: form.company,
      roleTitle: form.roleTitle,
      location: form.location || undefined,
      url: form.url || undefined,
      salaryRange: form.salaryRange || undefined,
      notes: form.notes || undefined,
      status: form.status,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to create application");
      return;
    }

    setForm({
      company: "",
      roleTitle: "",
      location: "",
      url: "",
      salaryRange: "",
      notes: "",
      status: "SAVED",
    });

    setApplications((prev) => [data.application, ...prev]);
  }

  async function updateStatus(id: string, status: Status) {
    setErr(null);

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to update status");
      return;
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === id ? data.application : a))
    );
  }

  async function removeApp(id: string) {
    setErr(null);

    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error || "Failed to delete");
      return;
    }

    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">JobTrack Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Track applications by stage (Saved → Applied → OA → Phone → Onsite → Offer).
          </p>
        </div>

        <button
          onClick={loadApps}
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Create */}
        <form onSubmit={createApp} className="rounded border p-4">
          <h2 className="font-semibold">Add application</h2>

          <div className="mt-4 grid gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Company *"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Role title *"
              value={form.roleTitle}
              onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
              required
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <select
                className="w-full border rounded px-3 py-2"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Job URL (optional)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Salary range (optional) e.g. $90k-$110k"
              value={form.salaryRange}
              onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
            />

            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Notes (optional)"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button className="w-full rounded bg-black text-white px-4 py-2">
              Add
            </button>
          </div>
        </form>

        {/* List */}
        <div className="rounded border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Applications</h2>

            <select
              className="border rounded px-2 py-2 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="ALL">All</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No applications yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {filtered.map((a) => (
                <li key={a.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {a.company} — {a.roleTitle}
                      </p>

                      <p className="text-sm text-gray-600">
                        {a.location || "No location"}{" "}
                        {a.salaryRange ? `• ${a.salaryRange}` : ""}
                      </p>

                      {a.url && (
                        <a
                          className="text-sm underline break-all"
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Job link
                        </a>
                      )}

                      {a.notes && (
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                          {a.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={a.status}
                        onChange={(e) =>
                          updateStatus(a.id, e.target.value as Status)
                        }
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => removeApp(a.id)}
                        className="text-sm text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
