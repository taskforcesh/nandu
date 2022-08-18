import { Component, createMemo, createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import { Icon } from "solid-heroicons";
import {
  home,
  user,
  users,
  folder,
  calendar,
  inbox,
  chartBar,
  plus,
} from "solid-heroicons/solid";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  createDisclosure,
  Text,
  Input,
  Button,
} from "@hope-ui/solid";

import { Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";

import { state, setState } from "../store/state";

import logo from "../assets/nandu_logo.png";
import { Organization, OrganizationsService } from "../services/organizations";

function HeroIcon(icon: any) {
  return (props: any) => <Icon {...props} path={icon} />;
}

const navigation = [
  {
    name: "Profile",
    href: "/",
    icon: HeroIcon(user),
  },
  {
    name: "Packages",
    href: "/packages",
    icon: HeroIcon(folder),
  },
  {
    name: "Teams",
    href: "/teams",
    icon: HeroIcon(users),
  },
  {
    name: "Calendar",
    href: "#",
    icon: HeroIcon(calendar),
  },
  {
    name: "Documents",
    href: "#",
    icon: HeroIcon(inbox),
  },
  {
    name: "Reports",
    href: "#",
    icon: HeroIcon(chartBar),
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

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
  const organizations = props.organizations;
  const location = useLocation();
  const pathname = createMemo(() => parsePath(location.pathname));

  const navigate = useNavigate();

  function logout() {
    setState({ session: void 0 });
    navigate("/login");
  }

  const [newOrganization, setNewOrganization] = createSignal("");
  const updateOrganizationName = (event: any) =>
    setNewOrganization(event.target.value);

  const PlusIcon = HeroIcon(plus);
  const { isOpen, onOpen, onClose } = createDisclosure();

  async function saveOrganization(event: any) {
    // setState({ organization });
    try {
      await OrganizationsService.createOrganization(
        state().session?.user._id!,
        state().session?.token!,
        newOrganization()
      );
    } catch (error) {
      // TODO: Display error
      console.log(error);
    }

    onClose();
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
                options={organizations
                  .map((org: Organization) => org.organizationId)
                  .sort()}
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

              {/* TODO: Refactor into custom component */}
              <Modal
                blockScrollOnMount={false}
                opened={isOpen()}
                onClose={onClose}
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalCloseButton />
                  <ModalHeader>Add Organization</ModalHeader>
                  <ModalBody>
                    <Text fontWeight="$bold"></Text>
                    <Input
                      placeholder="Organization name"
                      onInput={updateOrganizationName}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <button
                      disabled={!newOrganization()}
                      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={saveOrganization}
                    >
                      Save
                    </button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
            {navigation.map((item) => (
              <a
                href={item.href}
                class={classNames(
                  item.href === pathname()
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                )}
              >
                <item.icon
                  class={classNames(
                    item.href === pathname()
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
                <p class="text-sm font-medium text-white text-left">
                  {state().session?.user.name}
                </p>
                <p class="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  {state().session?.user.email}
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
