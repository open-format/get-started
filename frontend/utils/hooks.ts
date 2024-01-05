import {
  ContractType,
  ERC20Base,
  fromWei,
  useOpenFormat,
} from "@openformat/react";
import { useEffect, useState } from "react";

export function useBalance(token: string, address: string) {
  const { sdk } = useOpenFormat();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;

      try {
        const rewardToken = (await sdk.getContract({
          contractAddress: token,
          type: ContractType.Token,
        })) as ERC20Base;

        const balance = await rewardToken.balanceOf({
          account: address,
        });
        setBalance(Number(fromWei(balance.toString())));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [address]);

  return balance;
}
