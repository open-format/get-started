import { Chains, OpenFormatProvider } from "@openformat/react";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <OpenFormatProvider
        config={{
          networks: [Chains.polygonMumbai],
          appId: "",
          clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
          activeChain: "mumbai",
        }}
      >
        <Component {...pageProps} />
      </OpenFormatProvider>
    </SessionProvider>
  );
}
