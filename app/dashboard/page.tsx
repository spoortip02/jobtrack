import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Logged in as: {session?.user?.email ?? "unknown"}
      </p>

      <div className="mt-6 rounded border p-4">
        <p className="font-medium">Next step:</p>
        <p className="text-gray-600">
          We’ll add “Job Applications” CRUD here (create, list, update status).
        </p>
      </div>
    </main>
  );
}
