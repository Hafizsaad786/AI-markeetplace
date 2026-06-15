import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OutputCard({ label, value }: { label: string; value: string | string[] | undefined | null }) {
  const [copied, setCopied] = useState(false);
  if (value === undefined || value === null) return null;
  const text = Array.isArray(value) ? value.join(", ") : String(value);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</h4>
        <Button size="sm" variant="ghost" onClick={copy} className="h-7 px-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span key={i} className="text-xs rounded-md bg-secondary px-2 py-1 text-secondary-foreground">{v}</span>
          ))}
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">{text}</p>
      )}
    </div>
  );
}
