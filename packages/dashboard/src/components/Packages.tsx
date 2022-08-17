import { Component, createSignal } from "solid-js";
import { useRouteData } from "@solidjs/router";

/**
 * Dashboard Component.
 *
 */
const Packages: Component = () => {
  const packages = useRouteData<any>();

  console.log(packages, packages());

  return (
    <div>
      <h1>My Packages!</h1>
      <div></div>
    </div>
  );
};

export default Packages;
