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

function statusBadgeClass(status: Status) {
 
  switch (status) {
    case "OFFER":
      return "bg-green-100 text-green-800 border-green-200";
    case "ONSITE":
    case "PHONE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "OA":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "APPLIED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "GHOSTED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "SAVED":
    default:
      return "bg-zinc-100 text-zinc-800 border-zinc-200";
  }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [query, setQuery] = useState("");
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
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      const statusOk = filter === "ALL" ? true : a.status === filter;
      const searchOk =
        !q ||
        a.company.toLowerCase().includes(q) ||
        a.roleTitle.toLowerCase().includes(q) ||
        (a.location || "").toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [applications, filter, query]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">JobTrack Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Track applications across stages: Saved → Applied → OA → Phone → Onsite → Offer.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadApps}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Create */}
        <form onSubmit={createApp} className="rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Add application</h2>
            <span className="text-xs text-gray-500">* required</span>
          </div>

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Applications</h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className="border rounded px-3 py-2 text-sm"
                placeholder="Search company / role..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
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
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="mt-6 rounded border bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-medium">No applications yet.</p>
              <p className="mt-1 text-gray-600">
                Add your first one on the left. Then update stages as you progress.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {filtered.map((a) => (
                <li key={a.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold truncate">
                          {a.company} — {a.roleTitle}
                        </p>
                        <span
                          className={`text-xs border rounded-full px-2 py-0.5 ${statusBadgeClass(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {a.location || "No location"}
                        {a.salaryRange ? ` • ${a.salaryRange}` : ""}
                        {" • "}
                        Created {fmtDate(a.createdAt)}
                      </p>

                      {a.url && (
                        <a
                          className="mt-1 inline-block text-sm underline break-all"
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
