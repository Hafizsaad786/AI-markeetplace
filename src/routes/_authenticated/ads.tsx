import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { generateAd } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ads")({
  component: AdsPage,
});

const AD_TYPES = ["lead generation", "cleaning services", "furniture sale", "local business", "marketplace boost", "seasonal promotion", "home services", "moving sale", "clearance sale", "retargeting"];
const LANGUAGES = ["English", "Urdu", "Arabic", "French", "Spanish", "Hindi", "Turkish", "German"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia", "Germany"];

function AdsPage() {
  const [form, setForm] = useState({
    product: "",
    adType: AD_TYPES[0],
    offer: "",
    language: "English",
    country: "Canada",
    audience: "",
    notes: "",
    describe: "",
  });
  const mut = useMutation({
    mutationFn: (d: typeof form) => generateAd({ data: d }),
    onError: (e: Error) => toast.error(e.message),
  });
  const canGen = !!(form.product.trim() || form.describe.trim());
  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Ad Creative Generator</h1>
          <p className="text-sm text-muted-foreground">Fill any fields, or just describe what you want.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Field label="Just describe what you want (optional)"><Textarea rows={3} value={form.describe} onChange={(e) => setForm({ ...form, describe: e.target.value })} placeholder="Make an ad for my new cleaning service launch in Vancouver" /></Field>
          <Field label="Product / service"><Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Deep cleaning service in Toronto" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ad type"><Select value={form.adType} onValueChange={(v) => setForm({ ...form, adType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AD_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Country"><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Language"><Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Offer"><Input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} placeholder="20% off this week" /></Field>
          </div>
          <Field label="Audience"><Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="Busy parents, 25-45" /></Field>
          <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <Button className="w-full" disabled={!canGen || mut.isPending} onClick={() => mut.mutate(form)}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Megaphone className="h-4 w-4 mr-2" />}
            Generate ad
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {mut.data && (
          <>
            <OutputCard label="Headline" value={mut.data.headline} />
            <OutputCard label="Hook" value={mut.data.hook} />
            <OutputCard label="Primary Text" value={mut.data.primary_text} />
            <OutputCard label="Description" value={mut.data.description} />
            <div className="grid sm:grid-cols-2 gap-3">
              <OutputCard label="CTA Button" value={mut.data.cta_button} />
              <OutputCard label="Image Concept" value={mut.data.image_concept} />
            </div>
            <OutputCard label="Targeting Suggestion" value={mut.data.targeting_suggestion} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
