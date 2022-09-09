import { Component, createSignal, For, Show } from "solid-js";
import { Outlet, useNavigate, useRouteData } from "@solidjs/router";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
} from "@hope-ui/solid";

import SidePanel from "./SidePanel";
import { OrganizationsService } from "../services/organizations";
import { sessionState, state, setState } from "../store/state";
import { AlertsService } from "../services/alerts";

/**
 * Dashboard Component.
 *
 */
const Dashboard: Component = () => {
  const [organizations, setOrganizations] = createSignal(useRouteData<any>()());
  const navigate = useNavigate();

  return (
    <div class="hope-ui-dark h-screen">
      <div class="relative h-screen md:pl-64 flex flex-col flex-1 text-white">
        <div class="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            class="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span class="sr-only">Open sidebar</span>
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <main class="flex-1">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div class="py-4">
                <Outlet />
              </div>
            </div>
          </div>
        </main>

        <div class="absolute bottom-10 w-full">
          <For each={state.alerts}>
            {(alert: any, i) => (
              <Alert status={alert.status}>
                <AlertIcon mr="$2_5" />
                <AlertTitle mr="$2_5">{alert.title}</AlertTitle>

                <Show when={alert.description}>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Show>
                <CloseButton
                  onClick={() => AlertsService.clearAlert(i())}
                  position="absolute"
                  right="8px"
                  top="8px"
                />
              </Alert>
            )}
          </For>
        </div>
      </div>

      <SidePanel
        organizations={organizations()}
        selectedOrganization={state.currentOrganizationId}
        onOrganizationSelect={(organizationId: string) => {
          setState({ currentOrganizationId: organizationId });
          navigate(`/${organizationId}`);
        }}
        onAddOrganization={async (organization: any) => {
          try {
            await OrganizationsService.createOrganization(
              sessionState().session?.user._id!,
              organization.organizationId
            );
            setOrganizations([organization, ...organizations()]);
            setState({ currentOrganizationId: organization.organizationId });
          } catch (error) {
            // TODO: Display error
            console.log(error);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
