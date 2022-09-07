import { Component, For } from "solid-js";
import { useRouteData, useParams } from "@solidjs/router";

import { Table, Thead, Tr, Th, Tbody, Td } from "@hope-ui/solid";

import AddTeam from "./AddTeam";
import RemoveUser from "./RemoveUser";

import { Team } from "../services/teams";
import { sessionState, state } from "../store/state";
import { TeamsService } from "../services/teams";

/**
 * Dashboard Component.
 *
 */
const TeamPackages: Component = () => {
  const [packages, setPackages] = useRouteData<any>();

  const params = useParams();

  async function addPackage(team: string, userName: string) {
    try {
      await TeamsService.addMember(
        sessionState().session?.token!,
        state.currentOrganizationId!,
        userName,
        team
      );
      setPackages([{ name: userName }, ...packages()]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removePackage(team: Team) {
    await TeamsService.removeTeam(
      sessionState().session?.token!,
      team.name,
      state.currentOrganizationId!
    );
    setPackages(packages().filter((u: Team) => u.name !== team.name));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <h1 class="text-2xl font-semibold text-white">
          Team {params.team} Packages
        </h1>
      </div>

      <div class="flex flex-row justify-start mb-4">
        <AddTeam onAddTeam={addPackage} />
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
                      <RemoveUser user={pkg} onRemoveUser={removePackage} />
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
