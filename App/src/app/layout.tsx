import "~/styles/globals.css";

import { type Metadata } from "next";
// import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Client Database Application",
  description: "A client database application built with Next.js and T3 stack.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// const geist = Geist({
//   subsets: ["latin"],
// });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
