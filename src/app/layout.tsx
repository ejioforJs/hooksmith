import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HookSmith",
    template: "%s | HookSmith",
  },
  description:
    "Generate premium viral hook ideas for content in seconds with a fast frontend-only workspace.",
  applicationName: "HookSmith",
  category: "productivity",
  keywords: [
    "content hooks",
    "viral hooks",
    "creator tools",
    "frontend-only app",
    "copywriting",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "HookSmith",
    description:
      "Create scroll-stopping hooks in seconds with a polished frontend-only ideation workspace.",
    siteName: "HookSmith",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HookSmith",
    description:
      "Generate sharp curiosity, story, contrarian, and urgency hooks without a backend or login.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
