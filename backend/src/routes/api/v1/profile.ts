import { Chains, OpenFormatSDK } from "@openformat/sdk";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { decode } from "hono/jwt";
import validator from "validator";
import { GetUserProfileResponse } from "../../../../@types";
import { getUserProfile } from "../../../queries";
import { weiToNumber } from "../../../utils/formatting";

enum Status {
  SUCCESS = "success",
  FAIL = "failed",
}

const sdk = new OpenFormatSDK({
  network: Chains.polygonMumbai,
  starId: process.env.APPLICATION_ID as string,
  signer: process.env.PRIVATE_KEY,
});

const profile = new Hono();
const prisma = new PrismaClient();

profile.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ status: "Failed", message: err.message }, 500);
});

profile.get("/me", async (c) => {
  const cookie = getCookie(c, "accessToken");

  if (!cookie) {
    return c.json(
      { status: Status.FAIL, message: "Unauthorized" },
      401
    );
  }

  const { payload } = decode(cookie);

  const user = await prisma.user.findFirstOrThrow({
    where: { eth_address: payload.sub },
  });

  const USER = user.eth_address;
  const NAME = user.nickname;
  const EMAIL = user.email_address;

  const response =
    await sdk.subgraph.rawRequest<GetUserProfileResponse>(
      getUserProfile,
      {
        user: USER.toLowerCase(),
        app: sdk.appId.toLowerCase(),
        xp: (process.env.XP_TOKEN_ID as string).toLowerCase(),
        rewardToken: (
          process.env.REWARD_TOKEN_ID as string
        ).toLowerCase(),
      }
    );

  const XPBalance = response.user?.tokenBalances.find(
    (token) =>
      token.token.id === process.env.XP_TOKEN_ID?.toLowerCase()
  );
  const RewardTokenBalance = response.user?.tokenBalances.find(
    (token) =>
      token.token.id === process.env.REWARD_TOKEN_ID?.toLowerCase()
  );

  return c.json({
    status: Status.SUCCESS,
    data: {
      name: NAME,
      email: EMAIL,
      eth_address: USER,

      xp_balance: weiToNumber(XPBalance?.balance),
      reward_token_balance: weiToNumber(RewardTokenBalance?.balance),
      completed_missions: response.missions,
      completed_actions: response.actions,
    },
  });
});

profile.put("/me", async (c) => {
  const { sub } = c.get("jwtPayload");
  const { nickname, email_address } = await c.req.json();

  if (!validator.isEmail(email_address)) {
    return c.json(
      {
        status: Status.FAIL,
        data: { message: "invalid email address" },
      },
      400
    );
  }

  const user = await prisma.user.update({
    where: { eth_address: sub },
    data: {
      nickname,
      email_address,
    },
  });

  return c.json({ status: Status.SUCCESS, data: user });
});

export default profile;
