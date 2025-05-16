import { Component, For, createResource } from "solid-js";
import { useParams, query } from "@solidjs/router";

import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import RemoveResource from "./RemoveResource";

import { state } from "../store/state";
import { TeamsService } from "../services/teams";
import AddTeamPackage from "./AddTeamPackage";

const getTeamPackages = query(
  async (scope: string, team: string) => {
    return await TeamsService.listPackages(scope, team);
  },
  "teamPackages" // Cache key
);

/**
 * Dashboard Component.
 *
 */
const TeamPackages: Component = () => {
  const params = useParams();
  const [packages, { mutate: setPackages }] = createResource(
    () => [params.scope, params.team],
    ([scope, team]) => getTeamPackages(scope, team)
  );

  async function addPackage(pkg: { name: string; permissions: string }) {
    try {
      await TeamsService.addPackage(
        state.currentOrganizationId!,
        params.team,
        pkg
      );
      setPackages([
        { packageId: pkg.name, permissions: pkg.permissions },
        ...packages(),
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removePackage(packageId: string) {
    await TeamsService.removePackage(
      state.currentOrganizationId!,
      params.team,
      packageId
    );
    setPackages(
      packages().filter((u: { packageId: string }) => u.packageId !== packageId)
    );
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <h1 class="text-2xl font-semibold text-white">
          Team {params.team} Packages
        </h1>
      </div>

      <div class="flex flex-row justify-start mb-4">
        <AddTeamPackage onAddTeamPackage={addPackage} />
      </div>

      <div class="border-2 border-gray-200 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Permissions</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={packages()}>
              {(pkg: any, i) => (
                <Tr>
                  <Td>{pkg.packageId}</Td>
                  <Td>{pkg.permissions}</Td>
                  <Td>
                    <div class="flex flex-row justify-start gap-x-1">
                      <RemoveResource
                        resourceId={pkg.packageId}
                        resourceType="Team Package"
                        resourceName={pkg.packageId}
                        onRemoveResource={() => removePackage(pkg.packageId)}
                      />
                    </div>
                  </Td>
                </Tr>
              )}
            </For>
          </Tbody>
        </Table>
      </div>
    </div>
  );
};

export default TeamPackages;
