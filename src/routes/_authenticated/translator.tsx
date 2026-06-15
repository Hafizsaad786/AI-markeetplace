import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { translateContent } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/translator")({
  component: TranslatorPage,
});

const LANGUAGES = ["English", "Urdu", "Arabic", "French", "Spanish", "Hindi", "Punjabi", "Turkish", "German", "Portuguese", "Italian", "Indonesian", "Bengali"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "India", "Australia", "Germany", "Brazil"];
const TONES = ["natural local", "casual", "formal", "marketplace seller", "professional service"];

function TranslatorPage() {
  const [form, setForm] = useState({ text: "", targetLanguage: "Urdu", country: "Pakistan", tone: "natural local" });
  const mut = useMutation({
    mutationFn: (d: typeof form) => translateContent({ data: d }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Translator</h1>
          <p className="text-sm text-muted-foreground">Native-sounding localization with local slang.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Field label="Source text *"><Textarea rows={6} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target language"><Select value={form.targetLanguage} onValueChange={(v) => setForm({ ...form, targetLanguage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Country"><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <Field label="Tone"><Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TONES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          <Button className="w-full" disabled={!form.text || mut.isPending} onClick={() => mut.mutate(form)}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Languages className="h-4 w-4 mr-2" />}
            Translate
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {mut.data && (
          <>
            <OutputCard label="Translated" value={mut.data.translated} />
            <OutputCard label="Localization notes" value={mut.data.notes} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
