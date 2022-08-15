import { Component, createSignal } from "solid-js";
import { useNavigate } from "solid-app-router";

import { state } from "../store/state";

/**
 * Dashboard Component.
 *
 */
const Dashboard: Component = () => {
  const navigate = useNavigate();

  if (!state.session?.user) {
    navigate("/login", { replace: true });
  }

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      Nandu Dashboard
    </div>
  );
};

export default Dashboard;
