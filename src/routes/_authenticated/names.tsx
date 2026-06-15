import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { generateNames } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/names")({
  component: NamesPage,
});

const COUNTRIES = ["Canada", "USA", "UK", "Saudi Arabia", "UAE", "Pakistan", "Australia", "Germany", "France", "Spain", "Turkey", "India", "Egypt", "Brazil", "Mexico", "Indonesia", "Nigeria", "Bangladesh", "Italy"];

function NamesPage() {
  const [country, setCountry] = useState("Pakistan");
  const [gender, setGender] = useState<"male" | "female" | "mixed">("mixed");
  const [count, setCount] = useState(10);

  const mut = useMutation({
    mutationFn: () => generateNames({ data: { country, gender, count } }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Name Generator</h1>
        <p className="text-sm text-muted-foreground">Authentic local names by country and gender.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Country</Label>
            <Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female" | "mixed")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">How many</Label>
            <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
        </div>
        <Button disabled={mut.isPending} onClick={() => mut.mutate()} className="w-full">
          {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
          Generate names
        </Button>
      </div>
      {mut.data && <OutputCard label={`${gender} names — ${country}`} value={mut.data.names} />}
    </div>
  );
}
