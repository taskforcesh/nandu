import { Component, createSignal } from "solid-js";
import { useRouteData } from "@solidjs/router";

/**
 * Hooks Component.
 *
 */
const Hooks: Component = () => {
  const teams = useRouteData<any>();

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-white">Hooks</h1>
      </div>
      <div></div>
    </div>
  );
};

export default Hooks;
