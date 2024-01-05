import apiClient from "@/utils/apiClient";
import { useBalance } from "@/utils/hooks";
import {
  ContractType,
  ERC20Base,
  toWei,
  useOpenFormat,
  useWallet,
} from "@openformat/react";
import { BigNumber } from "ethers";
import { useState } from "react";

export default function PlayPage() {
  const { address } = useWallet();
  const { sdk } = useOpenFormat();

  const [isLoadingRewards, setIsLoadingRewards] =
    useState<boolean>(false);
  const [isLoadingSpendToken, setIsLoadingSpendToken] =
    useState<boolean>(false);

  const [hasSpent, setHasSpent] = useState<boolean>(false);

  const balance = useBalance(
    process.env.NEXT_PUBLIC_REWARD_TOKEN_ID as string,
    address as string
  );

  const BALANCE_TOO_LOW = BigNumber.from(balance).lte(1);

  async function handleRewards() {
    setIsLoadingRewards(true);
    await apiClient
      .post("rewards/token-system/trigger", {
        user_address: address,
        action_id: "test_action",
      })
      .then((res) =>
        alert(`Success!, View transaction: ${res.data.transaction}`)
      );
    setIsLoadingRewards(false);
  }

  async function spendTokens() {
    setIsLoadingSpendToken(true);
    try {
      if (!process.env.NEXT_PUBLIC_APPLICATION_OWNER_ADDRESS) {
        throw new Error(
          "NEXT_PUBLIC_APPLICATION_OWNER_ADDRESS not set in .env.local"
        );
      }
      if (address) {
        sdk.setStarId(
          process.env.NEXT_PUBLIC_APPLICATION_ID as string
        );
        const rewardToken = (await sdk.getContract({
          contractAddress: process.env
            .NEXT_PUBLIC_REWARD_TOKEN_ID as string,
          type: ContractType.Token,
        })) as ERC20Base;

        await rewardToken.transfer({
          to: process.env
            .NEXT_PUBLIC_APPLICATION_OWNER_ADDRESS as string,
          amount: toWei("1"),
        });

        setHasSpent(true);
      }
    } catch (e: any) {
      console.log(e.message);
      alert(e.message);
    }
    setIsLoadingSpendToken(false);
  }

  return (
    <section id="welcome" className="main">
      <h2>Demo Application</h2>
      <div className="welcome__welcome">
        <div className="welcome__description">
          <p>
            Here is our demo app. This basic application can reward
            the connected user XP, Reward Tokens and Badges for
            completing Actions and Quests.
          </p>

          <p>
            To update the Actions and Quests (Missions) for this
            application, please refer to the Token System Usage Guide
            in the README.
          </p>
        </div>
      </div>

      <ul className="welcome__list">
        <li className="welcome__item">
          <h3 className="welcome__item-title">Reward Tokens</h3>
          <p className="welcome__item-description">
            This action sends XP and Reward Tokens to the connected
            user. Ideal for incentivising user engagement. Connect
            your wallet, press the Reward button, and watch your token
            balance increase in your profile, and your address appear
            in the leaderboard.
          </p>
          {address && (
            <button
              onClick={handleRewards}
              disabled={isLoadingRewards}
            >
              {isLoadingRewards
                ? "Loading..."
                : "Reward Connected User"}
            </button>
          )}
        </li>
        <li className="welcome__item">
          <h3 className="welcome__item-title">Token-Based Access</h3>
          <p className="welcome__item-description">
            This action enables the connected user to spend Reward
            Tokens to unlock the special content below. Ideal for
            unlocking features or making in-app purchases. This action
            could also allow access simply by holding a Token or
            Badge. This is ideal for offering both active reward-based
            interactions and passive benefits for user loyalty in your
            application.
          </p>
          {address && (
            <>
              <button
                onClick={spendTokens}
                disabled={isLoadingSpendToken || BALANCE_TOO_LOW}
              >
                {isLoadingSpendToken
                  ? "Loading..."
                  : "Spend 1 Token to Unlock Content"}
              </button>
              {BALANCE_TOO_LOW && (
                <p className="welcome__item-error">
                  The connected wallet does not have enough Reward
                  Tokens. Trigger the action above to receive some
                  Reward Tokens.
                </p>
              )}
            </>
          )}
        </li>

        <li className="welcome__item">
          <h3 className="welcome__item-title">Special Content 🔑</h3>
          <p
            className="welcome__item-description"
            style={{
              filter: !hasSpent ? "blur(8px)" : "blur(0px)",
            }}
          >
            Some Special content that has been reveal once spending
            Reward Tokens.
          </p>
        </li>
      </ul>
    </section>
  );
}
