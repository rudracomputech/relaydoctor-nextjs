import type { Metadata } from "next";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SkipToMain } from "@/components/skip-to-main";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

import TopLoader from "@/components/top-loader"

export const metadata: Metadata = {
  title: "relaydor Admin Panel",
  description: "Medical Doctor Referral and Collaboration Network Administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultOpen = true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <TopLoader />
      <SkipToMain />
      <AppSidebar />
      <div
        id='content'
        className={cn(
          'max-w-full w-full ml-auto',
          'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
          'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
          'transition-[width] ease-linear duration-200',
          'h-svh flex flex-col',
          'group-data-[scroll-locked=1]/body:h-full',
          'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
        )}
      >
        {children}
      </div>
    </SidebarProvider>
  );
}