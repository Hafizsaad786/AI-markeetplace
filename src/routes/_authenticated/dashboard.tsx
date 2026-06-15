import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageOpen, ImagePlus, ScanSearch, Users, Megaphone, MessageSquare, Languages, Sparkles, Reply } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const tiles = [
  { to: "/listings", icon: PackageOpen, title: "Listing Generator", desc: "Human-like titles, descriptions, prices, tags." },
  { to: "/images", icon: ImagePlus, title: "AI Image Studio", desc: "Realistic Marketplace-style product photos." },
  { to: "/analyzer", icon: ScanSearch, title: "Image Analyzer", desc: "Upload a photo → get full listing data." },
  { to: "/names", icon: Users, title: "Name Generator", desc: "Authentic local names by country & gender." },
  { to: "/posts", icon: MessageSquare, title: "FB Posts", desc: "Group, promo, seasonal, community posts." },
  { to: "/ads", icon: Megaphone, title: "Ad Creatives", desc: "Headlines, hooks, primary text, CTAs." },
  { to: "/translator", icon: Languages, title: "Translator", desc: "Native-sounding multi-language localization." },
  { to: "/branding", icon: Sparkles, title: "Branding Kit", desc: "Names, slogans, bios, colors, logo ideas." },
  { to: "/replies", icon: Reply, title: "Reply Generator", desc: "Smart buyer message replies." },
] as const;

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Pick a tool to start creating realistic, high-converting marketplace content.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="group rounded-xl border border-border bg-card p-5 hover:border-primary transition-colors">
            <div className="grid h-10 w-10 place-items-center rounded-lg mb-3 group-hover:scale-105 transition" style={{ background: "var(--gradient-ember)" }}>
              <t.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold">{t.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
