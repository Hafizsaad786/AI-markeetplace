import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { generateReply } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/replies")({
  component: RepliesPage,
});

const TYPES = ["polite negotiation", "accept offer", "firm price hold", "answer questions", "schedule pickup", "decline lowball"];
const LANGUAGES = ["English", "Urdu", "Arabic", "French", "Spanish", "Hindi", "Turkish", "German"];

function RepliesPage() {
  const [form, setForm] = useState({ buyerMessage: "", replyType: "polite negotiation", language: "English", notes: "", describe: "" });
  const mut = useMutation({
    mutationFn: (d: typeof form) => generateReply({ data: d }),
    onError: (e: Error) => toast.error(e.message),
  });
  const canGen = !!(form.buyerMessage.trim() || form.describe.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Reply Generator</h1>
          <p className="text-sm text-muted-foreground">Fill any fields, or just describe what you want.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Field label="Just describe what you want (optional)"><Textarea rows={2} value={form.describe} onChange={(e) => setForm({ ...form, describe: e.target.value })} placeholder="Reply to a buyer asking for huge discount on my sofa" /></Field>
          <Field label="Buyer's message"><Textarea rows={4} value={form.buyerMessage} onChange={(e) => setForm({ ...form, buyerMessage: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reply type"><Select value={form.replyType} onValueChange={(v) => setForm({ ...form, replyType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Language"><Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <Field label="Your context (price, condition, etc.)"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <Button className="w-full" disabled={!canGen || mut.isPending} onClick={() => mut.mutate(form)}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Reply className="h-4 w-4 mr-2" />}
            Generate replies
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {mut.data && (
          <>
            <OutputCard label="Short reply" value={mut.data.short_reply} />
            <OutputCard label="Polite reply" value={mut.data.polite_reply} />
            <OutputCard label="Firm reply" value={mut.data.firm_reply} />
            <OutputCard label="Follow-up" value={mut.data.follow_up} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
