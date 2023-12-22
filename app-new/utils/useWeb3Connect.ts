import { useWallet } from "@openformat/react";
import axios from "axios";
import { ethers } from "ethers";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export const useWeb3Connect = () => {
  const router = useRouter();
  const { isConnected, address, wallet } = useWallet();

  const handleConnect = async () => {
    try {
      // @TODO This can be cleaner.
      await signMessage()
        .then(async (apiTokens) => {
          if (apiTokens) {
            await signIn("web3", {
              redirect: false,
              address,
              access_token: apiTokens.accessToken,
              refresh_token: apiTokens.refreshToken,
            }).then(() => router.replace("/profile"));
          }
        })
        .then(() => {
          /*
          handleRewards({
            address: address as string,
            action_id: "connect_wallet",
          });
          */
        });
    } catch (e) {
      console.error({ e });
    }
  };

  const signMessage = async () => {
    if (wallet) {
      const authClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_HOSTNAME + "/api/v1",
      });

      try {
        if (isConnected) {
          const challengeResponse = await authClient.post("/auth/challenge", {
            publicAddress: address,
          });
          if (!challengeResponse.data || !challengeResponse.data.challenge) {
            console.error("Invalid challenge response from server.");
            return;
          }

          const challenge = challengeResponse.data.challenge;

          const signer = wallet.getSigner();

          const userMessage =
            "Open Format (" +
            window.location.host +
            ") wants you to sign in with your Ethereum account:\n" +
            address +
            "\n\n" +
            "Please make sure that the domain above matches the URL of the current website\n\n" +
            "Nonce: ";

          const signature = await (
            await signer
          ).signMessage(userMessage + challenge);

          if (!signature) {
            console.error("Failed to sign the challenge.");
            throw new Error("Failed to sign the challenge.");
          }

          //@TODO
          // Store JWT in JavaScript closures also Web Workers
          // Back-end to Back-end Next Server Side
          const authResponse = await authClient.post("/auth/verify", {
            signature: signature,
            publicAddress: address,
            userMessage: userMessage,
          });

          if (authResponse.data) {
            return {
              accessToken: authResponse.data.accessToken,
              refreshToken: authResponse.data.refreshToken,
            };
          } else {
            console.error("Invalid auth response from server.");
          }
        }
      } catch (e) {
        if (e.code === "ACTION_REJECTED") {
          // User rejected the transaction in their Wallet
        }
        console.error(e);
        //handleDisconnect();
      }
    } else {
      console.error("No wallet available for signing");
    }
  };

  return {
    isConnected,
    handleConnect,
    //handleDisconnect,
  };
};
