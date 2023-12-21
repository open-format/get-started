const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const ethers = require("ethers");

const usedNonces = new NodeCache();

// JWT secret from environment variable
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined!");
}
const JWT_SECRET = process.env.JWT_SECRET;

const jwtMiddleware = async (c, next) => {
  const bearerTokenPattern = /^Bearer\s(\S+)$/;
  const authHeader = c.req.headers.get("authorization");
  const match = authHeader?.match(bearerTokenPattern);
  const token = match ? match[1] : null;

  if (!token) {
    return c.json({ error: "No token provided" }, 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token was used
    if (usedNonces.get(token)) {
      return c.json({ error: "Token already used" }, 401);
    }

    // If token is verified and wasn't used before, set it as used
    usedNonces.set(token, true);

    // Append user information to the request
    c.req.user = { publicAddress: decoded.publicAddress };

    await next();
  } catch (err) {
    console.log(err);
    return c.json({ error: "Invalid token" }, 401);
  }
};

module.exports = jwtMiddleware;
