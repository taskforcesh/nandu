import { Component, createSignal } from "solid-js";
import { useNavigate } from "solid-app-router";

import { state } from "../store/state";

/**
 * Sidepanel Component.
 *
 */
const SidePanel: Component = () => {
  const navigate = useNavigate();

  if (!state.session?.user) {
    navigate("/login", { replace: true });
  }

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <div>Select Organization</div>
      <div>Teams</div>
      <div>Packages</div>
      <div>Hooks</div>
    </div>
  );
};

export default SidePanel;
