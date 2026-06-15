import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { generateBranding } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/branding")({
  component: BrandingPage,
});

const VIBES = ["trustworthy local", "premium boutique", "fun & playful", "minimal modern", "warm family", "bold urban"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia"];

function BrandingPage() {
  const [form, setForm] = useState({ business: "", industry: "", country: "Canada", vibe: "trustworthy local", notes: "", describe: "" });
  const mut = useMutation({
    mutationFn: (d: typeof form) => generateBranding({ data: d }),
    onError: (e: Error) => toast.error(e.message),
  });
  const canGen = !!(form.business.trim() || form.describe.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Branding Kit</h1>
          <p className="text-sm text-muted-foreground">Fill any fields, or just describe what you want.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Field label="Just describe what you want (optional)"><Textarea rows={3} value={form.describe} onChange={(e) => setForm({ ...form, describe: e.target.value })} placeholder="Branding for a premium car detailing studio in Dubai" /></Field>
          <Field label="Business description"><Input value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} placeholder="Carpet cleaning service in Vancouver" /></Field>
          <Field label="Industry"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Home cleaning" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country"><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Vibe"><Select value={form.vibe} onValueChange={(v) => setForm({ ...form, vibe: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VIBES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <Button className="w-full" disabled={!canGen || mut.isPending} onClick={() => mut.mutate(form)}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate kit
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {mut.data && (
          <>
            <OutputCard label="Business name ideas" value={mut.data.business_names} />
            <OutputCard label="Slogans" value={mut.data.slogans} />
            <OutputCard label="Brand colors" value={mut.data.brand_colors} />
            <OutputCard label="Logo ideas" value={mut.data.logo_ideas} />
            <OutputCard label="WhatsApp bio" value={mut.data.whatsapp_bio} />
            <OutputCard label="Instagram bio" value={mut.data.instagram_bio} />
            <OutputCard label="Cover photo concept" value={mut.data.cover_photo_concept} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
