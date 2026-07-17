import { Archivo, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  axes: ["wdth"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});
