import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PackageOpen,
  ImagePlus,
  ScanSearch,
  Users,
  Megaphone,
  MessageSquare,
  Languages,
  Sparkles,
  ShieldCheck,
  LogOut,
  Flame,
  Reply,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Listing Generator", url: "/listings", icon: PackageOpen },
  { title: "AI Image Studio", url: "/images", icon: ImagePlus },
  { title: "Image Analyzer", url: "/analyzer", icon: ScanSearch },
  { title: "Name Generator", url: "/names", icon: Users },
  { title: "FB Posts", url: "/posts", icon: MessageSquare },
  { title: "Ad Creatives", url: "/ads", icon: Megaphone },
  { title: "Translator", url: "/translator", icon: Languages },
  { title: "Branding Kit", url: "/branding", icon: Sparkles },
  { title: "Reply Generator", url: "/replies", icon: Reply },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-ember)" }}>
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="font-display text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            AI marketplace
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")}>
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>User Approvals</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
