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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <h1 class="text-2xl font-semibold text-white">Packages</h1>
      </div>
      <div class="overflow-hidden bg-gray-800 shadow sm:rounded-md">
        <ul role="list" class="divide-y-4 divide-gray-900">
          <For each={packages()}>
            {(pkg: Package, i) => (
              <li>
                <a href="#" class="block hover:bg-black-50">
                  <div class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                      <p class="truncate uppercase text-sm font-medium text-orange-400">
                        {pkg.name}
                      </p>
                      <div class="ml-2 flex flex-shrink-0">
                        <p class="inline-flex rounded-full bg-amber-500 px-2 text-xs font-semibold leading-5 text-amber-200">
                          v. &nbsp;{pkg.version}
                        </p>
                      </div>
                    </div>

                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <p class="rounded-lg flex items-center text-sm text-gray-200">
                          {pkg.description}
                        </p>
                      </div>
                      <div class="rounded-lg flex items-center text-sm text-gray-200">
                        <svg
                          class="mr-1.5 h-5 w-5 flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <p>
                          <time>
                            Updated on &nbsp;
                            {new Date(pkg.updatedAt).toLocaleDateString()}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
};

export default Packages;
