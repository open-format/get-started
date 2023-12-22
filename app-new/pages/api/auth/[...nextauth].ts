import axios from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "web3",
      name: "Web3",
      credentials: {},
      authorize: async (credentials, req) => {
        console.log("authorize");
        if (credentials.address) {
          // Ethereum address acts as a user ID
          return {
            id: credentials.address,
            access_token: req.body.access_token,
            refresh_token: req.body.refresh_token,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Default session life of 24 hours
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400", 10),
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      // Check provider (Web3 / GitHub / Discord) and save to DB
      const baseURL = process.env.NEXT_PUBLIC_API_HOSTNAME + "/api/v1";

      switch (account?.provider) {
        case "web3":
          // The user is signed in and has access. Add their Eth address to the DB
          try {
            const resPost = await axios.post(
              `${baseURL}/profile/me`,
              {
                eth_address: user.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${user.access_token}`,
                },
              }
            );
            return true;
          } catch (error) {
            console.error("Error creating user profile:", error);
            return false;
          }
          break;
        default:
          break;
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.id = user.id;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.access_token_expires = Date.now() + 10 * 1000;
      }

      // Refresh the token if it's expired
      if (
        token?.access_token_expires &&
        Date.now() > token.access_token_expires
      ) {
        const baseURL = process.env.NEXT_PUBLIC_API_HOSTNAME + "/api/v1";

        const newTokenInfo = await axios.post(`${baseURL}/auth/refresh_token`, {
          refreshToken: token.refresh_token,
        });

        const decodedToken = Buffer.from(
          newTokenInfo.data.accessToken.split(".")[1],
          "base64"
        ).toString("utf-8");

        token.access_token = newTokenInfo.accessToken;
        token.access_token_expires = JSON.parse(decodedToken).exp * 1000;
      }

      return token;
    },

    session: async ({ session, token }) => {
      // Assign the id from the token to the session's user object
      if (token?.id) {
        session.user.address = token.id;
        session.user.name = null;
        session.user.email = null;
        session.user.image = null;
        session.user.access_token = token.access_token;
        session.user.refresh_token = token.refresh_token;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
