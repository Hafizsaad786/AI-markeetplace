import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Radio, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FloatingWhatsApp, Footer, WA_CHANNEL } from "@/components/WhatsAppButtons";

const ADMIN_WA_NUMBER = "923133488621";

export const Route = createFileRoute("/pending")({
  component: PendingPage,
});

function PendingPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) nav({ to: "/login" });
      else setEmail(data.user.email ?? "");
    });
  }, [nav]);

  async function recheck() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { nav({ to: "/login" }); return; }
    const { data: profile } = await supabase
      .from("profiles").select("status").eq("id", userData.user.id).single();
    if (profile?.status === "approved") nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="flex-1 grid place-items-center">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-4 rounded-2xl border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-ember)" }}>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--gradient-ember)" }}>
              <Clock className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">Awaiting admin approval</h1>
              <p className="text-sm text-muted-foreground">
                Your account ({email}) was created successfully.
              </p>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3 text-left">
              <p className="text-sm font-semibold text-primary text-center">
                Send your approval request to the admin
              </p>
              <a
                href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(
                  `Assalam u Alaikum Admin,\n\nMain ne AI marketplace pe account banaya hai. Meri request approve kar dein.\n\nEmail: ${email}\n\nShukriya.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition w-full"
              >
                <Send className="h-4 w-4" />
                Send Approval Request on WhatsApp
              </a>
              <p className="text-xs text-muted-foreground text-center">
                Admin: +92 313 3488621 — your email is auto-filled in the message.
              </p>
              <a
                href={WA_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold text-primary hover:bg-secondary transition w-full"
              >
                <Radio className="h-4 w-4" />
                Join our WhatsApp Channel
              </a>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={recheck}>Check status</Button>
              <Button
                variant="ghost"
                onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
