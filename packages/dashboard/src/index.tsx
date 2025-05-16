/* @refresh reload */
import { render } from "solid-js/web";
import { HopeProvider, HopeThemeConfig } from "@hope-ui/solid";

// Updated Tailwind import path for newer versions
import "tailwindcss";

import "./index.css";
import App from "./App";

const config: HopeThemeConfig = {
  initialColorMode: "dark", // 2. Add your color mode
};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
