import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAllUsers, setUserStatus, deleteUser } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listAllUsers(),
  });

  const statusMut = useMutation({
    mutationFn: (v: { userId: string; status: "approved" | "rejected" | "pending" }) =>
      setUserStatus({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (userId: string) => deleteUser({ data: { userId } }),
    onSuccess: () => {
      toast.success("User removed");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function confirmDelete(userId: string, email: string) {
    if (confirm(`Remove ${email}? This permanently deletes their login access.`)) {
      delMut.mutate(userId);
    }
  }

  if (isLoading) return <div className="grid place-items-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="text-destructive">{(error as Error).message}</div>;

  const users = data?.users ?? [];
  const pending = users.filter((u) => u.status === "pending");
  const others = users.filter((u) => u.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">User Approvals</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, or fully remove users. Only approved users can access the app.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pending ({pending.length})</h2>
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
        <div className="space-y-2">
          {pending.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => statusMut.mutate({ userId: u.id, status: "approved" })}>
                  <Check className="h-4 w-4 mr-1" />Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => statusMut.mutate({ userId: u.id, status: "rejected" })}>
                  <X className="h-4 w-4 mr-1" />Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={() => confirmDelete(u.id, u.email)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All users ({others.length})</h2>
        <div className="space-y-2">
          {others.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs rounded px-2 py-1 ${
                  u.status === "approved" ? "bg-primary/20 text-primary" :
                  u.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                }`}>
                  {u.status === "approved" && <Check className="h-3 w-3 inline mr-1" />}
                  {u.status === "rejected" && <X className="h-3 w-3 inline mr-1" />}
                  {u.status === "pending" && <Clock className="h-3 w-3 inline mr-1" />}
                  {u.status}
                </span>
                {u.status === "approved" ? (
                  <Button size="sm" variant="ghost" onClick={() => statusMut.mutate({ userId: u.id, status: "rejected" })}>Revoke</Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => statusMut.mutate({ userId: u.id, status: "approved" })}>Approve</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => confirmDelete(u.id, u.email)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
