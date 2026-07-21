import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Case Document Review",
  description: "Lawyer review of client immigration document submissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
