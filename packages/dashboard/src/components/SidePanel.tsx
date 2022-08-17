import { Component, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

import { state } from "../store/state";

import { Icon } from "solid-heroicons";
import {
  home,
  user,
  users,
  folder,
  calendar,
  inbox,
  chartBar,
} from "solid-heroicons/solid";

function HeroIcon(icon: any) {
  return (props: any) => <Icon {...props} path={icon} />;
}

const navigation = [
  {
    name: "Profile",
    href: "/",
    icon: HeroIcon(user),
    current: true,
  },
  {
    name: "Packages",
    href: "/packages",
    icon: HeroIcon(folder),
    current: false,
  },
  {
    name: "Teams",
    href: "/teams",
    icon: HeroIcon(users),
    current: false,
  },
  {
    name: "Calendar",
    href: "#",
    icon: HeroIcon(calendar),
    current: false,
  },
  {
    name: "Documents",
    href: "#",
    icon: HeroIcon(inbox),
    current: false,
  },
  {
    name: "Reports",
    href: "#",
    icon: HeroIcon(chartBar),
    current: false,
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

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
    <div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div class="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <img
              class="h-8 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=500"
              alt="Workflow"
            />
          </div>
          <nav class="mt-5 px-2 space-y-1">
            {navigation.map((item) => (
              <a
                href={item.href}
                class={classNames(
                  item.current
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                )}
              >
                <item.icon
                  class={classNames(
                    item.current
                      ? "text-gray-300"
                      : "text-gray-400 group-hover:text-gray-300",
                    "mr-4 flex-shrink-0 h-6 w-6"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
        <div class="flex-shrink-0 flex bg-gray-700 p-4">
          <a href="#" class="flex-shrink-0 w-full group block">
            <div class="flex items-center">
              <div>
                <img
                  class="inline-block h-9 w-9 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-white">Tom Cook</p>
                <p class="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  View profile
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
