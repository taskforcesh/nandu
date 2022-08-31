import { Component, createSignal } from "solid-js";
import { Outlet, useNavigate, useRouteData } from "@solidjs/router";

import SidePanel from "./SidePanel";
import { OrganizationsService } from "../services/organizations";
import { sessionState, state, setState } from "../store/state";

/**
 * Dashboard Component.
 *
 */
const Dashboard: Component = () => {
  const [organizations, setOrganizations] = createSignal(useRouteData<any>()());
  const navigate = useNavigate();

  return (
    <div class="hope-ui-dark">
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
              sessionState().session?.token!,
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
      <div class="md:pl-64 flex flex-col flex-1 text-white">
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
      </div>
    </div>
  );
};

export default Dashboard;
