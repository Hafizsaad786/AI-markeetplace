import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { generateListing } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/listings")({
  component: ListingsPage,
});

const CATEGORIES = ["Furniture", "Home Cleaning", "Carpet Cleaning", "Car Detailing", "Junk Removal", "Pest Control", "Appliances", "Electronics", "Home Decor", "Real Estate", "Local Services", "General"];
const CONDITIONS = ["Brand new", "Like new", "Used - excellent", "Used - good", "Used - fair", "For parts"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia", "Germany", "France", "Spain", "Turkey", "India"];
const LANGUAGES = ["English", "Urdu", "Arabic", "French", "Spanish", "Hindi", "Punjabi", "Turkish", "German", "Portuguese"];
const TONES = ["casual local seller", "friendly neighbor", "professional business", "urgent sale", "premium boutique"];
const DELIVERY = ["Pickup only", "Local delivery available", "Shipping nationwide", "Buyer's choice"];

function ListingsPage() {
  const [form, setForm] = useState({
    category: "Furniture",
    itemName: "",
    condition: "Used - excellent",
    country: "Canada",
    city: "",
    language: "English",
    tone: "casual local seller",
    delivery: "Pickup only",
    audience: "",
    priceHint: "",
    notes: "",
    describe: "",
  });

  const mut = useMutation({
    mutationFn: (data: typeof form) => generateListing({ data }),
    onError: (e: Error) => toast.error(e.message),
  });

  const result = mut.data;
  const canGenerate = !!(form.itemName.trim() || form.describe.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Listing Generator</h1>
          <p className="text-sm text-muted-foreground">Fill any fields you like — or just describe what you want. Every output is unique and FB-policy-safe.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label>Just describe what you want (optional)</Label>
            <Textarea rows={3} value={form.describe} onChange={(e) => setForm({ ...form, describe: e.target.value })} placeholder="e.g. Sell my used grey sofa in Toronto, around $200, family home, no pets" />
          </div>
          <div className="space-y-1.5">
            <Label>Item name</Label>
            <Input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="e.g. IKEA Malm queen bed frame" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Condition"><Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Country"><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Toronto" /></Field>
            <Field label="Language"><Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Tone"><Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TONES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Delivery"><Select value={form.delivery} onValueChange={(v) => setForm({ ...form, delivery: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DELIVERY.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Price hint"><Input value={form.priceHint} onChange={(e) => setForm({ ...form, priceHint: e.target.value })} placeholder="$120 firm" /></Field>
          </div>
          <Field label="Target audience"><Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="Students, families, etc." /></Field>
          <Field label="Extra notes"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Pet-free home, small scratch on left side..." /></Field>
          <Button className="w-full" disabled={!canGenerate || mut.isPending} onClick={() => mut.mutate(form)}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Generate listing
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {!result && !mut.isPending && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Fill the form and click Generate. Each field appears below in its own copyable box.
          </div>
        )}
        {mut.isPending && (
          <div className="rounded-xl border border-border p-12 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
            Crafting your listing…
          </div>
        )}
        {result && (
          <>
            <OutputCard label="Title" value={result.title} />
            <OutputCard label="Description" value={result.description} />
            <div className="grid sm:grid-cols-2 gap-3">
              <OutputCard label="Suggested Price" value={result.suggested_price} />
              <OutputCard label="Category" value={result.category} />
              <OutputCard label="Condition" value={result.condition} />
              <OutputCard label="Delivery Options" value={result.delivery_options} />
              <OutputCard label="Service Areas" value={result.service_areas} />
              <OutputCard label="Call to Action" value={result.cta} />
            </div>
            <OutputCard label="Tags / Keywords" value={result.tags} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
