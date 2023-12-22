import React, { useEffect, useState } from "react";
import Router from "next/router";
import { useRouter } from "next/router";
import {
  ConnectButton,
  Chains,
  useChain,
  useSetIsWalletModalOpen,
  useWallet,
} from "@openformat/react";
import { useWeb3Connect } from "../utils/useWeb3Connect";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import axios from "axios";

export default function Login() {
  // Set profile data on login
  console.log("Set Profile Data");
  const router = useRouter();
  const { data: session } = useSession();
  const validSession = session?.user?.address;
  const { address } = useWallet();

  const prevAddress = session?.user?.address;
  const setIsWalletModalOpen = useSetIsWalletModalOpen();

  const { chainId } = useChain();

  const { handleConnect } = useWeb3Connect();
  useEffect(() => {
    if (chainId === Chains.polygonMumbai.id && !validSession) {
      handleConnect();
    }
  }, [chainId]);

  useEffect(() => {
    const lastConnectedWallet = JSON.parse(
      localStorage.getItem(
        "__TW__/coordinatorStorage/lastConnectedWallet"
      ) as any
    );
    const localWallet = JSON.parse(
      localStorage.getItem("__TW__/localWallet/localWalletData") as any
    );

    if (
      validSession &&
      router.pathname !== "/login" &&
      lastConnectedWallet?.walletId !== "metamask" &&
      localWallet
    ) {
      setIsWalletModalOpen(true);
    }
  }, [validSession]);

  useEffect(() => {
    if (prevAddress && address !== prevAddress) {
      router.replace("/logout");
      return;
    }
  }, [address]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      // Redirect on successful login
      Router.push("/");
    } else {
      // Handle errors
      console.error("Login failed");
    }
  };

  return (
    <>
      <h1>Web3</h1>
      <ConnectButton
        switchToActiveChain={true}
        modalSize="compact"
        welcomeScreen={{
          title: "Connect your wallet",
          subtitle: "Connect with Metamask or Continue as Guest.",
        }}
        modalTitleIconUrl={"https://app.openformat.tech/favicon.ico"}
      />

      <h2>Magic Link</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    const baseURL = process.env.NEXT_PUBLIC_API_HOSTNAME + "/api/v1";
    const res = await axios.post(`${baseURL}/auth/refresh_token`, {
      refreshToken: session.user.refresh_token,
    });

    const me = await axios.get(`${baseURL}/profile/me`, {
      headers: { Authorization: `Bearer ${res.data.accessToken}` },
    });

    return {
      props: {
        profileData: me.data,
      },
    };
  } else {
    return {
      props: {},
    };
  }
};
