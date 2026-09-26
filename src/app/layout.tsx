import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vansh — Every family has a story",
  description: "Build your private family tree, preserve memories, and connect generations with Vansh.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
