import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import { Chains, OpenFormatProvider } from "@openformat/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";

const queryClient = new QueryClient();

const poppins = Poppins({ subsets: ["latin"], weight: ["400"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <OpenFormatProvider
        config={{
          //@ts-ignore
          networks: [Chains.polygonMumbai],
          appId: "",
          activeChain: "mumbai",
        }}
      >
        <QueryClientProvider client={queryClient}>
          <main className={poppins.className}>
            <Header />
            <Component {...pageProps} />
            <Footer />
          </main>
        </QueryClientProvider>
      </OpenFormatProvider>
    </AuthProvider>
  );
}
