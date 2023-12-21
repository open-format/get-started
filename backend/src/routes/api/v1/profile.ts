import { Chains, OpenFormatSDK } from "@openformat/sdk";
import { Hono } from "hono";
import { GetUserProfileResponse } from "../../../../@types";
import { getUserProfile } from "../../../queries";
import { weiToNumber } from "../../../utils/formatting";
import validator from "validator";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Bun.env.SUPABASE_PROJECT_URL;
if (!supabaseUrl) {
  throw new Error("SUPABASE_PROJECT_URL is not set");
}
const supabaseAnonKey = Bun.env.SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is not set");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

profile.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ status: "Failed", message: err.message }, 500);
});

profile.get("/me", async (c) => {
  const userAddress = c.req.query("eth_address");
  const NAME = "John";
  const EMAIL = "John@example.com";

  const { data, error } = await supabase
    .from("wallets")
    .select(
      `
      eth_address,
      profile_id (
        id,
        auth_user_id,
        nickname,
        email_address,
        user_type
      )
    `
    )
    .eq("eth_address", userAddress)
    .single();

  if (error) {
    console.log(error);
    return c.json({ error: "Error processing the request" }, 500);
  }

  console.log("User data from DB: ", data);

  const response = await sdk.subgraph.rawRequest<GetUserProfileResponse>(
    getUserProfile,
    {
      user: userAddress.toLowerCase(),
      app: sdk.appId.toLowerCase(),
      xp: (process.env.XP_TOKEN_ID as string).toLowerCase(),
      rewardToken: (process.env.REWARD_TOKEN_ID as string).toLowerCase(),
    }
  );

  const XPBalance = response.user?.tokenBalances.find(
    (token) => token.token.id === process.env.XP_TOKEN_ID?.toLowerCase()
  );
  const RewardTokenBalance = response.user?.tokenBalances.find(
    (token) => token.token.id === process.env.REWARD_TOKEN_ID?.toLowerCase()
  );

  return c.json({
    status: Status.SUCCESS,
    name: data.profile_id.nickname,
    email: data.profile_id.email_address,
    eth_address: userAddress,
    xp_balance: weiToNumber(XPBalance?.balance),
    reward_token_balance: weiToNumber(RewardTokenBalance?.balance),
    completed_missions: response.missions,
    completed_actions: response.actions,
  });
});

profile.post("/me", async (c) => {
  try {
    const body = await c.req.json();
    const { eth_address, nickname, email_address } = body;

    if (
      !eth_address ||
      typeof eth_address !== "string" ||
      eth_address.trim() === ""
    ) {
      return c.json(
        {
          status: "failed",
          reason: "eth_address is required",
        },
        400
      );
    }

    if (email_address && !validator.isEmail(email_address)) {
      return c.json(
        {
          status: "failed",
          reason: "Email address is invalid",
        },
        400
      );
    }

    // Validate and sanitise the email address
    const sanitisedEmail =
      email_address && validator.isEmail(email_address)
        ? validator.normalizeEmail(email_address)
        : null;

    if (sanitisedEmail) {
      // Update any current users with the same email address and not the same eth address to remove their email address
      /*
      await prisma.user.updateMany({
        where: {
          email_address: sanitisedEmail,
          NOT: { eth_address }
        },
        data: { email_address: null }
      });
      */
    }

    // Perform the upsert operation
    /*
    const user = await prisma.user.upsert({
      where: { eth_address },
      update: {
        nickname,
        discord_user_id,
        discord_user_name,
        ...(sanitisedEmail && { email_address: sanitisedEmail })
      },
      create: {
        eth_address,
        nickname,
        discord_user_id,
        discord_user_name,
        ...(sanitisedEmail && { email_address: sanitisedEmail }) // Add email_address only if sanitisedEmail is valid
      }
    });
    */

    // Convert BigInt fields to String for JSON serialization
    /*
    const userForResponse = {
      ...user,
      discord_user_id: user.discord_user_id
        ? user.discord_user_id.toString()
        : null
    };
    return c.json(
      { status: "success", user: userForResponse },
      200
    );
    return res.json({ status: "success", user: userForResponse });
    */

    return c.json(
      { status: "success", user: { eth_address, nickname, email_address } },
      200
    );
  } catch (e: any) {
    console.error("Error:", e);
    return c.json(
      {
        status: "failed",
        reason: e.message || "An unexpected error occurred",
      },
      500
    );
  }
});

export default profile;
