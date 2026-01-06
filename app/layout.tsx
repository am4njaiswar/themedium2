import type { Metadata } from "next";
import { Inter, Roboto_Mono, Special_Elite } from "next/font/google"; 
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const specialElite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-special-elite" });

export const metadata: Metadata = {
  title: "PULSE | Communication Evolution",
  description: "A time-traveling journey through the history of messaging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`
        ${inter.variable} ${robotoMono.variable} ${specialElite.variable} 
        bg-black antialiased overflow-hidden
      `}>
        <SocketProvider>
        {children}
        </SocketProvider>
      </body>
    </html>
  );
}