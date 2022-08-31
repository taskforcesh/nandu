import { Component, createMemo, createSignal, mergeProps } from "solid-js";
import { useLocation, useNavigate, NavLink } from "@solidjs/router";

import { Icon } from "solid-heroicons";
import {
  user,
  users,
  folder,
  plus,
  lightningBolt,
  userGroup,
} from "solid-heroicons/solid";

import { createDisclosure } from "@hope-ui/solid";

import { Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";

import { sessionState, setSessionState } from "../store/state";

import logo from "../assets/nandu_logo.png";
import { Organization } from "../services/organizations";
import AddOrganization from "./AddOrganization";
import { classNames } from "../utils";

function HeroIcon(icon: any) {
  return (props: any) => <Icon {...props} path={icon} />;
}

const navigation = [
  {
    name: "Profile",
    href: "",
    icon: HeroIcon(user),
  },
  {
    name: "Packages",
    href: "packages",
    icon: HeroIcon(folder),
  },
  {
    name: "Users",
    href: "users",
    icon: HeroIcon(users),
  },
  {
    name: "Teams",
    href: "teams",
    icon: HeroIcon(userGroup),
  },
  {
    name: "Hooks",
    href: "hooks",
    icon: HeroIcon(lightningBolt),
  },
];

function parsePath(str: string) {
  const to = str.replace(/^.*?#/, "");
  // Hash-only hrefs like `#foo` from plain anchors will come in as `/#foo` whereas a link to
  // `/foo` will be `/#/foo`. Check if the to starts with a `/` and if not append it as a hash
  // to the current path so we can handle these in-page anchors correctly.
  if (!to.startsWith("/")) {
    const [, path = "/"] = window.location.hash.split("#", 2);
    return `${path}#${to}`;
  }
  return to;
}

/**
 * Sidepanel Component.
 *
 */
const SidePanel: Component<any> = (props: any) => {
  const merged = mergeProps(
    {
      organizations: [],
      selectedOrganization: null,
      onAddOrganization: () => void 0,
      onOrganizationSelect: () => void 0,
    },
    props
  );

  const navigate = useNavigate();

  function logout() {
    setSessionState({ session: void 0 });
    navigate("/login");
  }

  const PlusIcon = HeroIcon(plus);
  const { isOpen, onOpen, onClose } = createDisclosure();

  async function saveOrganization(organization: any) {
    console.log("Adding organization", organization);
    merged.onAddOrganization(organization);
  }

  return (
    <div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div class="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <img class="h-30 w-auto" src={logo} alt="Workflow" />
          </div>
          <nav class="mt-5 px-2 space-y-1">
            <div class="flex flex-row">
              <Select
                class="org-select bg-gray-600 text-white mb-2 w-full"
                initialValue={merged.selectedOrganization}
                options={merged.organizations
                  .map((org: Organization) => org.organizationId)
                  .sort()}
                onChange={(value) => merged.onOrganizationSelect(value)}
                placeholder="Choose organization"
              />

              <button
                type="button"
                onClick={onOpen}
                class={classNames(
                  "mr-4 flex-shrink-0 h-8 w-8 ml-2",
                  "text-gray-100 border border-gray-700 hover:bg-gray-700 hover:text-white",
                  "focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full",
                  "text-sm p-2.5 text-center inline-flex items-center dark:border-gray-500",
                  "dark:text-gray-100 dark:hover:text-white dark:focus:ring-gray-800"
                )}
              >
                <PlusIcon aria-hidden="true" />
                <span class="sr-only">Icon description</span>
              </button>

              <AddOrganization
                isOpen={isOpen}
                onClose={onClose}
                onAddOrganization={saveOrganization}
              />
            </div>
            {navigation.map((item) => (
              <NavLink
                href={`/${merged.selectedOrganization}/${item.href}`}
                activeClass="bg-gray-900 text-white"
                inactiveClass="text-gray-300 hover:bg-gray-700 hover:text-white"
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
                end={true}
              >
                <item.icon
                  class="mr-4 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
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
                <p class="text-sm font-medium text-white text-left">
                  {sessionState().session?.user.name}
                </p>
                <p class="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  {sessionState().session?.user.email}
                </p>
              </div>
              <div>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
