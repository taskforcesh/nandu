/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { HopeProvider, HopeThemeConfig } from "@hope-ui/solid";

import "tailwindcss/tailwind.css";

import "./index.css";
import App from "./App";

const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      primary9: "salmon",
    },
  },
};

render(
  () => (
    <HopeProvider config={config}>
      <Router>
        <App />
      </Router>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
