import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingWhatsApp, Footer } from "@/components/WhatsAppButtons";
import { Button } from "@/components/ui/button";

const profileQO = queryOptions({
  queryKey: ["my-profile"],
  retry: false,
  queryFn: async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error("Please sign in again.");

    const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, status, created_at, updated_at").eq("id", userData.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
    ]);

    if (profileError) throw new Error(profileError.message);
    if (rolesError) throw new Error(rolesError.message);
    if (!profile) throw new Error("Your account profile is not ready yet. Please sign out and sign in again.");

    return {
      profile,
      isAdmin: (roles ?? []).some((r: { role: string }) => r.role === "admin"),
    };
  },
});

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { data, isLoading, error, refetch } = useQuery(profileQO);
  const nav = useNavigate();

  useEffect(() => {
    if (data?.profile?.status === "pending") nav({ to: "/pending", replace: true });
    if (data?.profile?.status === "rejected") {
      supabase.auth.signOut().then(() => nav({ to: "/login", replace: true }));
    }
  }, [data, nav]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="font-display text-xl font-bold text-foreground">Account access check failed</h1>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => refetch()}>Try again</Button>
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login", replace: true }); }}>Sign in again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.profile.status !== "approved") {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar isAdmin={data.isAdmin} />
        <SidebarInset className="flex-1 min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground truncate">
              {data.profile.email}
              {data.isAdmin && <span className="ml-2 rounded bg-primary/20 text-primary px-2 py-0.5 text-xs">ADMIN</span>}
            </span>
          </header>
          <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
        <FloatingWhatsApp />
      </div>
    </SidebarProvider>
  );
}
