import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/components/RoleContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DateRangeProvider } from "@/components/DateRangeContext";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CostLens AI — HR Cost Intelligence",
  description:
    "Turn calendar meetings into project-level HR cost intelligence. AI attribution, cost dashboards, and anomaly detection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} data-theme="dark">
      <body className="bg-canvas">
        <ThemeProvider>
          <RoleProvider>
            <DateRangeProvider>{children}</DateRangeProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
