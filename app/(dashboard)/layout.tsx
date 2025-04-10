import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import { UpgradeModal } from "./_components/UpgradeModal";
import { SignInModal } from "@/components/SigninModal";
import { AppProvider } from "@/context/AppProvider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <SidebarProvider
        className="h-[min(100dvh, 100vh)] w-[100vw] "
        style={
          {
            "--sidebar-width": "307px",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <main className="w-full flex-1">{children}</main>
      </SidebarProvider>

      <UpgradeModal />
      <SignInModal />
    </AppProvider>
  );
}
