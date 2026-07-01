import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Idea Garage — Your Intelligent Creative Workspace",
  description: "Capture, organize, and grow every idea in your personal AI-powered Idea Garage. Every thought has a parking space.",
  keywords: ["ideas", "brainstorming", "productivity", "AI", "creative workspace"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-garage-bg text-slate-200 antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#13131f",
                color: "#e2e8f0",
                border: "1px solid #1e1e35",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#39d98a", secondary: "#070710" },
              },
              error: {
                iconTheme: { primary: "#f75959", secondary: "#070710" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
