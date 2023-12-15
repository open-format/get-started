import { Chains, OpenFormatProvider } from "@openformat/react";
import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <OpenFormatProvider config={{ networks: [Chains.polygonMumbai] }}>
    <App />
  </OpenFormatProvider>
);
