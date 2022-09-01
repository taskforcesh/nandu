import { Component, For } from "solid-js";
import { useRouteData, useNavigate, useLocation } from "@solidjs/router";

import { Table, Thead, Tr, Th, Tbody, Td, Button } from "@hope-ui/solid";

import AddTeam from "./AddTeam";
import RemoveUser from "./RemoveUser";

import { Team } from "../services/teams";
import { sessionState, state } from "../store/state";
import { TeamsService } from "../services/teams";

/**
 * Dashboard Component.
 *
 */
const Teams: Component = () => {
  const [teams, setTeams] = useRouteData<any>();

  const navigate = useNavigate();
  const location = useLocation();

  async function saveTeam(values: Team) {
    try {
      await TeamsService.addTeam(
        sessionState().session?.token!,
        values,
        state.currentOrganizationId!
      );
      setTeams([values, ...teams()]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeTeam(team: Team) {
    await TeamsService.removeTeam(
      sessionState().session?.token!,
      team.name,
      state.currentOrganizationId!
    );
    setTeams(teams().filter((u: Team) => u.name !== team.name));
  }

  return (
    <div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h1 class="text-2xl font-semibold text-white">Teams</h1>
      </div>

      <div class="flex flex-row justify-start mb-4">
        <AddTeam onAddTeam={saveTeam} />
      </div>

      <div class="border-2 border-gray-200 rounded-lg h-full">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <For each={teams()}>
              {(team: any, i) => (
                <Tr>
                  <Td>{team.name}</Td>
                  <Td>{team.description}</Td>
                  <Td>
                    <div class="flex flex-row justify-start gap-x-1">
                      <Button
                        onClick={() =>
                          navigate(`${location.pathname}/${team.name}/members`)
                        }
                        size="lg"
                        compact
                      >
                        Members
                      </Button>
                      <Button
                        onClick={() =>
                          navigate(`${location.pathname}/${team.name}/packages`)
                        }
                        size="lg"
                        compact
                      >
                        Packages
                      </Button>
                      <RemoveUser user={team} onRemoveUser={removeTeam} />
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

export default Teams;
