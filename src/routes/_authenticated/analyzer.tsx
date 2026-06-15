import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Upload, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analyzer")({
  component: AnalyzerPage,
});

const LANGUAGES = ["English", "Urdu", "Arabic", "French", "Spanish", "Hindi", "Punjabi", "Turkish", "German"];
const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia", "Germany"];

type AnalysisResult = {
  title?: string;
  description?: string;
  category?: string;
  estimated_size?: string;
  condition?: string;
  suggested_price?: string;
  tags?: string[];
  questions_to_ask?: string[];
};

function AnalyzerPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("Canada");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function onFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!imageDataUrl) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, language, country }),
      });
      if (!res.ok) {
        toast.error(`Analyze failed (${res.status})`);
      } else {
        setResult(await res.json());
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
          <h1 className="font-display text-2xl font-bold">Image Analyzer</h1>
          <p className="text-sm text-muted-foreground">Upload a product photo. Get title, description, size, condition, price, tags.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="" className="max-h-48 mx-auto rounded" />
            ) : (
              <div className="space-y-2 text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto" />
                <p className="text-sm">Click to upload an image</p>
              </div>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Language</Label>
              <Select value={language} onValueChange={setLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <Button className="w-full" disabled={!imageDataUrl || loading} onClick={analyze}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanSearch className="h-4 w-4 mr-2" />}
            Analyze image
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {!result && !loading && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Upload an image and click Analyze.
          </div>
        )}
        {loading && <div className="rounded-xl border border-border p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>}
        {result && (
          <>
            <OutputCard label="Title" value={result.title} />
            <OutputCard label="Description" value={result.description} />
            <div className="grid sm:grid-cols-2 gap-3">
              <OutputCard label="Category" value={result.category} />
              <OutputCard label="Estimated Size" value={result.estimated_size} />
              <OutputCard label="Condition" value={result.condition} />
              <OutputCard label="Suggested Price" value={result.suggested_price} />
            </div>
            <OutputCard label="Tags" value={result.tags} />
            <OutputCard label="Questions to ask buyer" value={result.questions_to_ask} />
          </>
        )}
      </div>
    </div>
  );
}
