import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Potluck — Shared expenses, automatically settled",
  description:
    "Everyone brings something. Nobody has to ask. Group expense splitting that actually settles — on Initia.",
  openGraph: {
    title: "Potluck",
    description: "Everyone brings something. Nobody has to ask.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ height: "100%" }}>
      <body suppressHydrationWarning style={{ minHeight: "100%", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
