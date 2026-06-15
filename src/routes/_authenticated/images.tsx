import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { flushSync } from "react-dom";
import { Loader2, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/images")({
  component: ImagesPage,
});

const PRODUCT = ["Furniture in customer home", "Mattress in bedroom", "Sofa cleaning before/after", "Carpet cleaning action", "Car detailing scene", "Local service team working", "Appliance delivery", "Used item Marketplace style", "Lifestyle product"];
const LIGHTING = ["Natural daylight", "Warm indoor", "Slightly dim evening", "Phone flash", "Overcast soft"];
const CAMERA = ["Phone snapshot", "Slightly tilted angle", "Eye-level casual", "Top-down", "Wide room shot"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia", "Germany"];
const REALISM = ["Customer-shot realism (imperfect)", "Tidy but real", "Professional but believable"];

function ImagesPage() {
  const [form, setForm] = useState({
    subject: "",
    productType: PRODUCT[0],
    lighting: LIGHTING[0],
    camera: CAMERA[0],
    country: COUNTRIES[0],
    realism: REALISM[0],
    notes: "",
  });
  const [src, setSrc] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate() {
    const subject = form.subject.trim() || form.notes.trim();
    if (!subject) {
      toast.error("Please describe the subject or add some notes.");
      return;
    }
    setSrc(null);
    setIsFinal(false);
    setLoading(true);

    const seed = Math.random().toString(36).slice(2, 8);
    const prompt = `Realistic, real-time Facebook Marketplace style photo. Subject: ${subject}. Scene type: ${form.productType}. Lighting: ${form.lighting}. Camera: ${form.camera}. Location aesthetic: ${form.country}. ${form.realism}. ${form.notes}. Strictly photo-realistic, no studio polish, no CGI symmetry, no watermarks. Natural shadows, textures, slight imperfections like a real phone photo. Variation ${seed}.`;

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok || !res.body) {
        toast.error(`Image generation failed (${res.status})`);
        setLoading(false);
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += value;
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const block of parts) {
          const eventLine = block.split("\n").find((l) => l.startsWith("event: "));
          const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          try {
            const payload = JSON.parse(dataLine.slice(6));
            if (payload.b64_json) {
              const url = `data:image/png;base64,${payload.b64_json}`;
              const final = eventLine?.includes("completed") ?? false;
              flushSync(() => {
                setSrc(url);
                if (final) setIsFinal(true);
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">AI Image Studio</h1>
          <p className="text-sm text-muted-foreground">Realistic, customer-shot style photos for your listings.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Field label="Describe the subject (or fill any options below)">
            <Textarea rows={3} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="A grey 3-seater sofa in a cozy living room with hardwood floor" />
          </Field>
          <Field label="Scene type"><Select value={form.productType} onValueChange={(v) => setForm({ ...form, productType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRODUCT.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lighting"><Select value={form.lighting} onValueChange={(v) => setForm({ ...form, lighting: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LIGHTING.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Camera"><Select value={form.camera} onValueChange={(v) => setForm({ ...form, camera: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CAMERA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Country aesthetic"><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Realism"><Select value={form.realism} onValueChange={(v) => setForm({ ...form, realism: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REALISM.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <Field label="Extra notes / free-text"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Pet bed in background, slight clutter on coffee table..." /></Field>
          <Button className="w-full" disabled={loading || (!form.subject.trim() && !form.notes.trim())} onClick={generate}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Generate image
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 min-h-[400px] grid place-items-center">
          {!src && !loading && <p className="text-muted-foreground text-sm">Your image will appear here.</p>}
          {loading && !src && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {src && (
            <img
              src={src}
              alt="Generated"
              className="max-w-full rounded-lg transition-[filter] duration-300"
              style={{ filter: isFinal ? "none" : "blur(16px)" }}
            />
          )}
        </div>
        {src && isFinal && (
          <a href={src} download="ai-marketplace.png">
            <Button variant="secondary" className="w-full"><Download className="h-4 w-4 mr-2" />Download</Button>
          </a>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
