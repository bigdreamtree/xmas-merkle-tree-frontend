import type { Metadata } from "next";
import { Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

const nanumPenScript = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  preload: true,
  variable: "--font-nanum-pen-script",
});

export const metadata: Metadata = {
  title: "X-mas Merkle Tree",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nanumPenScript.className} style={{ fontSize: "18px" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
