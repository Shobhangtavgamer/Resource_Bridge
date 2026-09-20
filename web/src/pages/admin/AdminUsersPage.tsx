import { useMemo, useState } from "react";
import { UserCheck, UserX, Users } from "lucide-react";
import { adminApi } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { ROLE_LABELS } from "@/lib/constants";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "DONOR", label: "Donors" },
  { value: "NGO", label: "NGOs" },
  { value: "ADMIN", label: "Admins" },
];

export function AdminUsersPage() {
  useDocumentTitle("Users");
  const toast = useToast();
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAsync(
    (signal) => adminApi.users({}, signal),
    [],
  );

  const users = useMemo(() => {
    const base = data?.users ?? [];
    return base.filter((user) => {
      const roleMatch = !role || user.role === role;
      const query = search.trim().toLowerCase();
      const searchMatch =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return roleMatch && searchMatch;
    });
  }, [data, role, search]);

  const toggle = async (user: { id: string; isActive: boolean; fullName: string }) => {
    setBusyId(user.id);
    try {
      await adminApi.setUserStatus(user.id, user.isActive);
      toast.success(
        user.isActive ? "Account suspended" : "Account reactivated",
        `${user.fullName} ${user.isActive ? "can no longer" : "can now"} sign in.`,
      );
      refetch();
    } catch (caught) {
      toast.error("Couldn't update status", toApiError(caught).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Review accounts and suspend misuse."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <Select
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <Input
            label="Search"
            placeholder="Name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load users" onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" aria-hidden />}
          title="No users found"
          description="Adjust the filters to find the account you're looking for."
        />
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-900">
                  {user.fullName}
                  <Badge tone={user.isActive ? "success" : "neutral"} dot>
                    {user.isActive ? "Active" : "Suspended"}
                  </Badge>
                  {user.emailVerifiedAt ? (
                    <Badge tone="brand">Email verified</Badge>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {user.email} · {ROLE_LABELS[user.role]} · joined{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              {user.role !== "ADMIN" && (
                <Button
                  size="sm"
                  variant={user.isActive ? "ghost" : "outline"}
                  className={user.isActive ? "text-red-600 hover:bg-red-50" : ""}
                  loading={busyId === user.id}
                  disabled={busyId !== null}
                  leftIcon={
                    user.isActive ? (
                      <UserX className="h-4 w-4" aria-hidden />
                    ) : (
                      <UserCheck className="h-4 w-4" aria-hidden />
                    )
                  }
                  onClick={() => toggle(user)}
                >
                  {user.isActive ? "Suspend" : "Reactivate"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}