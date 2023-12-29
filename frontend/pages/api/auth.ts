import { NextRequest, NextResponse } from "next/server";

export default function handler(req: NextRequest, res: NextResponse) {
  // Access cookies from the request object
  const accessToken = req.cookies.accessToken;

  // Do something with the accessToken
  if (accessToken) {
    // Handle the token or send it as a response
    res.status(200).json({ isAuthenticated: true });
  } else {
    res.status(401).json({ message: "Access token not found" });
  }
}
