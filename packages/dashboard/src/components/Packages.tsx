import { Component, For } from "solid-js";
import { useRouteData } from "@solidjs/router";
import { Package } from "../interfaces/package";

/**
 * Dashboard Component.
 *
 */
const Packages: Component = () => {
  const packages = useRouteData<any>();

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-white">Packages</h1>
      </div>
      <For each={packages()}>
        {(pkg: Package, i) => (
          <li>
            {pkg.name} - {pkg.description}
          </li>
        )}
      </For>
      <div></div>
    </div>
  );
};

export default Packages;
