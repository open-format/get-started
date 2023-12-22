import { Hono } from "hono";
import { cors } from "hono/cors";
import actions from "./routes/api/v1/actions";
import auth from "./routes/api/v1/auth";
import missions from "./routes/api/v1/missions";
import profile from "./routes/api/v1/profile";
import rewards from "./routes/api/v1/rewards";
import { handle } from "hono/aws-lambda";
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

const app = new Hono().basePath("/api/v1");

export const handler = handle(app);

app.use("*", cors({ origin: ["http://localhost:3000"] }));

app.get("/ping", (c) => c.text("👋"));
app.route("/auth", auth);
app.route("/rewards", rewards);
app.route("/profile", profile);
app.route("/missions", missions);
app.route("/actions", actions);

app.get("/", (c) => c.text("Welcome to OPENFORMATTT GetStarted!"));

app.get("/login", (c) => {
  return c.html(`
      <h1>Login</h1>
      <form action="/login" method="post">
        <input type="email" name="email" placeholder="Enter your email" required />
        <button type="submit">Send Magic Link</button>
      </form>
    `);
});

app.post("/login", async (c) => {
  const formData = await c.req.parseBody();
  const email = formData.email as string;
  if (!email) {
    return c.text("Email is required", 400);
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: "/welcome",
      },
    });
    if (error) {
      return c.text(`Error: ${error.message}`, 400);
    }

    return c.text("Magic link sent to your email. Please check your inbox!");
  } catch (err) {
    return c.text(`An error occurred: ${err.message}`, 500);
  }
});

app.post("/welcome", async (c) => {
  const body = await c.req.parseBody();
  if (!body) {
    return c.json({ status: 401, message: "The request payload is required" });
  }
  switch (body.type) {
    case "magiclink":
      // Complete the sign in process using the token
      let { error } = await supabase.auth.signInWithOtp({ token: body.token });

      if (error) {
        console.error("Error completing sign in:", error);
        return c.text(`Error: ${error.message}`, 400);
      } else {
        console.log("Sign in successful!");
        // Redirect user to the dashboard page
        return c.redirect("/dashboard");
      }
    default:
      return c.text("Invalid request type", 400);
  }
});

export default {
  port: 8080,
  fetch: app.fetch,
};
