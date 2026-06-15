import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FloatingWhatsApp, WhatsAppInlineButtons, Footer } from "@/components/WhatsAppButtons";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", userData.user.id)
      .single();
    if (profile?.status === "approved") {
      nav({ to: "/dashboard", replace: true });
    } else if (profile?.status === "rejected") {
      toast.error("Your account was rejected by an admin.");
      await supabase.auth.signOut();
    } else {
      nav({ to: "/pending", replace: true });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="flex-1 grid place-items-center">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-ember)" }}>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-ember)" }}>
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">AI marketplace</h1>
              <p className="text-xs text-muted-foreground">Sign in to your workspace</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Password</Label>
              <Input id="pwd" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <WhatsAppInlineButtons />
          <p className="text-center text-sm text-muted-foreground">
            No account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
          <p className="text-xs text-center text-muted-foreground">
            New accounts require admin approval before access.
          </p>
        </div>
      </div>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
