import {  Roboto } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'})



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", roboto.variable, "font-sans")}
    >
      <body>
        <Toaster duration={5000} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
