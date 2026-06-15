import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { generateFbPost } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/posts")({
  component: PostsPage,
});

const POST_TYPES = ["group selling post", "promotional post", "engagement post", "local service post", "seasonal sale", "customer-style recommendation", "limited-time offer", "community-friendly"];
const TONES = ["casual", "professional", "friendly", "local seller", "business owner", "urgent sale", "premium service"];
const LANGUAGES = ["English", "Urdu", "Arabic", "French", "Spanish", "Hindi", "Punjabi", "Turkish", "German"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia", "Germany"];

function PostsPage() {
  const [form, setForm] = useState({
    topic: "",
    postType: POST_TYPES[0],
    tone: "friendly",
    language: "English",
    country: "Canada",
    notes: "",
    describe: "",
  });
  const mut = useMutation({
    mutationFn: (d: typeof form) => generateFbPost({ data: d }),
    onError: (e: Error) => toast.error(e.message),
  });
  const canGen = !!(form.topic.trim() || form.describe.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">FB Post Generator</h1>
          <p className="text-sm text-muted-foreground">Fill any fields, or just describe what you want.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Field label="Just describe what you want (optional)"><Textarea rows={3} value={form.describe} onChange={(e) => setForm({ ...form, describe: e.target.value })} placeholder="Write a community-friendly post for selling my old laptop" /></Field>
          <Field label="Topic"><Textarea rows={3} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Selling a barely used IKEA bookshelf in Toronto..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Post type"><Select value={form.postType} onValueChange={(v) => setForm({ ...form, postType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{POST_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Tone"><Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TONES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Language"><Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Country"><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <Button className="w-full" disabled={!canGen || mut.isPending} onClick={() => mut.mutate(form)}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
            Generate post
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {mut.data && (
          <>
            <OutputCard label="Full Post" value={mut.data.post} />
            <OutputCard label="Short Version" value={mut.data.short_version} />
            <OutputCard label="Hashtags" value={mut.data.hashtags} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
