import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/utils/apiClient";
import {
  ConnectButton,
  useOpenFormat,
  useWallet,
} from "@openformat/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { address } = useWallet();
  const { sdk } = useOpenFormat();

  const isActive = (path: string) => {
    return router.pathname === path ? "nav__active" : "";
  };

  const handleAuth = async () => {
    try {
      const challengeResponse = await apiClient.post(
        "auth/challenge",
        { eth_address: address }
      );
      const signedMessage = await sdk.signer?.signMessage(
        challengeResponse.data.challenge
      );

      await apiClient.post("auth/verify", {
        eth_address: address,
        signature: signedMessage,
      });
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  useEffect(() => {
    if (address && !isAuthenticated) {
      handleAuth();
    }
  }, [address]);

  return (
    <header>
      <div>
        <a href="/">
          <Image
            height={50}
            width={50}
            src="/logo.png"
            alt="Logo"
            className="header__logo"
          />
        </a>
      </div>
      <nav>
        <a href="/" className={isActive("/")}>
          Play
        </a>
        <a href="/profile" className={isActive("/profile")}>
          Profile
        </a>
        <a href="/leaderboard" className={isActive("/leaderboard")}>
          Leaderboard
        </a>
        <a href="/quests" className={isActive("/quests")}>
          Quests
        </a>
      </nav>
      <ConnectButton modalSize="compact" />
    </header>
  );
}
