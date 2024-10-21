import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import logo from "@/app/img33acdae0f/logo.png";
import RainbowKitProviderApp from "@/src/FE/components/RainbowKit/RainbowKitProvider";



export const metadata: Metadata = {
  title: "Zk-Tsunami | mixer dapp",

  description:
    "ZK-Tsunami mixer dapp powered by the suter shield protocol ease of interface, maximum privacy, anonymity, security, decentralization and processing ",
  keywords: "Anonymity, Mixer, zk-snark, zk-tsunami, dapp, blockchain, privacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <RainbowKitProviderApp>
          <section
            className={
              "top-0 xp-taskbar fixed w-full py-6 z-10 flex justify-around items-center"
            }
          >
            <div>
              <Link href="/">
                <h1 className="text-2xl font-extrabold">DE-MIXER</h1>
              </Link>
            </div>
            <div>
              <ConnectButton />
            </div>
          </section>
          <section className="mt-20">
          {children}
          </section>
        </RainbowKitProviderApp>
      </body>
    </html>
  );
}
