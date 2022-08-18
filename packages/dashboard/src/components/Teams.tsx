import { Component, createSignal } from "solid-js";
import { useRouteData } from "@solidjs/router";

/**
 * Dashboard Component.
 *
 */
const Teams: Component = () => {
  const teams = useRouteData<any>();

  return (
    <div>
      <h1>My Teams!</h1>
      <div></div>
    </div>
  );
};

export default Teams;
